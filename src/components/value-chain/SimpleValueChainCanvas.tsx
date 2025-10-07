'use client'

import { useState, useRef } from 'react';
import { useValueChainStore } from '@/store/useValueChainStore';
import { Player } from '@/types/valueChain';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Building2, Users, Link, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SimpleValueChainCanvas() {
  const { valueChain, selectedPlayer, selectedRelationship, selectPlayer, selectRelationship, deleteRelationship, movePlayerToCategory } = useValueChainStore();
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

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
    setDraggedPlayer(player);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCategory(category);
  };

  const handleDragLeave = () => {
    setDragOverCategory(null);
  };

  const handleDrop = (e: React.DragEvent, targetCategory: string) => {
    e.preventDefault();
    setDragOverCategory(null);
    
    if (draggedPlayer && draggedPlayer.category !== targetCategory) {
      movePlayerToCategory(draggedPlayer.id, targetCategory as 'upstream' | 'own_operations' | 'downstream');
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

      {/* Value Chain Lanes with Horizontal Scroll */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex min-w-max h-full">
        {categories.map((category) => {
          const players = valueChain.players.filter(p => p.category === category.key);
          const isDragOver = dragOverCategory === category.key;
          
          return (
            <div
              key={category.key}
              className={`w-80 border-r border-gray-200 last:border-r-0 ${getCategoryBgColor(category.key)} ${
                isDragOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, category.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, category.key)}
            >
              {/* Category Header */}
              <div className={`p-3 border-b ${getCategoryColor(category.key)}`}>
                <div className="flex items-center justify-center gap-2">
                  {category.icon}
                  <span className="font-semibold">{category.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {players.length}
                  </Badge>
                </div>
              </div>

              {/* Players */}
              <div className="p-4 min-h-[400px] relative">
                {players.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">👥</div>
                    <p className="text-sm">No players yet</p>
                    <p className="text-xs text-gray-400">Add players to this category</p>
                  </div>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {players.map((player) => (
                      <Card
                        key={player.id}
                        className={`cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 w-72 ${
                          selectedPlayer?.id === player.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, player)}
                        onClick={() => selectPlayer(player)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getCategoryIcon(player.category)}
                              <div>
                                <h3 className="font-semibold text-base">{player.name}</h3>
                                {player.type && (
                                  <p className="text-xs text-gray-500">{player.type}</p>
                                )}
                              </div>
                            </div>
                            <Badge className={getCategoryColor(player.category)}>
                              {player.category.replace('_', ' ')}
                            </Badge>
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
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
