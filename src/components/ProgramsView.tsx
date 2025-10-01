import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, ChevronRight } from "lucide-react";
import { trainingPrograms } from "@/data/programs";
import { TrainingTable, TrainingProgram } from "@/types/training";

interface ProgramsViewProps {
  onSelectSession: (table: TrainingTable) => void;
  onBack: () => void;
}

export const ProgramsView = ({ onSelectSession, onBack }: ProgramsViewProps) => {
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);

  if (selectedProgram) {
    return (
      <div className="min-h-screen bg-gradient-ocean">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => setSelectedProgram(null)}
            className="text-primary-foreground mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Programs
          </Button>

          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-primary-foreground">{selectedProgram.name}</h1>
              <Badge className="capitalize">{selectedProgram.level}</Badge>
            </div>
            <p className="text-primary-foreground/80 text-lg mb-2">{selectedProgram.description}</p>
            <p className="text-primary-foreground/60">{selectedProgram.duration} • {selectedProgram.weeks.reduce((acc, week) => acc + week.sessions.length, 0)} sessions</p>
          </div>

          <div className="space-y-6">
            {selectedProgram.weeks.map((week) => (
              <Card key={week.week} className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Week {week.week}</CardTitle>
                  <CardDescription>{week.goal}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {week.sessions.map((session) => (
                    <div
                      key={session.day}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">Day {session.day}</Badge>
                          <span className="font-semibold">{session.type} Table</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.table.rounds} rounds • 
                          {Math.floor(Math.min(...session.table.holdTimes) / 60)}:{(Math.min(...session.table.holdTimes) % 60).toString().padStart(2, '0')} - 
                          {Math.floor(Math.max(...session.table.holdTimes) / 60)}:{(Math.max(...session.table.holdTimes) % 60).toString().padStart(2, '0')}
                        </p>
                        {session.notes && (
                          <p className="text-xs text-muted-foreground italic mt-1">{session.notes}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onSelectSession(session.table)}
                        className="gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Start
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-ocean">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={onBack} className="text-primary-foreground mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Button>

        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-primary-foreground mb-2">Training Programs</h1>
          <p className="text-primary-foreground/80 text-lg">
            Structured progression from beginner to advanced levels
          </p>
        </div>

        <Tabs defaultValue="beginner" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="beginner">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="beginner" className="space-y-4">
            {trainingPrograms
              .filter((p) => p.level === "beginner")
              .map((program) => (
                <Card
                  key={program.id}
                  className="hover:shadow-xl transition-all cursor-pointer border-2 animate-fade-in"
                  onClick={() => setSelectedProgram(program)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2">{program.name}</CardTitle>
                        <CardDescription className="text-base mb-3">
                          {program.description}
                        </CardDescription>
                        <div className="flex gap-3 text-sm text-muted-foreground">
                          <span>📅 {program.duration}</span>
                          <span>
                            🎯 {program.weeks.reduce((acc, week) => acc + week.sessions.length, 0)} sessions
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="intermediate" className="space-y-4">
            {trainingPrograms
              .filter((p) => p.level === "intermediate")
              .map((program) => (
                <Card
                  key={program.id}
                  className="hover:shadow-xl transition-all cursor-pointer border-2 animate-fade-in"
                  onClick={() => setSelectedProgram(program)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2">{program.name}</CardTitle>
                        <CardDescription className="text-base mb-3">
                          {program.description}
                        </CardDescription>
                        <div className="flex gap-3 text-sm text-muted-foreground">
                          <span>📅 {program.duration}</span>
                          <span>
                            🎯 {program.weeks.reduce((acc, week) => acc + week.sessions.length, 0)} sessions
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            {trainingPrograms
              .filter((p) => p.level === "advanced")
              .map((program) => (
                <Card
                  key={program.id}
                  className="hover:shadow-xl transition-all cursor-pointer border-2 animate-fade-in"
                  onClick={() => setSelectedProgram(program)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2">{program.name}</CardTitle>
                        <CardDescription className="text-base mb-3">
                          {program.description}
                        </CardDescription>
                        <div className="flex gap-3 text-sm text-muted-foreground">
                          <span>📅 {program.duration}</span>
                          <span>
                            🎯 {program.weeks.reduce((acc, week) => acc + week.sessions.length, 0)} sessions
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
