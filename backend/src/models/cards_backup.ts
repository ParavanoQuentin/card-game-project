import { Card, CardType, Mythology } from './types';

export const CARD_DATABASE: Card[] = [
  {
    id: 'greek_minotaur',
    name: 'Minotaure',
    type: CardType.BEAST,
    mythology: Mythology.GREEK,
    description: 'Attaque : Inflige 4 dégâts',
    hp: 5,
    maxHp: 5,
    attacks: [
      { name: 'Charge', damage: 4, description: 'Inflige 4 dégâts' }
    ]
  }
];

export function getCardsByMythology(mythology: Mythology): Card[] {
  return CARD_DATABASE.filter(card => card.mythology === mythology);
}

export function generateDeck(mythology: Mythology): Card[] {
  return CARD_DATABASE.slice(0, 10);
}

export const createDeck = generateDeck;
