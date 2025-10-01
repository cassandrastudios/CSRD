import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, History, Settings, Waves } from "lucide-react";
import { TrainingSession } from "@/components/TrainingSession";
import { CustomTableBuilder } from "@/components/CustomTableBuilder";

type View = "home" | "o2-table" | "co2-table" | "custom" | "history" | "settings";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("home");
  const [customTable, setCustomTable] = useState<any>(null);

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

  return (
    <div className="min-h-screen bg-gradient-ocean">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Waves className="w-12 h-12 text-secondary" />
            <h1 className="text-5xl font-bold text-primary-foreground">Apnea Trainer</h1>
          </div>
          <p className="text-xl text-primary-foreground/80">Master your breath, extend your limits</p>
        </div>

        {/* Quick Start Section */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
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

        {/* Custom Table */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <Card className="bg-card/50 backdrop-blur-sm border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-secondary" />
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
        <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Card className="bg-card/50 backdrop-blur-sm border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-secondary" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold font-mono text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                </div>
                <div>
                  <p className="text-3xl font-bold font-mono text-secondary">0:00</p>
                  <p className="text-sm text-muted-foreground">Best Hold</p>
                </div>
                <div>
                  <p className="text-3xl font-bold font-mono text-accent">0</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
