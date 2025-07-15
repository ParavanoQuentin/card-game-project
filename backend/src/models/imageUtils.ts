import { Mythology, CardType } from './types';

/**
 * Generates the local image path for a card based on its properties
 * @param cardId - The unique identifier of the card
 * @param mythology - The mythology the card belongs to
 * @param type - The type of card (beast, technique, artifact)
 * @returns The relative path to the card image
 */
export function getCardImagePath(cardId: string, mythology: Mythology, type: CardType): string {
  // Remove mythology prefix from cardId to get the actual card name
  const cardName = cardId.replace(`${mythology}_`, '');
  
  // Convert card name to match file naming convention
  const fileName = cardName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  // Return path relative to public directory
  return `/images/cards/${mythology}/${fileName}.svg`;
}

/**
 * Generates a fallback image path if the specific card image doesn't exist
 * @param type - The type of card
 * @param mythology - The mythology the card belongs to
 * @returns The path to a fallback image
 */
export function getFallbackImagePath(type: CardType, mythology: Mythology): string {
  return `/images/cards/fallback/${type}_${mythology}.svg`;
}

/**
 * Generates a default placeholder image path
 * @param type - The type of card
 * @returns The path to a generic placeholder image
 */
export function getPlaceholderImagePath(type: CardType): string {
  return `/images/cards/placeholder/${type}.svg`;
}
