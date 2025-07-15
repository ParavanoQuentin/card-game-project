import { create } from 'zustand';
import { Card, GameState, Mythology, Player } from '../types/game';

interface GameStore {
  // Game state
  currentGame: GameState | null;
  playerId: string | null;
  isConnected: boolean;
  isInMatchmaking: boolean;
  
  // Deck building
  selectedMythology: Mythology | null;
  customDeck: Card[];
  
  // Actions
  setCurrentGame: (game: GameState | null) => void;
  setPlayerId: (id: string | null) => void;
  setConnected: (connected: boolean) => void;
  setInMatchmaking: (inMatchmaking: boolean) => void;
  setSelectedMythology: (mythology: Mythology | null) => void;
  setCustomDeck: (deck: Card[]) => void;
  addCardToDeck: (card: Card) => void;
  removeCardFromDeck: (cardId: string) => void;
  
  // Computed getters
  getCurrentPlayer: () => Player | null;
  getOpponent: () => Player | null;
  isMyTurn: () => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  currentGame: null,
  playerId: null,
  isConnected: false,
  isInMatchmaking: false,
  selectedMythology: null,
  customDeck: [],
  
  // Actions
  setCurrentGame: (game) => set({ currentGame: game }),
  setPlayerId: (id) => set({ playerId: id }),
  setConnected: (connected) => set({ isConnected: connected }),
  setInMatchmaking: (inMatchmaking) => set({ isInMatchmaking: inMatchmaking }),
  setSelectedMythology: (mythology) => set({ selectedMythology: mythology }),
  setCustomDeck: (deck) => set({ customDeck: deck }),
  
  addCardToDeck: (card) => set((state) => {
    if (state.customDeck.length < 10) {
      return { customDeck: [...state.customDeck, { ...card, id: `${card.id}_${Date.now()}` }] };
    }
    return state;
  }),
  
  removeCardFromDeck: (cardId) => set((state) => ({
    customDeck: state.customDeck.filter(card => card.id !== cardId)
  })),
  
  // Computed getters
  getCurrentPlayer: () => {
    const { currentGame, playerId } = get();
    if (!currentGame || !playerId) return null;
    return currentGame.players.find(p => p.id === playerId) || null;
  },
  
  getOpponent: () => {
    const { currentGame, playerId } = get();
    if (!currentGame || !playerId) return null;
    return currentGame.players.find(p => p.id !== playerId) || null;
  },
  
  isMyTurn: () => {
    const { currentGame, playerId } = get();
    if (!currentGame || !playerId) return false;
    const currentPlayer = currentGame.players[currentGame.currentPlayerIndex];
    return currentPlayer.id === playerId;
  }
}));
