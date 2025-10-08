'use client';

import { useState } from 'react';
import { useValueChainStore } from '@/store/useValueChainStore';
import { PlayerEditor } from './PlayerEditor';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Download,
  Trash2,
  Edit,
  Users,
  Building2,
  Truck,
  Link,
  BarChart3,
} from 'lucide-react';

export function ValueChainSidebar() {
  const {
    valueChain,
    selectedPlayer,
    selectedRelationship,
    isEditingPlayer,
    isEditingRelationship,
    createValueChain,
    selectPlayer,
    selectRelationship,
    setEditingPlayer,
    setEditingRelationship,
    deletePlayer,
    deleteRelationship,
    exportValueChain,
    clearValueChain,
  } = useValueChainStore();

  const [showPlayerEditor, setShowPlayerEditor] = useState(false);

  const handleCreateValueChain = () => {
    const name = prompt('Enter value chain name:');
    if (name) {
      createValueChain(name);
    }
  };

  const handleExport = () => {
    const data = exportValueChain();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `value-chain-${valueChain?.name || 'export'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'upstream':
        return <Truck className="w-4 h-4" />;
      case 'own_operations':
        return <Building2 className="w-4 h-4" />;
      case 'downstream':
        return <Users className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'upstream':
        return 'bg-blue-100 text-blue-800';
      case 'own_operations':
        return 'bg-green-100 text-green-800';
      case 'downstream':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!valueChain) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Create Your Value Chain
          </h3>
          <p className="text-gray-600 mb-6">
            Map your business ecosystem to understand stakeholder relationships
            and impacts.
          </p>
          <Button onClick={handleCreateValueChain} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create Value Chain
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            {valueChain.name}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to clear this value chain?')) {
                clearValueChain();
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        {valueChain.description && (
          <p className="text-sm text-gray-600">{valueChain.description}</p>
        )}

        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => {
              selectPlayer(null);
              setEditingPlayer(false);
              setShowPlayerEditor(true);
            }}
            size="sm"
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Value Chain Overview
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {valueChain.players.length}
            </div>
            <div className="text-xs text-gray-500">Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {valueChain.relationships.length}
            </div>
            <div className="text-xs text-gray-500">Relationships</div>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Players</h3>

        {valueChain.players.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-sm text-gray-500">No players added yet</p>
            <Button
              onClick={() => {
                selectPlayer(null);
                setEditingPlayer(false);
                setShowPlayerEditor(true);
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Add First Player
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {valueChain.players.map(player => (
              <div
                key={player.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPlayer?.id === player.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => selectPlayer(player)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(player.category)}
                    <span className="font-medium text-sm">{player.name}</span>
                  </div>
                  <Badge className={getCategoryColor(player.category)}>
                    {player.category.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>In: {player.impactOnCompany}</span>
                  <span>Out: {player.impactFromCompany}</span>
                  <span>
                    Total: {player.impactOnCompany + player.impactFromCompany}
                  </span>
                </div>

                {player.description && (
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {player.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Relationship */}
      {selectedRelationship && valueChain && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Selected Relationship
          </h3>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-sm text-purple-800">
                  {valueChain.players.find(
                    p => p.id === selectedRelationship.from
                  )?.name || 'Unknown'}
                  {' → '}
                  {valueChain.players.find(
                    p => p.id === selectedRelationship.to
                  )?.name || 'Unknown'}
                </span>
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                {selectedRelationship.type || 'relationship'}
              </Badge>
            </div>

            {selectedRelationship.description && (
              <p className="text-xs text-purple-700 mb-2">
                {selectedRelationship.description}
              </p>
            )}

            {selectedRelationship.strength && (
              <p className="text-xs text-purple-600 mb-2">
                Strength: {selectedRelationship.strength}/10
              </p>
            )}

            <Button
              onClick={() => {
                deleteRelationship(selectedRelationship.id);
                selectRelationship(null);
              }}
              variant="destructive"
              size="sm"
              className="w-full mt-2"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Relationship
            </Button>
          </div>
        </div>
      )}

      {/* Player Editor Modal */}
      {showPlayerEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <PlayerEditor
              player={selectedPlayer}
              onClose={() => {
                setShowPlayerEditor(false);
                selectPlayer(null);
                setEditingPlayer(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
