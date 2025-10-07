'use client'

import { useState, useEffect } from 'react';
import { Player } from '@/types/valueChain';
import { useValueChainStore } from '@/store/useValueChainStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save, Lightbulb } from 'lucide-react';

interface PlayerEditorProps {
  player?: Player | null;
  onClose: () => void;
}

export function PlayerEditor({ player, onClose }: PlayerEditorProps) {
  const { addPlayer, updatePlayer } = useValueChainStore();
  const [formData, setFormData] = useState({
    name: '',
    category: 'own_operations' as 'upstream' | 'own_operations' | 'downstream',
    description: '',
    impactOnCompany: 5,
    impactFromCompany: 5,
    type: '',
    industry: '',
  });

  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name,
        category: player.category,
        description: player.description || '',
        impactOnCompany: player.impactOnCompany,
        impactFromCompany: player.impactFromCompany,
        type: player.type || '',
        industry: player.industry || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'own_operations',
        description: '',
        impactOnCompany: 5,
        impactFromCompany: 5,
        type: '',
        industry: '',
      });
    }
  }, [player]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (player) {
      console.log('Updating existing player:', player.id, formData);
      updatePlayer(player.id, formData);
    } else {
      console.log('Adding new player:', formData);
      addPlayer(formData);
    }
    
    onClose();
  };

  const handleAISuggest = () => {
    // AI suggestion stub - could be expanded later
    const suggestions = {
      upstream: [
        { name: 'Raw Material Suppliers', type: 'Supplier', industry: 'Manufacturing' },
        { name: 'Component Manufacturers', type: 'Supplier', industry: 'Electronics' },
        { name: 'Service Providers', type: 'Supplier', industry: 'Professional Services' },
      ],
      own_operations: [
        { name: 'R&D Department', type: 'Internal', industry: 'Technology' },
        { name: 'Manufacturing', type: 'Internal', industry: 'Production' },
        { name: 'Quality Control', type: 'Internal', industry: 'Operations' },
      ],
      downstream: [
        { name: 'Distributors', type: 'Partner', industry: 'Logistics' },
        { name: 'Retailers', type: 'Customer', industry: 'Retail' },
        { name: 'End Consumers', type: 'Customer', industry: 'Consumer' },
      ],
    };

    const categorySuggestions = suggestions[formData.category];
    const randomSuggestion = categorySuggestions[Math.floor(Math.random() * categorySuggestions.length)];
    
    setFormData(prev => ({
      ...prev,
      name: randomSuggestion.name,
      type: randomSuggestion.type,
      industry: randomSuggestion.industry,
    }));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{player ? 'Edit Player' : 'Add New Player'}</CardTitle>
            <CardDescription>
              {player ? 'Update player information' : 'Create a new value chain player'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Player Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Raw Material Suppliers"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                category: e.target.value as 'upstream' | 'own_operations' | 'downstream' 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="upstream">Upstream</option>
              <option value="own_operations">Own Operations</option>
              <option value="downstream">Downstream</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this player's role..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <Input
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                placeholder="e.g., Supplier, Customer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <Input
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="e.g., Manufacturing"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impact on Company: {formData.impactOnCompany}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.impactOnCompany}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                impactOnCompany: parseInt(e.target.value) 
              }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impact from Company: {formData.impactFromCompany}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.impactFromCompany}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                impactFromCompany: parseInt(e.target.value) 
              }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {player ? 'Update' : 'Create'} Player
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAISuggest}
              className="flex-1"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              AI Suggest
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
