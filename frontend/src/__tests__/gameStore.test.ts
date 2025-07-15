import { create } from 'zustand';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '../store/gameStore';
import { Card, CardType, Mythology, GameState } from '../types/game';

// Mock card pour les tests
const mockCard: Card = {
  id: 'test_harpie',
  name: 'Harpie',
  type: CardType.BEAST,
  mythology: Mythology.GREEK,
  description: 'Créature ailée aux griffes acérées',
  imageUrl: 'https://example.com/harpie.jpg',
  hp: 5,
  maxHp: 5,
  attacks: [
    { name: 'Griffes tourbillonnantes', damage: 3, description: 'Attaque rapide' }
  ]
};

const mockCard2: Card = {
  id: 'test_cyclope',
  name: 'Cyclope',
  type: CardType.BEAST,
  mythology: Mythology.GREEK,
  description: 'Géant à un œil',
  imageUrl: 'https://example.com/cyclope.jpg',
  hp: 9,
  maxHp: 9,
  attacks: [
    { name: 'Poing massif', damage: 5, description: 'Coup de poing dévastateur' }
  ]
};

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store avant chaque test
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.setCurrentGame(null);
      result.current.setPlayerId(null);
      result.current.setConnected(false);
      result.current.setInMatchmaking(false);
      result.current.setSelectedMythology(null);
      result.current.setCustomDeck([]);
    });
  });

  describe('Connection state', () => {
    test('should set connection state', () => {
      const { result } = renderHook(() => useGameStore());
      
      expect(result.current.isConnected).toBe(false);
      
      act(() => {
        result.current.setConnected(true);
      });
      
      expect(result.current.isConnected).toBe(true);
    });

    test('should set player ID', () => {
      const { result } = renderHook(() => useGameStore());
      
      expect(result.current.playerId).toBe(null);
      
      act(() => {
        result.current.setPlayerId('player123');
      });
      
      expect(result.current.playerId).toBe('player123');
    });
  });

  describe('Matchmaking state', () => {
    test('should set matchmaking state', () => {
      const { result } = renderHook(() => useGameStore());
      
      expect(result.current.isInMatchmaking).toBe(false);
      
      act(() => {
        result.current.setInMatchmaking(true);
      });
      
      expect(result.current.isInMatchmaking).toBe(true);
    });
  });

  describe('Deck building', () => {
    test('should set selected mythology', () => {
      const { result } = renderHook(() => useGameStore());
      
      expect(result.current.selectedMythology).toBe(null);
      
      act(() => {
        result.current.setSelectedMythology(Mythology.GREEK);
      });
      
      expect(result.current.selectedMythology).toBe(Mythology.GREEK);
    });

    test('should set custom deck', () => {
      const { result } = renderHook(() => useGameStore());
      const testDeck = [mockCard, mockCard2];
      
      expect(result.current.customDeck).toEqual([]);
      
      act(() => {
        result.current.setCustomDeck(testDeck);
      });
      
      expect(result.current.customDeck).toEqual(testDeck);
    });

    test('should add card to deck', () => {
      const { result } = renderHook(() => useGameStore());
      
      expect(result.current.customDeck).toEqual([]);
      
      act(() => {
        result.current.addCardToDeck(mockCard);
      });
      
      expect(result.current.customDeck).toEqual([mockCard]);
      expect(result.current.customDeck).toHaveLength(1);
    });

    test('should add multiple cards to deck', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.addCardToDeck(mockCard);
        result.current.addCardToDeck(mockCard2);
      });
      
      expect(result.current.customDeck).toEqual([mockCard, mockCard2]);
      expect(result.current.customDeck).toHaveLength(2);
    });

    test('should remove card from deck', () => {
      const { result } = renderHook(() => useGameStore());
      
      // Ajouter des cartes au deck
      act(() => {
        result.current.setCustomDeck([mockCard, mockCard2]);
      });
      
      expect(result.current.customDeck).toHaveLength(2);
      
      // Retirer une carte
      act(() => {
        result.current.removeCardFromDeck(mockCard.id);
      });
      
      expect(result.current.customDeck).toEqual([mockCard2]);
      expect(result.current.customDeck).toHaveLength(1);
    });

    test('should handle removing non-existent card', () => {
      const { result } = renderHook(() => useGameStore());
      
      act(() => {
        result.current.setCustomDeck([mockCard]);
      });
      
      // Essayer de retirer une carte qui n'existe pas
      act(() => {
        result.current.removeCardFromDeck('non_existent_id');
      });
      
      expect(result.current.customDeck).toEqual([mockCard]);
      expect(result.current.customDeck).toHaveLength(1);
    });
  });

  describe('Game state management', () => {
    test('should set current game', () => {
      const { result } = renderHook(() => useGameStore());
      
      const mockGameState: Partial<GameState> = {
        id: 'game123',
        status: 'in_progress'
      };
      
      expect(result.current.currentGame).toBe(null);
      
      act(() => {
        result.current.setCurrentGame(mockGameState as GameState);
      });
      
      expect(result.current.currentGame).toBe(mockGameState);
    });

    test('should clear current game', () => {
      const { result } = renderHook(() => useGameStore());
      
      const mockGameState: Partial<GameState> = {
        id: 'game123',
        status: 'in_progress'
      };
      
      act(() => {
        result.current.setCurrentGame(mockGameState as GameState);
      });
      
      expect(result.current.currentGame).toBe(mockGameState);
      
      act(() => {
        result.current.setCurrentGame(null);
      });
      
      expect(result.current.currentGame).toBe(null);
    });
  });
});
