import { PrismaClient } from '@prisma/client';
import { seedCards } from './seeds/cardSeeds';
import { seedUsers } from './seeds/userSeeds';
import { SEED_CONFIGS } from './seeds/seedConfig';

const prisma = new PrismaClient();

async function main() {
  // Get the config from command line args or use default
  const configName = process.argv[2] || 'updated';
  
  console.log('Starting database seeding...');
  console.log(`Available configs: ${Object.keys(SEED_CONFIGS).join(', ')}`);
  console.log(`Using config: ${configName}`);

  if (!SEED_CONFIGS[configName]) {
    console.error(`❌ Unknown config: ${configName}`);
    console.log(`Available configs: ${Object.keys(SEED_CONFIGS).join(', ')}`);
    process.exit(1);
  }

  try {
    // Seed cards with specified config
    await seedCards(prisma, configName);
    
    // Seed users
    await seedUsers(prisma);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
