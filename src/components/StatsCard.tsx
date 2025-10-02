import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Trophy, Calendar } from "lucide-react";

const StatsCard = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<number>(0);
  const [personalBest, setPersonalBest] = useState<number>(0);
  const [totalSessions, setTotalSessions] = useState<number>(0);

  useEffect(() => {
    if (!user) return;

    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    // Fetch streak
    const { data: streakData } = await supabase
      .from("streaks")
      .select("streak_count")
      .eq("user_id", user!.id)
      .single();

    if (streakData) {
      setStreak(streakData.streak_count);
    }

    // Fetch personal best
    const { data: pbData } = await supabase
      .from("personal_bests")
      .select("max_hold_time")
      .eq("user_id", user!.id)
      .single();

    if (pbData) {
      setPersonalBest(pbData.max_hold_time);
    }

    // Count total sessions
    const { count } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id);

    setTotalSessions(count || 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-premium" />
            <p className="text-2xl font-bold">{formatTime(personalBest)}</p>
            <p className="text-xs text-muted-foreground">Personal Best</p>
          </div>
          <div className="text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{totalSessions}</p>
            <p className="text-xs text-muted-foreground">Total Sessions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
