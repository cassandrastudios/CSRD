'use client'

import { useState } from 'react';
import { useValueChainStore } from '@/store/useValueChainStore';
import { Player } from '@/types/valueChain';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Truck, Building2, Users, Edit, GripVertical, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SimpleValueChainCanvas() {
  const { valueChain, updatePlayer } = useValueChainStore();
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: 'own_operations' as 'upstream' | 'own_operations' | 'downstream',
    description: '',
    impactOnCompany: 5,
    impactFromCompany: 5,
    type: '',
    industry: '',
  });

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
    e.dataTransfer.setData('text/plain', player.id);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(index);
    console.log('Drag over index:', index, 'draggedPlayer:', draggedPlayer?.name);
  };

  const handleDragLeave = () => {
    setDraggedOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverIndex(null);
    
    console.log('🎯 DROP EVENT TRIGGERED at index:', targetIndex);
    console.log('Current draggedPlayer:', draggedPlayer?.name);
    
    if (!draggedPlayer) {
      console.log('❌ No dragged player found');
      return;
    }
    
    const players = [...valueChain.players];
    const draggedIndex = players.findIndex(p => p.id === draggedPlayer.id);
    
    console.log('Dragged player index:', draggedIndex, 'Target index:', targetIndex);
    
    if (draggedIndex === -1) {
      console.log('❌ Dragged player not found in players array');
      return;
    }
    
    if (draggedIndex === targetIndex) {
      console.log('ℹ️ Same position, no reordering needed');
      setDraggedPlayer(null);
      return;
    }
    
    console.log('✅ Starting reorder process...');
    
    // Remove dragged player
    const [draggedItem] = players.splice(draggedIndex, 1);
    
    // Insert at new position
    players.splice(targetIndex, 0, draggedItem);
    
    // Update x positions based on new order
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      x: index * 10
    }));
    
    console.log('🔄 Reordering players:', updatedPlayers.map(p => p.name));
    
    // Update the store directly
    useValueChainStore.setState({
      valueChain: {
        ...valueChain,
        players: updatedPlayers,
        updatedAt: new Date().toISOString(),
      }
    });
    
    console.log('✅ Reorder complete!');
    setDraggedPlayer(null);
  };

  const handleEditClick = (player: Player) => {
    setEditingPlayer(player);
    setEditFormData({
      name: player.name,
      category: player.category,
      description: player.description || '',
      impactOnCompany: player.impactOnCompany,
      impactFromCompany: player.impactFromCompany,
      type: player.type || '',
      industry: player.industry || '',
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSliderChange = (name: string, value: number[]) => {
    setEditFormData(prev => ({ ...prev, [name]: value[0] }));
  };

  const handleEditSelectChange = (name: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [name]: value as 'upstream' | 'own_operations' | 'downstream' }));
  };

  const handleSaveEdit = () => {
    if (!editingPlayer) return;
    
    updatePlayer(editingPlayer.id, editFormData);
    setEditingPlayer(null);
    setEditFormData({
      name: '',
      category: 'own_operations',
      description: '',
      impactOnCompany: 5,
      impactFromCompany: 5,
      type: '',
      industry: '',
    });
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
    setEditFormData({
      name: '',
      category: 'own_operations',
      description: '',
      impactOnCompany: 5,
      impactFromCompany: 5,
      type: '',
      industry: '',
    });
  };

  // Group players by category and sort within each category by x position
  const groupedPlayers = {
    upstream: valueChain.players
      .filter(p => p.category === 'upstream')
      .sort((a, b) => (a.x || 0) - (b.x || 0)),
    own_operations: valueChain.players
      .filter(p => p.category === 'own_operations')
      .sort((a, b) => (a.x || 0) - (b.x || 0)),
    downstream: valueChain.players
      .filter(p => p.category === 'downstream')
      .sort((a, b) => (a.x || 0) - (b.x || 0))
  };

  const allPlayers = [
    ...groupedPlayers.upstream,
    ...groupedPlayers.own_operations,
    ...groupedPlayers.downstream
  ];

  const renderCardContent = (player: Player) => {
    if (editingPlayer?.id === player.id) {
      return (
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <Label htmlFor="edit-name">Player Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                className="mt-1"
              />
            </div>

            {/* Category Field */}
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select
                name="category"
                value={editFormData.category}
                onValueChange={(value: string) => handleEditSelectChange('category', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upstream">Upstream</SelectItem>
                  <SelectItem value="own_operations">Own Operations</SelectItem>
                  <SelectItem value="downstream">Downstream</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Field */}
            <div>
              <Label htmlFor="edit-type">Player Type</Label>
              <Input
                id="edit-type"
                name="type"
                value={editFormData.type}
                onChange={handleEditChange}
                placeholder="e.g., Supplier, Customer, Internal Unit"
                className="mt-1"
              />
            </div>

            {/* Industry Field */}
            <div>
              <Label htmlFor="edit-industry">Industry</Label>
              <Input
                id="edit-industry"
                name="industry"
                value={editFormData.industry}
                onChange={handleEditChange}
                placeholder="e.g., Manufacturing, Logistics"
                className="mt-1"
              />
            </div>

            {/* Description Field */}
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Impact Sliders */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-impact-on" className="flex items-center justify-between">
                  Impact ON Company: {editFormData.impactOnCompany}
                </Label>
                <Slider
                  id="edit-impact-on"
                  name="impactOnCompany"
                  min={1}
                  max={10}
                  step={1}
                  value={[editFormData.impactOnCompany]}
                  onValueChange={(value: number[]) => handleEditSliderChange('impactOnCompany', value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="edit-impact-from" className="flex items-center justify-between">
                  Impact FROM Company: {editFormData.impactFromCompany}
                </Label>
                <Slider
                  id="edit-impact-from"
                  name="impactFromCompany"
                  min={1}
                  max={10}
                  step={1}
                  value={[editFormData.impactFromCompany]}
                  onValueChange={(value: number[]) => handleEditSliderChange('impactFromCompany', value)}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      );
    }

    // Display mode
    return (
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
                handleEditClick(player);
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
    );
  };


  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{valueChain.name}</h2>
        {valueChain.description && (
          <p className="text-sm text-gray-600 mt-1">{valueChain.description}</p>
        )}
      </div>

      {/* Players grouped by category */}
      <div className="flex-1 p-4">
        {allPlayers.length === 0 ? (
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
          <div className="flex flex-col gap-4 h-full">
            {/* Cards in horizontal flow with inline category headers */}
            <div className="flex gap-4 overflow-x-auto pb-4">
              {/* Upstream Section */}
              {groupedPlayers.upstream.length > 0 && (
                <>
                  {/* Upstream Header */}
                  <div className="flex-shrink-0 w-80">
                    <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200 mb-2">
                      <Truck className="h-5 w-5 text-orange-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Upstream</h3>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {groupedPlayers.upstream.length}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Upstream Cards */}
                  {groupedPlayers.upstream.map((player, index) => (
                <div key={player.id} className="flex items-center">
                  {/* Drop zone before each card */}
                  <div
                    className={`w-2 h-32 rounded transition-colors ${
                      draggedOverIndex === index && draggedPlayer?.id !== player.id
                        ? 'bg-blue-500' : 'bg-transparent'
                    }`}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                  />
                  
                  <Card
                    className={`cursor-grab hover:shadow-md transition-shadow flex-shrink-0 w-80 group ${
                      draggedPlayer?.id === player.id ? 'opacity-50' : ''
                    }`}
                    draggable={editingPlayer?.id !== player.id}
                    onDragStart={(e) => {
                      if (editingPlayer?.id === player.id) {
                        e.preventDefault();
                        return;
                      }
                      console.log('Card drag start triggered for:', player.name);
                      handleDragStart(e, player);
                    }}
                    onDragOver={(e) => {
                      if (editingPlayer?.id === player.id) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      setDraggedOverIndex(index);
                    }}
                    onDragLeave={() => {
                      if (editingPlayer?.id === player.id) return;
                      setDraggedOverIndex(null);
                    }}
                    onDrop={(e) => {
                      if (editingPlayer?.id === player.id) return;
                      e.preventDefault();
                      handleDrop(e, index);
                    }}
                  >
                    {renderCardContent(player)}
                  </Card>
                </div>
              ))}
              
                  {/* Drop zone after upstream cards */}
                  {groupedPlayers.upstream.length > 0 && (
                    <div
                      className={`w-2 h-32 rounded transition-colors ${
                        draggedOverIndex === groupedPlayers.upstream.length && draggedPlayer
                          ? 'bg-blue-500' : 'bg-transparent'
                      }`}
                      onDragOver={(e) => handleDragOver(e, groupedPlayers.upstream.length)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, groupedPlayers.upstream.length)}
                    />
                  )}
                </>
              )}

              {/* Own Operations Section */}
              {groupedPlayers.own_operations.length > 0 && (
                <>
                  {/* Own Operations Header */}
                  <div className="flex-shrink-0 w-80">
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 mb-2">
                      <Building2 className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Own Operations</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {groupedPlayers.own_operations.length}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Own Operations Cards */}
              {groupedPlayers.own_operations.map((player, index) => {
                const globalIndex = groupedPlayers.upstream.length + index;
                return (
                  <div key={player.id} className="flex items-center">
                    {/* Drop zone before each card */}
                    <div
                      className={`w-2 h-32 rounded transition-colors ${
                        draggedOverIndex === globalIndex && draggedPlayer?.id !== player.id
                          ? 'bg-blue-500' : 'bg-transparent'
                      }`}
                      onDragOver={(e) => handleDragOver(e, globalIndex)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, globalIndex)}
                    />
                    
                    <Card
                      className={`cursor-grab hover:shadow-md transition-shadow flex-shrink-0 w-80 group ${
                        draggedPlayer?.id === player.id ? 'opacity-50' : ''
                      }`}
                      draggable={editingPlayer?.id !== player.id}
                      onDragStart={(e) => {
                        if (editingPlayer?.id === player.id) {
                          e.preventDefault();
                          return;
                        }
                        console.log('Card drag start triggered for:', player.name);
                        handleDragStart(e, player);
                      }}
                      onDragOver={(e) => {
                        if (editingPlayer?.id === player.id) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        setDraggedOverIndex(globalIndex);
                      }}
                      onDragLeave={() => {
                        if (editingPlayer?.id === player.id) return;
                        setDraggedOverIndex(null);
                      }}
                      onDrop={(e) => {
                        if (editingPlayer?.id === player.id) return;
                        e.preventDefault();
                        handleDrop(e, globalIndex);
                      }}
                    >
                      {renderCardContent(player)}
                    </Card>
                  </div>
                );
              })}
              
                  {/* Drop zone after own operations cards */}
                  {groupedPlayers.own_operations.length > 0 && (
                    <div
                      className={`w-2 h-32 rounded transition-colors ${
                        draggedOverIndex === groupedPlayers.upstream.length + groupedPlayers.own_operations.length && draggedPlayer
                          ? 'bg-blue-500' : 'bg-transparent'
                      }`}
                      onDragOver={(e) => handleDragOver(e, groupedPlayers.upstream.length + groupedPlayers.own_operations.length)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, groupedPlayers.upstream.length + groupedPlayers.own_operations.length)}
                    />
                  )}
                </>
              )}

              {/* Downstream Section */}
              {groupedPlayers.downstream.length > 0 && (
                <>
                  {/* Downstream Header */}
                  <div className="flex-shrink-0 w-80">
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200 mb-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Downstream</h3>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {groupedPlayers.downstream.length}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Downstream Cards */}
              {groupedPlayers.downstream.map((player, index) => {
                const globalIndex = groupedPlayers.upstream.length + groupedPlayers.own_operations.length + index;
                return (
                  <div key={player.id} className="flex items-center">
                    {/* Drop zone before each card */}
                    <div
                      className={`w-2 h-32 rounded transition-colors ${
                        draggedOverIndex === globalIndex && draggedPlayer?.id !== player.id
                          ? 'bg-blue-500' : 'bg-transparent'
                      }`}
                      onDragOver={(e) => handleDragOver(e, globalIndex)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, globalIndex)}
                    />
                    
                    <Card
                      className={`cursor-grab hover:shadow-md transition-shadow flex-shrink-0 w-80 group ${
                        draggedPlayer?.id === player.id ? 'opacity-50' : ''
                      }`}
                      draggable={editingPlayer?.id !== player.id}
                      onDragStart={(e) => {
                        if (editingPlayer?.id === player.id) {
                          e.preventDefault();
                          return;
                        }
                        console.log('Card drag start triggered for:', player.name);
                        handleDragStart(e, player);
                      }}
                      onDragOver={(e) => {
                        if (editingPlayer?.id === player.id) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        setDraggedOverIndex(globalIndex);
                      }}
                      onDragLeave={() => {
                        if (editingPlayer?.id === player.id) return;
                        setDraggedOverIndex(null);
                      }}
                      onDrop={(e) => {
                        if (editingPlayer?.id === player.id) return;
                        e.preventDefault();
                        handleDrop(e, globalIndex);
                      }}
                    >
                      {renderCardContent(player)}
                    </Card>
                  </div>
                );
              })}
              
                  {/* Drop zone after downstream cards */}
                  {groupedPlayers.downstream.length > 0 && (
                    <div
                      className={`w-2 h-32 rounded transition-colors ${
                        draggedOverIndex === allPlayers.length && draggedPlayer
                          ? 'bg-blue-500' : 'bg-transparent'
                      }`}
                      onDragOver={(e) => handleDragOver(e, allPlayers.length)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, allPlayers.length)}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}