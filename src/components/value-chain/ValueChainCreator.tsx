'use client'

import { useState } from 'react';
import { useValueChainStore } from '@/store/useValueChainStore';
import { SimpleValueChainCanvas } from './SimpleValueChainCanvas';
import { PlayerEditor } from './PlayerEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Settings, 
  Download, 
  Upload,
  RotateCcw,
  HelpCircle,
  Plus
} from 'lucide-react';

export function ValueChainCreator() {
  const { valueChain, exportValueChain, clearValueChain, createValueChain } = useValueChainStore();
  const [activeTab, setActiveTab] = useState('canvas');
  const [showPlayerEditor, setShowPlayerEditor] = useState(false);

  const handleCreateValueChain = () => {
    const name = prompt('Enter value chain name:');
    if (name) {
      createValueChain(name);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // You could add validation here
        console.log('Imported value chain:', data);
        // For now, just log it - you'd need to add an import function to the store
      } catch (error) {
        console.error('Error importing value chain:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Value Chain Creator</h1>
            <p className="text-gray-600">
              Map your business ecosystem to understand stakeholder relationships and impacts
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {valueChain ? (
              <>
                <Button
                  onClick={() => setShowPlayerEditor(true)}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Player
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const data = exportValueChain();
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `value-chain-${valueChain.name}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear this value chain?')) {
                      clearValueChain();
                    }
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </>
            ) : (
              <Button onClick={handleCreateValueChain}>
                <Plus className="w-4 h-4 mr-2" />
                Create Value Chain
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="canvas">Canvas</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>
            
            <TabsContent value="canvas" className="flex-1">
              <SimpleValueChainCanvas />
            </TabsContent>
            
            <TabsContent value="analysis" className="flex-1 p-6">
              <div className="h-full">
                {valueChain ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Value Chain Analysis
                        </CardTitle>
                        <CardDescription>
                          Insights and metrics from your value chain mapping
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {valueChain.players.filter(p => p.category === 'upstream').length}
                            </div>
                            <div className="text-sm text-blue-800">Upstream Players</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {valueChain.players.filter(p => p.category === 'own_operations').length}
                            </div>
                            <div className="text-sm text-green-800">Own Operations</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {valueChain.players.filter(p => p.category === 'downstream').length}
                            </div>
                            <div className="text-sm text-purple-800">Downstream Players</div>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-4">High Impact Players</h3>
                          <div className="space-y-2">
                            {valueChain.players
                              .sort((a, b) => (b.impactOnCompany + b.impactFromCompany) - (a.impactOnCompany + a.impactFromCompany))
                              .slice(0, 5)
                              .map((player) => (
                                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <div className="font-medium">{player.name}</div>
                                    <div className="text-sm text-gray-600">{player.category.replace('_', ' ')}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold">
                                      {player.impactOnCompany + player.impactFromCompany}/20
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      In: {player.impactOnCompany} | Out: {player.impactFromCompany}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📊</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No Value Chain to Analyze
                      </h3>
                      <p className="text-gray-600">
                        Create a value chain first to see analysis and insights
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="help" className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      Value Chain Creator Help
                    </CardTitle>
                    <CardDescription>
                      Learn how to use the Value Chain Creator effectively
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Click "Create Value Chain" to start a new mapping</li>
                        <li>Add players using the "Add Player" button in the sidebar</li>
                        <li>Drag players onto the canvas to position them</li>
                        <li>Connect players by dragging from one node to another</li>
                        <li>Use the AI Suggest feature for common industry players</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Player Categories</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-blue-800">Upstream</h4>
                          <p className="text-sm text-blue-700">Suppliers, vendors, and partners who provide inputs to your business</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-800">Own Operations</h4>
                          <p className="text-sm text-green-700">Internal departments, processes, and activities within your organization</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-semibold text-purple-800">Downstream</h4>
                          <p className="text-sm text-purple-700">Customers, distributors, and end users of your products/services</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Impact Scoring</h3>
                      <p className="text-gray-700 mb-2">
                        Each player has two impact scores (1-10):
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li><strong>Impact on Company:</strong> How much this player affects your business</li>
                        <li><strong>Impact from Company:</strong> How much your business affects this player</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Tips for Success</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Start with your most important stakeholders</li>
                        <li>Be specific with player names and descriptions</li>
                        <li>Consider both direct and indirect relationships</li>
                        <li>Regularly update impact scores as relationships evolve</li>
                        <li>Export your value chain for sharing and backup</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
      </div>

      {/* Player Editor Modal */}
      {showPlayerEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <PlayerEditor
              player={null}
              onClose={() => setShowPlayerEditor(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
