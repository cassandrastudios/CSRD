'use client'

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Player } from '@/types/valueChain';
import { useValueChainStore } from '@/store/useValueChainStore';
import { Edit, Trash2, Users, Building2, Truck } from 'lucide-react';

const PlayerNode = memo(({ data, id }: NodeProps<Player>) => {
  const { selectPlayer, deletePlayer, setEditingPlayer } = useValueChainStore();
  
  const totalImpact = data.impactOnCompany + data.impactFromCompany;
  const impactDifference = Math.abs(data.impactOnCompany - data.impactFromCompany);
  
  // Calculate node size based on total impact (min 60px, max 120px)
  const nodeSize = Math.max(60, Math.min(120, 60 + (totalImpact * 3)));
  
  // Calculate color intensity based on impact difference
  const colorIntensity = Math.min(100, impactDifference * 10);
  
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
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'own_operations':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'downstream':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div
      className={`
        relative bg-white border-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200
        ${getCategoryColor(data.category)}
        cursor-pointer group
      `}
      style={{ 
        width: nodeSize, 
        height: nodeSize,
        opacity: 0.8 + (colorIntensity / 200)
      }}
      onClick={() => selectPlayer(data)}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400"
      />
      
      <div className="p-2 h-full flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-1 mb-1">
          {getCategoryIcon(data.category)}
          <span className="text-xs font-medium truncate max-w-[80px]">
            {data.name}
          </span>
        </div>
        
        <div className="text-xs text-gray-600">
          <div>In: {data.impactOnCompany}</div>
          <div>Out: {data.impactFromCompany}</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400"
      />

      {/* Action buttons on hover */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              selectPlayer(data);
              setEditingPlayer(true);
            }}
            className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deletePlayer(data.id);
            }}
            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
          <div className="font-medium">{data.name}</div>
          <div>Impact In: {data.impactOnCompany}/10</div>
          <div>Impact Out: {data.impactFromCompany}/10</div>
          {data.description && (
            <div className="max-w-48 truncate">{data.description}</div>
          )}
        </div>
      </div>
    </div>
  );
});

PlayerNode.displayName = 'PlayerNode';

export default PlayerNode;
