'use client'

import { useState } from 'react';
import { useValueChainStore } from '@/store/useValueChainStore';
import { Player } from '@/types/valueChain';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Building2, Users, Link, Trash2, Edit, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SimpleValueChainCanvas() {
  const { valueChain, selectedPlayer, selectedRelationship, selectPlayer, selectRelationship, deleteRelationship, movePlayerToCategory, updatePlayer, reorderPlayers } = useValueChainStore();
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);

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
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getCategoryBgColor = (category: string) => {
    switch (category) {
      case 'upstream':
        return 'bg-orange-50 border-orange-200';
      case 'own_operations':
        return 'bg-green-50 border-green-200';
      case 'downstream':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleDragStart = (e: React.DragEvent, player: Player) => {
    console.log('Drag started:', player.name, player.category);
    setDraggedPlayer(player);
    e.dataTransfer.effectAllowed = 'move';
  };


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetCategory: string) => {
    e.preventDefault();
    
    if (draggedPlayer && draggedPlayer.category !== targetCategory) {
      movePlayerToCategory(draggedPlayer.id, targetCategory as 'upstream' | 'own_operations' | 'downstream');
    }
    
    setDraggedPlayer(null);
  };

  const handlePlayerDrop = (e: React.DragEvent, targetPlayerId: string) => {
    e.preventDefault();
    
    if (draggedPlayer && targetPlayerId !== draggedPlayer.id) {
      const targetPlayer = valueChain?.players.find(p => p.id === targetPlayerId);
      
      // Only allow reordering within the same category
      if (draggedPlayer.category === targetPlayer?.category) {
        const players = valueChain?.players.filter(p => p.category === draggedPlayer.category) || [];
        const draggedIndex = players.findIndex(p => p.id === draggedPlayer.id);
        const targetIndex = players.findIndex(p => p.id === targetPlayerId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
          // Create new array with reordered players
          const newPlayers = [...players];
          const [draggedItem] = newPlayers.splice(draggedIndex, 1);
          newPlayers.splice(targetIndex, 0, draggedItem);
          
          // Use the new reorderPlayers function
          reorderPlayers(draggedPlayer.category, newPlayers);
          
          console.log('Reordered players:', newPlayers.map(p => p.name));
        }
      }
    }
    
    setDraggedPlayer(null);
  };

  const handleRelationshipClick = (relationship: any) => {
    selectRelationship(relationship);
  };

  const categories = [
    { key: 'upstream', name: 'Upstream', icon: <Truck className="w-5 h-5" /> },
    { key: 'own_operations', name: 'Own Operations', icon: <Building2 className="w-5 h-5" /> },
    { key: 'downstream', name: 'Downstream', icon: <Users className="w-5 h-5" /> }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{valueChain.name}</h2>
        {valueChain.description && (
          <p className="text-sm text-gray-600 mt-1">{valueChain.description}</p>
        )}
      </div>

      {/* All Players Grouped by Category */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-8 p-4 min-w-max">
          {valueChain.players.length === 0 ? (
            <div className="flex items-center justify-center w-full h-full">
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
            categories.map((category) => {
              const players = valueChain.players
                .filter(p => p.category === category.key)
                .sort((a, b) => (a.x || 0) - (b.x || 0));
              if (players.length === 0) return null;
              
              return (
                <div key={category.key} className="flex-shrink-0">
                  {/* Category Header */}
                  <div className={`p-3 rounded-t-lg ${getCategoryColor(category.key)} mb-2`}>
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span className="font-semibold">{category.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {players.length}
                      </Badge>
                    </div>
                  </div>
                  
                      {/* Players in this category */}
                      <div className="flex gap-4">
                        {players.map((player, index) => (
                          <div key={player.id} className="flex items-center">
                            {/* Drop zone before each card */}
                            <div
                              className={`w-2 h-32 bg-gray-200 rounded transition-colors ${
                                draggedPlayer && draggedPlayer.category === player.category && draggedPlayer.id !== player.id
                                  ? 'bg-blue-300' : 'bg-transparent'
                              }`}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handlePlayerDrop(e, player.id)}
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
                                  // This will be handled by the parent component
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
                        {players.length > 0 && (
                          <div
                            className={`w-2 h-32 bg-gray-200 rounded transition-colors ${
                              draggedPlayer && draggedPlayer.category === players[0].category
                                ? 'bg-blue-300' : 'bg-transparent'
                            }`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => {
                              const lastPlayer = players[players.length - 1];
                              handlePlayerDrop(e, lastPlayer.id);
                            }}
                          />
                        )}
                      </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Relationships */}
      {valueChain.relationships.length > 0 && (
        <div className="p-4 bg-white border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Relationships</h3>
          <div className="flex flex-wrap gap-2">
            {valueChain.relationships.map((rel) => {
              const fromPlayer = valueChain.players.find(p => p.id === rel.from);
              const toPlayer = valueChain.players.find(p => p.id === rel.to);
              
              return (
                <div
                  key={rel.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                    selectedRelationship?.id === rel.id ? 'ring-2 ring-purple-500 bg-purple-50' : 'bg-white'
                  }`}
                  onClick={() => handleRelationshipClick(rel)}
                >
                  <Link className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {fromPlayer?.name || 'Unknown'} → {toPlayer?.name || 'Unknown'}
                  </span>
                  {rel.type && (
                    <Badge variant="outline" className="text-xs">
                      {rel.type}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRelationship(rel.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
