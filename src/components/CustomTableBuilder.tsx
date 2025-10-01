import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

interface CustomTableBuilderProps {
  onStart: (table: { rounds: number; holdTimes: number[]; restTimes: number[] }) => void;
  onBack: () => void;
}

export const CustomTableBuilder = ({ onStart, onBack }: CustomTableBuilderProps) => {
  const [rounds, setRounds] = useState(8);
  const [startHold, setStartHold] = useState(60);
  const [endHold, setEndHold] = useState(150);
  const [startRest, setStartRest] = useState(120);
  const [endRest, setEndRest] = useState(120);
  const [tableType, setTableType] = useState<"O2" | "CO2">("O2");

  const generateTable = () => {
    let holdTimes: number[] = [];
    let restTimes: number[] = [];

    if (tableType === "O2") {
      // O2: Increasing hold times, fixed rest
      const holdIncrement = (endHold - startHold) / (rounds - 1);
      holdTimes = Array.from({ length: rounds }, (_, i) => Math.round(startHold + holdIncrement * i));
      restTimes = Array(rounds).fill(startRest);
    } else {
      // CO2: Fixed hold times, decreasing rest
      holdTimes = Array(rounds).fill(startHold);
      const restDecrement = (startRest - endRest) / (rounds - 1);
      restTimes = Array.from({ length: rounds }, (_, i) => Math.round(startRest - restDecrement * i));
    }

    return { rounds, holdTimes, restTimes };
  };

  const handleStart = () => {
    const table = generateTable();
    onStart(table);
  };

  const previewTable = generateTable();

  return (
    <div className="min-h-screen bg-gradient-ocean">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="text-primary-foreground mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-primary-foreground">Custom Table Builder</h1>
          <p className="text-primary-foreground/80 mt-2">Create your personalized training session</p>
        </div>

        <div className="space-y-6">
          {/* Table Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Table Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={tableType === "O2" ? "default" : "outline"}
                  onClick={() => setTableType("O2")}
                  className="h-20"
                >
                  <div>
                    <p className="font-semibold">O2 Table</p>
                    <p className="text-xs">Increasing hold</p>
                  </div>
                </Button>
                <Button
                  variant={tableType === "CO2" ? "default" : "outline"}
                  onClick={() => setTableType("CO2")}
                  className="h-20"
                >
                  <div>
                    <p className="font-semibold">CO2 Table</p>
                    <p className="text-xs">Decreasing rest</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rounds">Number of Rounds</Label>
                <Input
                  id="rounds"
                  type="number"
                  min={3}
                  max={15}
                  value={rounds}
                  onChange={(e) => setRounds(parseInt(e.target.value) || 8)}
                />
              </div>

              {tableType === "O2" ? (
                <>
                  <div>
                    <Label htmlFor="startHold">Starting Hold Time (seconds)</Label>
                    <Input
                      id="startHold"
                      type="number"
                      min={30}
                      max={300}
                      value={startHold}
                      onChange={(e) => setStartHold(parseInt(e.target.value) || 60)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endHold">Ending Hold Time (seconds)</Label>
                    <Input
                      id="endHold"
                      type="number"
                      min={30}
                      max={300}
                      value={endHold}
                      onChange={(e) => setEndHold(parseInt(e.target.value) || 150)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rest">Rest Time (seconds)</Label>
                    <Input
                      id="rest"
                      type="number"
                      min={30}
                      max={300}
                      value={startRest}
                      onChange={(e) => setStartRest(parseInt(e.target.value) || 120)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="holdTime">Hold Time (seconds)</Label>
                    <Input
                      id="holdTime"
                      type="number"
                      min={30}
                      max={300}
                      value={startHold}
                      onChange={(e) => setStartHold(parseInt(e.target.value) || 120)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startRest">Starting Rest Time (seconds)</Label>
                    <Input
                      id="startRest"
                      type="number"
                      min={30}
                      max={300}
                      value={startRest}
                      onChange={(e) => setStartRest(parseInt(e.target.value) || 120)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endRest">Ending Rest Time (seconds)</Label>
                    <Input
                      id="endRest"
                      type="number"
                      min={15}
                      max={300}
                      value={endRest}
                      onChange={(e) => setEndRest(parseInt(e.target.value) || 30)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {previewTable.holdTimes.map((hold, idx) => (
                  <div key={idx} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                    <span className="font-semibold">Round {idx + 1}:</span>
                    <span>
                      Hold {Math.floor(hold / 60)}:{(hold % 60).toString().padStart(2, "0")} | 
                      Rest {Math.floor(previewTable.restTimes[idx] / 60)}:{(previewTable.restTimes[idx] % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Start Button */}
          <Button onClick={handleStart} size="lg" className="w-full">
            Start Training Session
          </Button>
        </div>
      </div>
    </div>
  );
};
