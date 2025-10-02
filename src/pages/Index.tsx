import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, History, Settings as SettingsIcon, Waves, BookOpen, LogIn, Crown } from "lucide-react";
import { TrainingSession } from "@/components/TrainingSession";
import { CustomTableBuilder } from "@/components/CustomTableBuilder";
import { ProgramsView } from "@/components/ProgramsView";
import Settings from "@/pages/Settings";
import StatsCard from "@/components/StatsCard";
import AdMob from "@/components/AdMob";
import { PremiumUpgrade } from "@/components/PremiumUpgrade";
import { TrainingTable } from "@/types/training";

type View = "home" | "o2-table" | "co2-table" | "custom" | "history" | "settings" | "programs";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [currentView, setCurrentView] = useState<View>("home");
  const [customTable, setCustomTable] = useState<TrainingTable | null>(null);
  const [programSession, setProgramSession] = useState<TrainingTable | null>(null);
  const [showPremiumUpgrade, setShowPremiumUpgrade] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (currentView === "o2-table") {
    return (
      <TrainingSession
        type="O2"
        onComplete={() => setCurrentView("home")}
        onBack={() => setCurrentView("home")}
      />
    );
  }

  if (currentView === "co2-table") {
    return (
      <TrainingSession
        type="CO2"
        onComplete={() => setCurrentView("home")}
        onBack={() => setCurrentView("home")}
      />
    );
  }

  if (currentView === "programs") {
    if (!programSession) {
      return (
        <ProgramsView
          onSelectSession={(session) => {
            setProgramSession(session);
          }}
          onBack={() => setCurrentView("home")}
        />
      );
    }
    return (
      <TrainingSession
        type="CUSTOM"
        customTable={programSession}
        onComplete={() => {
          setProgramSession(null);
          setCurrentView("home");
        }}
        onBack={() => {
          setProgramSession(null);
          setCurrentView("home");
        }}
      />
    );
  }

  if (currentView === "custom") {
    if (!customTable) {
      return (
        <CustomTableBuilder
          onStart={(table) => {
            setCustomTable(table);
          }}
          onBack={() => setCurrentView("home")}
        />
      );
    }
    return (
      <TrainingSession
        type="CUSTOM"
        customTable={customTable}
        onComplete={() => {
          setCustomTable(null);
          setCurrentView("home");
        }}
        onBack={() => {
          setCustomTable(null);
          setCurrentView("home");
        }}
      />
    );
  }

  if (currentView === "settings") {
    return <Settings />;
  }

  return (
    <div className="min-h-screen bg-gradient-ocean">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/history")}>
              <History className="w-5 h-5 text-primary-foreground" />
            </Button>
            <div className="flex items-center gap-3">
              <Waves className="w-12 h-12 text-secondary" />
              <h1 className="text-5xl font-bold text-primary-foreground">Apnea Trainer</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCurrentView("settings")}>
              <SettingsIcon className="w-5 h-5 text-primary-foreground" />
            </Button>
          </div>
          <p className="text-xl text-primary-foreground/80">Master your breath, extend your limits</p>
          {profile?.is_premium ? (
            <div className="mt-2 flex items-center justify-center gap-2 text-premium">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-semibold">Premium Member</span>
            </div>
          ) : (
            <Button
              onClick={() => setShowPremiumUpgrade(true)}
              className="mt-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium - $4.99
            </Button>
          )}
        </div>

        {/* AdMob for free users */}
        <AdMob adId="ca-app-pub-3940256099942544/6300978111" />

        {/* Quick Start Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary-foreground mb-4">Quick Start</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2 hover:shadow-xl transition-all cursor-pointer" onClick={() => setCurrentView("o2-table")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-secondary" />
                  O2 Table
                </CardTitle>
                <CardDescription>Increase hold time, fixed rest</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Start: 1:00 → End: 2:30</p>
                <p className="text-sm text-muted-foreground">8 rounds, 2:00 rest</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all cursor-pointer" onClick={() => setCurrentView("co2-table")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-secondary" />
                  CO2 Table
                </CardTitle>
                <CardDescription>Fixed hold, decreasing rest</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Hold: 2:00 (fixed)</p>
                <p className="text-sm text-muted-foreground">8 rounds, 2:00 → 0:30 rest</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Training Programs */}
        <div className="mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-2 hover:shadow-xl transition-all cursor-pointer" onClick={() => setCurrentView("programs")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-secondary" />
                Training Programs
              </CardTitle>
              <CardDescription>Follow structured beginner to advanced programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">Beginner</span>
                <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-semibold">Intermediate</span>
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold">Advanced</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom Table */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Card className="bg-card/50 backdrop-blur-sm border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-secondary" />
                Custom Table
              </CardTitle>
              <CardDescription>Build your own training program</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setCurrentView("custom")}
                variant="outline" 
                className="w-full"
              >
                Create Custom Session
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Preview */}
        <div>
          <StatsCard />
        </div>

        {/* AdSense for free users */}
        <AdSense slot="9876543210" />
      </div>

      {/* Premium Upgrade Modal */}
      {showPremiumUpgrade && (
        <PremiumUpgrade onClose={() => setShowPremiumUpgrade(false)} />
      )}
    </div>
  );
};

export default Index;
