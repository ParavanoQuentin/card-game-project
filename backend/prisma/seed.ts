import { PrismaClient } from '@prisma/client';
import { seedCards } from './seeds/cardSeeds';
import { seedUsers } from './seeds/userSeeds';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  try {
    // Seed cards first since they don't depend on other entities
    await seedCards(prisma);
    
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
