import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Plus, 
  Copy, 
  Edit, 
  Trash2, 
  Settings,
  Target,
  Clock,
  Zap
} from 'lucide-react';
import { TrainingSession } from '@/components/TrainingSession';
import { CustomTableBuilder } from '@/components/CustomTableBuilder';
import { ProgramsView } from '@/components/ProgramsView';

type TrainView = 'tables' | 'custom' | 'programs';

const Train = () => {
  const [currentView, setCurrentView] = useState<TrainView>('tables');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Pre-built O2 and CO2 tables
  const preBuiltTables = [
    {
      id: 'o2-basic',
      name: 'O2 Table - Basic',
      type: 'O2',
      description: 'Beginner oxygen deprivation training',
      rounds: 8,
      totalTime: '16:00',
      difficulty: 'Beginner'
    },
    {
      id: 'o2-intermediate',
      name: 'O2 Table - Intermediate',
      type: 'O2',
      description: 'Intermediate oxygen deprivation training',
      rounds: 10,
      totalTime: '25:00',
      difficulty: 'Intermediate'
    },
    {
      id: 'co2-basic',
      name: 'CO2 Table - Basic',
      type: 'CO2',
      description: 'Beginner carbon dioxide tolerance',
      rounds: 8,
      totalTime: '20:00',
      difficulty: 'Beginner'
    },
    {
      id: 'co2-intermediate',
      name: 'CO2 Table - Intermediate',
      type: 'CO2',
      description: 'Intermediate carbon dioxide tolerance',
      rounds: 10,
      totalTime: '30:00',
      difficulty: 'Intermediate'
    }
  ];

  // Custom tables (would be loaded from database)
  const customTables = [
    {
      id: 'custom-1',
      name: 'My Custom Table',
      type: 'Custom',
      description: 'Personalized training routine',
      rounds: 6,
      totalTime: '15:00',
      difficulty: 'Custom'
    }
  ];

  const handleStartTable = (tableId: string) => {
    setSelectedTable(tableId);
    // Start training session with selected table
  };

  const handleEditTable = (tableId: string) => {
    // Open edit modal
    console.log('Edit table:', tableId);
  };

  const handleDuplicateTable = (tableId: string) => {
    // Duplicate table
    console.log('Duplicate table:', tableId);
  };

  const handleDeleteTable = (tableId: string) => {
    // Delete table with confirmation
    console.log('Delete table:', tableId);
  };

  if (selectedTable) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setSelectedTable(null)}
            className="mb-4"
          >
            ← Back to Tables
          </Button>
        </div>
        <TrainingSession />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary-foreground mb-2">
          Train
        </h1>
        <p className="text-muted-foreground">
          Choose your training method and start your breath-hold journey
        </p>
      </div>

      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as TrainView)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tables">Quick Start Tables</TabsTrigger>
          <TabsTrigger value="custom">Custom Tables</TabsTrigger>
          <TabsTrigger value="programs">Training Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {preBuiltTables.map((table) => (
              <Card key={table.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="w-5 h-5" />
                        <span>{table.name}</span>
                      </CardTitle>
                      <CardDescription>{table.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{table.difficulty}</div>
                      <div className="text-xs text-muted-foreground">{table.rounds} rounds</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{table.totalTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4" />
                        <span>{table.type}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleStartTable(table.id)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Your Custom Tables</h3>
            <Button className="bg-green-500 hover:bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Create New Table
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {customTables.map((table) => (
              <Card key={table.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="w-5 h-5" />
                        <span>{table.name}</span>
                      </CardTitle>
                      <CardDescription>{table.description}</CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" onClick={() => handleEditTable(table.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDuplicateTable(table.id)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteTable(table.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{table.totalTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4" />
                        <span>{table.type}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleStartTable(table.id)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="programs">
          <ProgramsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Train;
