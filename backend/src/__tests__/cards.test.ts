import { CARD_DATABASE, getCardsByMythology, createDeck } from '../models/cards';
import { Mythology, CardType } from '../models/types';

describe('Cards Database', () => {
  describe('CARD_DATABASE', () => {
    test('should contain cards', () => {
      expect(CARD_DATABASE).toBeDefined();
      expect(CARD_DATABASE.length).toBeGreaterThan(0);
    });

    test('should contain all new Greek mythology cards', () => {
      const greekCards = CARD_DATABASE.filter(card => card.mythology === Mythology.GREEK);
      
      // Vérifier que les nouvelles cartes sont présentes
      const cardNames = greekCards.map(card => card.name);
      expect(cardNames).toContain('Harpie');
      expect(cardNames).toContain('Chimère');
      expect(cardNames).toContain('Satyre');
      expect(cardNames).toContain('Cyclope');
    });

    test('should have valid card structure', () => {
      CARD_DATABASE.forEach(card => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('name');
        expect(card).toHaveProperty('type');
        expect(card).toHaveProperty('mythology');
        expect(card).toHaveProperty('description');
        expect(card).toHaveProperty('imageUrl');
        
        // Les cartes de type BEAST doivent avoir hp et attacks
        if (card.type === CardType.BEAST) {
          expect(card).toHaveProperty('hp');
          expect(card).toHaveProperty('maxHp');
          expect(card).toHaveProperty('attacks');
          expect(card.hp).toBeGreaterThan(0);
          expect(card.maxHp).toBeGreaterThan(0);
          expect(Array.isArray(card.attacks)).toBe(true);
        }
      });
    });

    test('Greek beast cards should have correct HP values', () => {
      const greekBeasts = CARD_DATABASE.filter(
        card => card.mythology === Mythology.GREEK && card.type === CardType.BEAST
      );

      const harpie = greekBeasts.find(card => card.name === 'Harpie');
      const chimere = greekBeasts.find(card => card.name === 'Chimère');
      const satyre = greekBeasts.find(card => card.name === 'Satyre');
      const cyclope = greekBeasts.find(card => card.name === 'Cyclope');

      expect(harpie?.hp).toBe(5);
      expect(chimere?.hp).toBe(8);
      expect(satyre?.hp).toBe(6);
      expect(cyclope?.hp).toBe(9);
    });
  });

  describe('getCardsByMythology', () => {
    test('should return only Greek cards when mythology is GREEK', () => {
      const greekCards = getCardsByMythology(Mythology.GREEK);
      
      expect(greekCards.length).toBeGreaterThan(0);
      greekCards.forEach(card => {
        expect(card.mythology).toBe(Mythology.GREEK);
      });
    });

    test('should return only Egyptian cards when mythology is EGYPTIAN', () => {
      const egyptianCards = getCardsByMythology(Mythology.EGYPTIAN);
      
      expect(egyptianCards.length).toBeGreaterThan(0);
      egyptianCards.forEach(card => {
        expect(card.mythology).toBe(Mythology.EGYPTIAN);
      });
    });

    test('should return empty array for non-existent mythology', () => {
      const result = getCardsByMythology('NON_EXISTENT' as Mythology);
      expect(result).toEqual([]);
    });
  });

  describe('createDeck', () => {
    test('should create a balanced deck for Greek mythology', () => {
      const deck = createDeck(Mythology.GREEK);
      
      expect(deck).toBeDefined();
      expect(Array.isArray(deck)).toBe(true);
      
      const beasts = deck.filter(card => card.type === CardType.BEAST);
      const techniques = deck.filter(card => card.type === CardType.TECHNIQUE);
      const artifacts = deck.filter(card => card.type === CardType.ARTIFACT);
      
      expect(beasts.length).toBeLessThanOrEqual(4);
      expect(techniques.length).toBeLessThanOrEqual(3);
      expect(artifacts.length).toBeLessThanOrEqual(3);
    });

    test('should only include cards from specified mythology', () => {
      const greekDeck = createDeck(Mythology.GREEK);
      
      greekDeck.forEach(card => {
        expect(card.mythology).toBe(Mythology.GREEK);
      });
    });
  });
});
