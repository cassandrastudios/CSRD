import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Pause, Play, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useVoiceGuidance } from "@/hooks/useVoiceGuidance";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type SessionType = "O2" | "CO2" | "CUSTOM";
type Phase = "ready" | "breathe" | "hold" | "complete";

interface TrainingSessionProps {
  type: SessionType;
  customTable?: {
    rounds: number;
    holdTimes: number[];
    restTimes: number[];
  };
  onComplete: () => void;
  onBack: () => void;
}

// Default presets
const O2_PRESET = {
  rounds: 8,
  holdTimes: [60, 75, 90, 105, 120, 135, 150, 150], // Increasing hold times
  restTimes: Array(8).fill(120), // Fixed 2:00 rest
};

const CO2_PRESET = {
  rounds: 8,
  holdTimes: Array(8).fill(120), // Fixed 2:00 hold
  restTimes: [120, 105, 90, 75, 60, 45, 30, 30], // Decreasing rest
};

export const TrainingSession = ({ type, customTable, onComplete, onBack }: TrainingSessionProps) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [timeLeft, setTimeLeft] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const { speak, cancel } = useVoiceGuidance(voiceEnabled);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasSpokenRef = useRef(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const sessionStartTime = useRef(Date.now());
  const completedHolds = useRef<number[]>([]);

  // Get table based on type
  const table = customTable || (type === "O2" ? O2_PRESET : CO2_PRESET);

  // Play sound effect
  const playSound = (frequency: number, duration: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          hasSpokenRef.current = false;
          // Phase transition logic
          if (phase === "ready") {
            playSound(800, 0.2);
            speak("Begin holding your breath");
            setPhase("hold");
            return table.holdTimes[currentRound];
          } else if (phase === "hold") {
            playSound(600, 0.3);
            if (currentRound < table.rounds - 1) {
              speak("Breathe and recover");
              setPhase("breathe");
              return table.restTimes[currentRound];
            } else {
              setPhase("complete");
              speak("Session complete. Excellent work!");
              playSound(1000, 0.5);
              return 0;
            }
          } else if (phase === "breathe") {
            playSound(800, 0.2);
            setCurrentRound((r) => r + 1);
            speak("Next round. Hold your breath");
            setPhase("hold");
            return table.holdTimes[currentRound + 1];
          }
        }
        
        // Give countdown warnings
        if (phase === "hold" && prev === 10 && !hasSpokenRef.current) {
          speak("Ten seconds remaining");
          hasSpokenRef.current = true;
        }
        if (phase === "breathe" && prev === 5 && !hasSpokenRef.current) {
          speak("Prepare for next hold");
          hasSpokenRef.current = true;
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [phase, currentRound, isPaused, table, speak]);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPhaseColor = () => {
    if (phase === "hold") return "text-timer-hold";
    if (phase === "breathe") return "text-timer-breathe";
    if (phase === "complete") return "text-secondary";
    return "text-foreground";
  };

  const getPhaseText = () => {
    if (phase === "ready") return "Get Ready";
    if (phase === "hold") return "Hold Your Breath";
    if (phase === "breathe") return "Breathe & Recover";
    return "Session Complete!";
  };

  const progress = ((currentRound + 1) / table.rounds) * 100;

  const saveSession = async () => {
    if (!user) return;

    const sessionDuration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
    const maxHold = Math.max(...table.holdTimes);
    const avgHold = table.holdTimes.reduce((a, b) => a + b, 0) / table.holdTimes.length;

    try {
      // Save session
      await supabase.from("sessions").insert({
        user_id: user.id,
        duration: sessionDuration,
        rounds: table.rounds,
        max_hold: maxHold,
        avg_hold: avgHold,
        session_type: type,
      });

      // Update streak
      await supabase.rpc("update_streak", { p_user_id: user.id });

      // Update personal best
      await supabase.rpc("update_personal_best", { 
        p_user_id: user.id,
        p_hold_time: maxHold 
      });

      toast({
        title: "Session saved!",
        description: "Your progress has been recorded.",
      });
    } catch (error) {
      console.error("Error saving session:", error);
      toast({
        title: "Error",
        description: "Failed to save session.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (phase === "complete") {
      saveSession();
    }
  }, [phase, user]);

  if (phase === "complete") {
    return (
      <div className="min-h-screen bg-gradient-ocean flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center animate-fade-in">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Excellent Work!</h2>
            <p className="text-muted-foreground">You completed {table.rounds} rounds</p>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total Rounds</p>
                <p className="text-2xl font-bold font-mono">{table.rounds}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Longest Hold</p>
                <p className="text-2xl font-bold font-mono">{formatTime(Math.max(...table.holdTimes))}</p>
              </div>
            </div>

            <Button onClick={onComplete} className="w-full" size="lg">
              Finish Session
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-ocean flex flex-col">
      {/* Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="text-primary-foreground/80 text-sm">{type} Table</p>
            <p className="text-primary-foreground font-semibold">Round {currentRound + 1} / {table.rounds}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="text-primary-foreground"
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Timer */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Phase Label */}
          <div className="text-center">
            <p className="text-xl text-primary-foreground/80 mb-2">{getPhaseText()}</p>
          </div>

          {/* Timer Display */}
          <div className="relative">
            <div className="text-center">
              <div className={`text-8xl md:text-9xl font-bold font-mono ${getPhaseColor()} animate-pulse-gentle`}>
                {formatTime(timeLeft)}
              </div>
              {/* Phase indicator */}
              <div className="mt-4">
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  phase === 'ready' ? 'bg-blue-500/20 text-blue-300' :
                  phase === 'hold' ? 'bg-red-500/20 text-red-300' :
                  phase === 'breathe' ? 'bg-green-500/20 text-green-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {phase === 'ready' ? 'GET READY' :
                   phase === 'hold' ? 'HOLD YOUR BREATH' :
                   phase === 'breathe' ? 'BREATHE & RECOVER' :
                   'COMPLETE'}
                </div>
              </div>
            </div>
            
            {/* Progress Ring Visual */}
            <div className="mt-8">
              <Progress value={progress} className="h-3" />
              <p className="text-center text-primary-foreground/60 text-sm mt-2">
                Session Progress: {Math.round(progress)}%
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-6">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsPaused(!isPaused)}
              className="rounded-full w-20 h-20 bg-white/10 border-white/20 hover:bg-white/20"
            >
              {isPaused ? <Play className="w-8 h-8" /> : <Pause className="w-8 h-8" />}
            </Button>
            
            {currentRound < table.rounds - 1 && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const nextRound = currentRound + 1;
                  setCurrentRound(nextRound);
                  setPhase("hold");
                  setTimeLeft(table.holdTimes[nextRound]);
                  hasSpokenRef.current = false;
                  speak("Next round. Hold your breath");
                }}
                className="rounded-full w-20 h-20 bg-red-500/20 border-red-500/30 hover:bg-red-500/30 text-red-300"
              >
                <SkipForward className="w-8 h-8" />
              </Button>
            )}
          </div>

          {/* Next Round Preview */}
          {phase === "breathe" && currentRound < table.rounds - 1 && (
            <div className="text-center text-primary-foreground/60 text-sm">
              Next hold: {formatTime(table.holdTimes[currentRound + 1])}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
