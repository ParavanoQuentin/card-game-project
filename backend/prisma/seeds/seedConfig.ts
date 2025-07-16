// Configuration for different card seed datasets
export interface SeedConfig {
  name: string;
  description: string;
  cardDatasetPath: string;
}

export const SEED_CONFIGS: Record<string, SeedConfig> = {
  updated: {
    name: 'Updated Cards',
    description: 'Latest updated card dataset with balanced stats',
    cardDatasetPath: '../src/models/cards_updated',
  },
  original: {
    name: 'Original Cards',
    description: 'Original card dataset',
    cardDatasetPath: '../src/models/cards',
  },
  withNewCards: {
    name: 'Cards with New Cards',
    description: 'Card dataset including new additions',
    cardDatasetPath: '../src/models/cards_with_new_cards',
  },
  backup: {
    name: 'Backup Cards',
    description: 'Backup card dataset',
    cardDatasetPath: '../src/models/cards_backup',
  },
  new: {
    name: 'New Cards',
    description: 'New card dataset',
    cardDatasetPath: '../src/models/cards_new',
  },
};

export const DEFAULT_SEED_CONFIG = 'updated';
