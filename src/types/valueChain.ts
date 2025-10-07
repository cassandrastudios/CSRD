export interface Player {
  id: string;
  name: string;
  category: 'upstream' | 'own_operations' | 'downstream';
  description?: string;
  impactOnCompany: number; // 1–10
  impactFromCompany: number; // 1–10
  x: number;
  y: number;
  type?: string;
  industry?: string;
}

export interface Relationship {
  id: string;
  from: string;
  to: string;
  type?: string;
  strength?: number; // 1–10
  description?: string;
}

export interface ValueChain {
  id: string;
  name: string;
  description?: string;
  players: Player[];
  relationships: Relationship[];
  createdAt: string;
  updatedAt: string;
}

export interface ValueChainStore {
  // State
  valueChain: ValueChain | null;
  selectedPlayer: Player | null;
  selectedRelationship: Relationship | null;
  isEditingPlayer: boolean;
  isEditingRelationship: boolean;
  
  // Actions
  createValueChain: (name: string, description?: string) => void;
  addPlayer: (player: Omit<Player, 'id' | 'x' | 'y'>) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  movePlayerToCategory: (playerId: string, newCategory: 'upstream' | 'own_operations' | 'downstream') => void;
  reorderPlayers: (category: 'upstream' | 'own_operations' | 'downstream', newOrder: Player[]) => void;
  deletePlayer: (id: string) => void;
  addRelationship: (relationship: Omit<Relationship, 'id'>) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  deleteRelationship: (id: string) => void;
  selectPlayer: (player: Player | null) => void;
  selectRelationship: (relationship: Relationship | null) => void;
  setEditingPlayer: (editing: boolean) => void;
  setEditingRelationship: (editing: boolean) => void;
  updatePlayerPosition: (id: string, x: number, y: number) => void;
  loadValueChain: (valueChain: ValueChain) => void;
  clearValueChain: () => void;
  exportValueChain: () => string;
}
