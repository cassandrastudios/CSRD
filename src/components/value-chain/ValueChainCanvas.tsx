'use client'

import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useValueChainStore } from '@/store/useValueChainStore';
import PlayerNode from './PlayerNode';
import { Player, Relationship } from '@/types/valueChain';

const nodeTypes = {
  player: PlayerNode,
};

export function ValueChainCanvas() {
  const { valueChain, updatePlayerPosition, addRelationship } = useValueChainStore();
  
  // Convert players to ReactFlow nodes
  const nodes: Node[] = useMemo(() => {
    if (!valueChain) return [];
    
    return valueChain.players.map((player, index) => {
      // Auto-layout by category
      let x = 100;
      let y = 100 + (index * 150);
      
      if (player.category === 'upstream') {
        x = 50;
        y = 100 + (valueChain.players.filter(p => p.category === 'upstream').indexOf(player) * 150);
      } else if (player.category === 'own_operations') {
        x = 300;
        y = 100 + (valueChain.players.filter(p => p.category === 'own_operations').indexOf(player) * 150);
      } else if (player.category === 'downstream') {
        x = 550;
        y = 100 + (valueChain.players.filter(p => p.category === 'downstream').indexOf(player) * 150);
      }
      
      return {
        id: player.id,
        type: 'player',
        position: { x: player.x || x, y: player.y || y },
        data: player,
      };
    });
  }, [valueChain]);

  // Convert relationships to ReactFlow edges
  const edges: Edge[] = useMemo(() => {
    if (!valueChain) return [];
    
    return valueChain.relationships.map(rel => ({
      id: rel.id,
      source: rel.from,
      target: rel.to,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: '#6366f1',
        strokeWidth: 2,
      },
      label: rel.type || 'relationship',
      labelStyle: {
        fontSize: 12,
        fill: '#374151',
      },
    }));
  }, [valueChain]);

  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges);

  // Update nodes when valueChain changes
  useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);

  // Update edges when valueChain changes
  useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;
      
      addRelationship({
        from: params.source,
        to: params.target,
        type: 'business_relationship',
        strength: 5,
      });
    },
    [addRelationship]
  );

  const onNodeDragStop = useCallback(
    (event: any, node: Node) => {
      updatePlayerPosition(node.id, node.position.x, node.position.y);
    },
    [updatePlayerPosition]
  );

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

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const player = node.data as Player;
            switch (player.category) {
              case 'upstream':
                return '#3b82f6';
              case 'own_operations':
                return '#10b981';
              case 'downstream':
                return '#8b5cf6';
              default:
                return '#6b7280';
            }
          }}
        />
        
        {/* Lane Headers */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
            Upstream
          </div>
        </div>
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
            Own Operations
          </div>
        </div>
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
            Downstream
          </div>
        </div>
      </ReactFlow>
    </div>
  );
}

export default function ValueChainCanvasWrapper() {
  return (
    <ReactFlowProvider>
      <ValueChainCanvas />
    </ReactFlowProvider>
  );
}
