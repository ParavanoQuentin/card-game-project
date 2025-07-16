import { PrismaClient } from '@prisma/client';
import { SEED_CONFIGS, DEFAULT_SEED_CONFIG, SeedConfig } from './seedConfig';

export async function seedCards(prisma: PrismaClient, configName: string = DEFAULT_SEED_CONFIG) {
  console.log('🃏 Seeding cards...');

  const config = SEED_CONFIGS[configName];
  if (!config) {
    throw new Error(`Unknown seed config: ${configName}. Available configs: ${Object.keys(SEED_CONFIGS).join(', ')}`);
  }

  console.log(`  Using dataset: ${config.name} - ${config.description}`);

  try {
    // Dynamically import the card dataset
    const { CARD_DATABASE } = await import(config.cardDatasetPath);
    
    // Clear existing cards
    await prisma.card.deleteMany();
    console.log('  Cleared existing cards');

    // Transform card data to match Prisma schema
    const cardsToInsert = CARD_DATABASE.map((card: any) => ({
      id: card.id,
      name: card.name,
      type: card.type,
      mythology: card.mythology,
      description: card.description,
      imageUrl: card.imageUrl || null,
      
      // Beast specific fields
      hp: card.hp || null,
      maxHp: card.maxHp || null,
      attacks: card.attacks ? JSON.stringify(card.attacks) : null,
      passiveEffect: card.passiveEffect ? JSON.stringify(card.passiveEffect) : null,
      
      // Technique specific fields
      techniqueEffect: card.techniqueEffect || null,
      
      // Artifact specific fields
      artifactEffect: card.artifactEffect || null,
    }));

    // Insert cards in batches to avoid potential memory issues
    const batchSize = 50;
    for (let i = 0; i < cardsToInsert.length; i += batchSize) {
      const batch = cardsToInsert.slice(i, i + batchSize);
      await prisma.card.createMany({
        data: batch,
      });
      console.log(`  Inserted cards batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(cardsToInsert.length / batchSize)}`);
    }

    console.log(`✅ Successfully seeded ${cardsToInsert.length} cards from ${config.name} dataset`);
    
    // Log summary by mythology and type
    const mythologies = ['greek', 'egyptian', 'norse', 'chinese'];
    const types = ['beast', 'technique', 'artifact'];
    
    console.log('📊 Card distribution:');
    for (const mythology of mythologies) {
      const mythologyCards = cardsToInsert.filter((card: any) => card.mythology === mythology);
      if (mythologyCards.length > 0) {
        console.log(`  ${mythology.toUpperCase()}: ${mythologyCards.length} cards`);
        
        for (const type of types) {
          const typeCards = mythologyCards.filter((card: any) => card.type === type);
          if (typeCards.length > 0) {
            console.log(`    ${type}: ${typeCards.length}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error seeding cards:', error);
    throw error;
  }
}
