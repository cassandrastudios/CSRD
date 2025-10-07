'use client'

import { useState } from 'react';
import { useValueChainStore } from '@/store/useValueChainStore';
import { Player } from '@/types/valueChain';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Building2, Users, Edit, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SimpleValueChainCanvas() {
  const { valueChain, selectedPlayer, selectPlayer } = useValueChainStore();
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  if (!valueChain) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Value Chain Created
          </h3>
          <p className="text-gray-600">
            Create a new value chain to start mapping your business ecosystem
          </p>
        </div>
      </div>
    );
  }

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
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'own_operations':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'downstream':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleDragStart = (e: React.DragEvent, player: Player) => {
    console.log('Drag started:', player.name);
    setDraggedPlayer(player);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(index);
  };

  const handleDragLeave = () => {
    setDraggedOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDraggedOverIndex(null);
    
    if (!draggedPlayer) return;
    
    const players = [...valueChain.players];
    const draggedIndex = players.findIndex(p => p.id === draggedPlayer.id);
    
    if (draggedIndex === -1) return;
    
    // Remove dragged player
    const [draggedItem] = players.splice(draggedIndex, 1);
    
    // Insert at new position
    players.splice(targetIndex, 0, draggedItem);
    
    // Update x positions based on new order
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      x: index * 10
    }));
    
    console.log('Reordering players:', updatedPlayers.map(p => p.name));
    
    // Update the store directly
    useValueChainStore.setState({
      valueChain: {
        ...valueChain,
        players: updatedPlayers,
        updatedAt: new Date().toISOString(),
      }
    });
    
    setDraggedPlayer(null);
  };

  // Sort players by x position
  const sortedPlayers = [...valueChain.players].sort((a, b) => (a.x || 0) - (b.x || 0));

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{valueChain.name}</h2>
        {valueChain.description && (
          <p className="text-sm text-gray-600 mt-1">{valueChain.description}</p>
        )}
      </div>

      {/* Players in horizontal line */}
      <div className="flex-1 p-4">
        {sortedPlayers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Players Added Yet
              </h3>
              <p className="text-gray-600">
                Add players to start building your value chain
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center">
                {/* Drop zone before each card */}
                <div
                  className={`w-2 h-32 rounded transition-colors ${
                    draggedOverIndex === index && draggedPlayer?.id !== player.id
                      ? 'bg-blue-400' : 'bg-transparent'
                  }`}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                />
                
                <Card
                  className={`cursor-grab hover:shadow-md transition-shadow flex-shrink-0 w-80 group ${
                    selectedPlayer?.id === player.id ? 'ring-2 ring-blue-500' : ''
                  } ${
                    draggedPlayer?.id === player.id ? 'opacity-50' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, player)}
                  onClick={() => selectPlayer(player)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                        {getCategoryIcon(player.category)}
                        <div>
                          <h3 className="font-semibold text-base">{player.name}</h3>
                          {player.type && (
                            <p className="text-xs text-gray-500">{player.type}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(player.category)}>
                          {player.category.replace('_', ' ')}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Edit player:', player.id);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {player.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {player.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-lg font-bold text-blue-600">{player.impactOnCompany}</div>
                        <div className="text-xs text-gray-500">Impact On</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-lg font-bold text-green-600">{player.impactFromCompany}</div>
                        <div className="text-xs text-gray-500">Impact From</div>
                      </div>
                      <div className="text-center p-2 bg-gray-100 rounded">
                        <div className="text-lg font-bold text-gray-700">{player.impactOnCompany + player.impactFromCompany}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>
                    
                    {player.industry && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium">Industry:</span>
                        <span>{player.industry}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
            
            {/* Drop zone after the last card */}
            <div
              className={`w-2 h-32 rounded transition-colors ${
                draggedOverIndex === sortedPlayers.length && draggedPlayer
                  ? 'bg-blue-400' : 'bg-transparent'
              }`}
              onDragOver={(e) => handleDragOver(e, sortedPlayers.length)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, sortedPlayers.length)}
            />
          </div>
        )}
      </div>
    </div>
  );
}