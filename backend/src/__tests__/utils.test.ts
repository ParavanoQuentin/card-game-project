import { CardType, Mythology } from '../models/types';

// Fonction utilitaire pour la validation des cartes
export const validateCard = (card: any): boolean => {
  if (!card || typeof card !== 'object') return false;
  
  const requiredFields = ['id', 'name', 'type', 'mythology', 'description', 'imageUrl'];
  const hasRequiredFields = requiredFields.every(field => card.hasOwnProperty(field));
  
  if (!hasRequiredFields) return false;
  
  // Validation spécifique aux cartes BEAST
  if (card.type === CardType.BEAST) {
    const beastRequiredFields = ['hp', 'maxHp', 'attacks'];
    const hasBeastFields = beastRequiredFields.every(field => card.hasOwnProperty(field));
    
    if (!hasBeastFields) return false;
    if (typeof card.hp !== 'number' || card.hp <= 0) return false;
    if (typeof card.maxHp !== 'number' || card.maxHp <= 0) return false;
    if (!Array.isArray(card.attacks)) return false;
  }
  
  return true;
};

// Fonction utilitaire pour calculer les statistiques des cartes
export const getCardStats = (cards: any[]) => {
  return {
    total: cards.length,
    beasts: cards.filter(card => card.type === CardType.BEAST).length,
    techniques: cards.filter(card => card.type === CardType.TECHNIQUE).length,
    artifacts: cards.filter(card => card.type === CardType.ARTIFACT).length,
    averageHp: cards
      .filter(card => card.type === CardType.BEAST && card.hp)
      .reduce((sum, card) => sum + card.hp, 0) / 
      cards.filter(card => card.type === CardType.BEAST && card.hp).length || 0
  };
};

describe('Card Utilities', () => {
  describe('validateCard', () => {
    test('should validate a complete beast card', () => {
      const validBeastCard = {
        id: 'test_beast',
        name: 'Test Beast',
        type: CardType.BEAST,
        mythology: Mythology.GREEK,
        description: 'A test beast',
        imageUrl: 'http://example.com/image.jpg',
        hp: 5,
        maxHp: 5,
        attacks: [
          { name: 'Test Attack', damage: 3, description: 'Test description' }
        ]
      };
      
      expect(validateCard(validBeastCard)).toBe(true);
    });

    test('should validate a complete technique card', () => {
      const validTechniqueCard = {
        id: 'test_technique',
        name: 'Test Technique',
        type: CardType.TECHNIQUE,
        mythology: Mythology.GREEK,
        description: 'A test technique',
        imageUrl: 'http://example.com/image.jpg',
        techniqueEffect: '{"type": "damage", "amount": 3}'
      };
      
      expect(validateCard(validTechniqueCard)).toBe(true);
    });

    test('should reject card missing required fields', () => {
      const invalidCard = {
        id: 'test_invalid',
        name: 'Invalid Card'
        // Missing required fields
      };
      
      expect(validateCard(invalidCard)).toBe(false);
    });

    test('should reject beast card missing hp', () => {
      const invalidBeastCard = {
        id: 'test_beast',
        name: 'Test Beast',
        type: CardType.BEAST,
        mythology: Mythology.GREEK,
        description: 'A test beast',
        imageUrl: 'http://example.com/image.jpg'
        // Missing hp, maxHp, attacks
      };
      
      expect(validateCard(invalidBeastCard)).toBe(false);
    });

    test('should reject null or undefined input', () => {
      expect(validateCard(null)).toBe(false);
      expect(validateCard(undefined)).toBe(false);
      expect(validateCard('not an object')).toBe(false);
    });
  });

  describe('getCardStats', () => {
    test('should calculate correct statistics', () => {
      const testCards = [
        {
          id: 'beast1',
          type: CardType.BEAST,
          hp: 5
        },
        {
          id: 'beast2',
          type: CardType.BEAST,
          hp: 7
        },
        {
          id: 'technique1',
          type: CardType.TECHNIQUE
        },
        {
          id: 'artifact1',
          type: CardType.ARTIFACT
        }
      ];
      
      const stats = getCardStats(testCards);
      
      expect(stats.total).toBe(4);
      expect(stats.beasts).toBe(2);
      expect(stats.techniques).toBe(1);
      expect(stats.artifacts).toBe(1);
      expect(stats.averageHp).toBe(6); // (5 + 7) / 2
    });

    test('should handle empty array', () => {
      const stats = getCardStats([]);
      
      expect(stats.total).toBe(0);
      expect(stats.beasts).toBe(0);
      expect(stats.techniques).toBe(0);
      expect(stats.artifacts).toBe(0);
      expect(stats.averageHp).toBe(0);
    });
  });
});
