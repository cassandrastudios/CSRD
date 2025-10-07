import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ValueChainStore, Player, Relationship, ValueChain } from '@/types/valueChain';

export const useValueChainStore = create<ValueChainStore>()(
  persist(
    (set, get) => ({
      // State
      valueChain: null,
      selectedPlayer: null,
      selectedRelationship: null,
      isEditingPlayer: false,
      isEditingRelationship: false,

      // Actions
      createValueChain: (name: string, description?: string) => {
        const newValueChain: ValueChain = {
          id: `vc_${Date.now()}`,
          name,
          description,
          players: [],
          relationships: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ valueChain: newValueChain });
      },

      addPlayer: (playerData: Omit<Player, 'id' | 'x' | 'y'>) => {
        const { valueChain } = get();
        if (!valueChain) return;

        const newPlayer: Player = {
          ...playerData,
          id: `player_${Date.now()}`,
          x: 0,
          y: 0,
        };

        set({
          valueChain: {
            ...valueChain,
            players: [...valueChain.players, newPlayer],
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updatePlayer: (id: string, updates: Partial<Player>) => {
        const { valueChain } = get();
        if (!valueChain) return;

        set({
          valueChain: {
            ...valueChain,
            players: valueChain.players.map(player =>
              player.id === id ? { ...player, ...updates } : player
            ),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      movePlayerToCategory: (playerId: string, newCategory: 'upstream' | 'own_operations' | 'downstream') => {
        const { valueChain } = get();
        if (!valueChain) return;

        set({
          valueChain: {
            ...valueChain,
            players: valueChain.players.map(player =>
              player.id === playerId ? { ...player, category: newCategory } : player
            ),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      deletePlayer: (id: string) => {
        const { valueChain } = get();
        if (!valueChain) return;

        set({
          valueChain: {
            ...valueChain,
            players: valueChain.players.filter(player => player.id !== id),
            relationships: valueChain.relationships.filter(
              rel => rel.from !== id && rel.to !== id
            ),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      addRelationship: (relationshipData: Omit<Relationship, 'id'>) => {
        const { valueChain } = get();
        if (!valueChain) return;

        const newRelationship: Relationship = {
          ...relationshipData,
          id: `rel_${Date.now()}`,
        };

        set({
          valueChain: {
            ...valueChain,
            relationships: [...valueChain.relationships, newRelationship],
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateRelationship: (id: string, updates: Partial<Relationship>) => {
        const { valueChain } = get();
        if (!valueChain) return;

        set({
          valueChain: {
            ...valueChain,
            relationships: valueChain.relationships.map(rel =>
              rel.id === id ? { ...rel, ...updates } : rel
            ),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      deleteRelationship: (id: string) => {
        const { valueChain } = get();
        if (!valueChain) return;

        set({
          valueChain: {
            ...valueChain,
            relationships: valueChain.relationships.filter(rel => rel.id !== id),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      selectPlayer: (player: Player | null) => {
        set({ selectedPlayer: player });
      },

      selectRelationship: (relationship: Relationship | null) => {
        set({ selectedRelationship: relationship });
      },

      setEditingPlayer: (editing: boolean) => {
        set({ isEditingPlayer: editing });
      },

      setEditingRelationship: (editing: boolean) => {
        set({ isEditingRelationship: editing });
      },

      updatePlayerPosition: (id: string, x: number, y: number) => {
        const { valueChain } = get();
        if (!valueChain) return;

        set({
          valueChain: {
            ...valueChain,
            players: valueChain.players.map(player =>
              player.id === id ? { ...player, x, y } : player
            ),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      loadValueChain: (valueChain: ValueChain) => {
        set({ valueChain });
      },

      clearValueChain: () => {
        set({
          valueChain: null,
          selectedPlayer: null,
          selectedRelationship: null,
          isEditingPlayer: false,
          isEditingRelationship: false,
        });
      },

      exportValueChain: () => {
        const { valueChain } = get();
        if (!valueChain) return '';
        return JSON.stringify(valueChain, null, 2);
      },
    }),
    {
      name: 'value-chain-storage',
    }
  )
);
