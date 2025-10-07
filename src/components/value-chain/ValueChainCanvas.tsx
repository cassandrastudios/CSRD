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
  const { valueChain, updatePlayerPosition, addRelationship, selectRelationship } = useValueChainStore();
  
  // Calculate lane positions and widths
  const laneConfig = useMemo(() => {
    if (!valueChain) return { upstream: { x: 0, width: 200 }, ownOps: { x: 200, width: 200 }, downstream: { x: 400, width: 200 } };
    
    const upstreamCount = valueChain.players.filter(p => p.category === 'upstream').length;
    const ownOpsCount = valueChain.players.filter(p => p.category === 'own_operations').length;
    const downstreamCount = valueChain.players.filter(p => p.category === 'downstream').length;
    
    const minWidth = 200;
    const maxWidth = 400;
    const totalWidth = 800;
    
    // Calculate proportional widths
    const totalPlayers = upstreamCount + ownOpsCount + downstreamCount;
    if (totalPlayers === 0) {
      return { upstream: { x: 0, width: totalWidth / 3 }, ownOps: { x: totalWidth / 3, width: totalWidth / 3 }, downstream: { x: (totalWidth * 2) / 3, width: totalWidth / 3 } };
    }
    
    const upstreamWidth = Math.max(minWidth, Math.min(maxWidth, (upstreamCount / totalPlayers) * totalWidth));
    const ownOpsWidth = Math.max(minWidth, Math.min(maxWidth, (ownOpsCount / totalPlayers) * totalWidth));
    const downstreamWidth = totalWidth - upstreamWidth - ownOpsWidth;
    
    return {
      upstream: { x: 0, width: upstreamWidth },
      ownOps: { x: upstreamWidth, width: ownOpsWidth },
      downstream: { x: upstreamWidth + ownOpsWidth, width: downstreamWidth }
    };
  }, [valueChain]);

  // Convert players to ReactFlow nodes with horizontal lane positioning
  const nodes: Node[] = useMemo(() => {
    if (!valueChain) return [];
    
    return valueChain.players.map((player) => {
      const lane = laneConfig[player.category === 'upstream' ? 'upstream' : player.category === 'own_operations' ? 'ownOps' : 'downstream'];
      const playersInLane = valueChain.players.filter(p => p.category === player.category).sort((a, b) => (a.x || 0) - (b.x || 0));
      const playerIndex = playersInLane.findIndex(p => p.id === player.id);
      
      // Calculate horizontal position within the lane
      const spacing = lane.width / (playersInLane.length + 1);
      const x = lane.x + spacing * (playerIndex + 1) - 50; // -50 to center the node
      const y = 200; // Fixed vertical position for all players
      
      return {
        id: player.id,
        type: 'player',
        position: { x: player.x || x, y: player.y || y },
        data: { ...player, lane: player.category },
      };
    });
  }, [valueChain, laneConfig]);

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
      className: 'cursor-pointer hover:stroke-purple-500',
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

  const onNodeDrag = useCallback(
    (event: any, node: Node) => {
      const player = node.data;
      const lane = laneConfig[player.category === 'upstream' ? 'upstream' : player.category === 'own_operations' ? 'ownOps' : 'downstream'];
      
      // Constrain X position to within the lane bounds during drag
      const constrainedX = Math.max(lane.x + 25, Math.min(lane.x + lane.width - 25, node.position.x));
      
      // Keep Y position fixed
      const fixedY = 200;
      
      // Update the node position in real-time
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, position: { x: constrainedX, y: fixedY } }
            : n
        )
      );
    },
    [laneConfig, setNodes]
  );

  const onNodeDragStop = useCallback(
    (event: any, node: Node) => {
      const player = node.data;
      const lane = laneConfig[player.category === 'upstream' ? 'upstream' : player.category === 'own_operations' ? 'ownOps' : 'downstream'];
      
      // Constrain X position to within the lane bounds
      const constrainedX = Math.max(lane.x + 25, Math.min(lane.x + lane.width - 25, node.position.x));
      
      // Keep Y position fixed
      const fixedY = 200;
      
      updatePlayerPosition(node.id, constrainedX, fixedY);
    },
    [updatePlayerPosition, laneConfig]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      if (!valueChain) return;
      
      const relationship = valueChain.relationships.find(rel => rel.id === edge.id);
      if (relationship) {
        selectRelationship(relationship);
      }
    },
    [valueChain, selectRelationship]
  );

  const onPaneClick = useCallback(() => {
    selectRelationship(null);
  }, [selectRelationship]);

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
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
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
        
        {/* Lane Headers with Dynamic Widths */}
        <div 
          className="absolute top-4 z-10"
          style={{ left: `${laneConfig.upstream.x}px`, width: `${laneConfig.upstream.width}px` }}
        >
          <div className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg text-center">
            Upstream
            <div className="text-xs opacity-75">
              {valueChain?.players.filter(p => p.category === 'upstream').length || 0} players
            </div>
          </div>
        </div>
        <div 
          className="absolute top-4 z-10"
          style={{ left: `${laneConfig.ownOps.x}px`, width: `${laneConfig.ownOps.width}px` }}
        >
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg text-center">
            Own Operations
            <div className="text-xs opacity-75">
              {valueChain?.players.filter(p => p.category === 'own_operations').length || 0} players
            </div>
          </div>
        </div>
        <div 
          className="absolute top-4 z-10"
          style={{ left: `${laneConfig.downstream.x}px`, width: `${laneConfig.downstream.width}px` }}
        >
          <div className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg text-center">
            Downstream
            <div className="text-xs opacity-75">
              {valueChain?.players.filter(p => p.category === 'downstream').length || 0} players
            </div>
          </div>
        </div>
        
        {/* Lane Boundaries */}
        <div 
          className="absolute border-l-2 border-r-2 border-orange-300 bg-orange-50 bg-opacity-20"
          style={{ 
            left: `${laneConfig.upstream.x}px`, 
            width: `${laneConfig.upstream.width}px`,
            top: '80px',
            height: '300px'
          }}
        />
        <div 
          className="absolute border-l-2 border-r-2 border-green-300 bg-green-50 bg-opacity-20"
          style={{ 
            left: `${laneConfig.ownOps.x}px`, 
            width: `${laneConfig.ownOps.width}px`,
            top: '80px',
            height: '300px'
          }}
        />
        <div 
          className="absolute border-l-2 border-r-2 border-purple-300 bg-purple-50 bg-opacity-20"
          style={{ 
            left: `${laneConfig.downstream.x}px`, 
            width: `${laneConfig.downstream.width}px`,
            top: '80px',
            height: '300px'
          }}
        />
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
