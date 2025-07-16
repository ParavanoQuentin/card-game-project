import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function viewDatabaseContents() {
  console.log('📊 Current Database Contents\n');

  try {
    // Count cards by mythology and type
    const cards = await prisma.card.findMany();
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, createdAt: true }
    });

    console.log(`🃏 Cards: ${cards.length} total`);
    
    const mythologies = ['greek', 'egyptian', 'norse', 'chinese'];
    const types = ['beast', 'technique', 'artifact'];
    
    for (const mythology of mythologies) {
      const mythologyCards = cards.filter(card => card.mythology === mythology);
      if (mythologyCards.length > 0) {
        console.log(`  ${mythology.toUpperCase()}: ${mythologyCards.length} cards`);
        
        for (const type of types) {
          const typeCards = mythologyCards.filter(card => card.type === type);
          if (typeCards.length > 0) {
            console.log(`    ${type}: ${typeCards.length}`);
          }
        }
      }
    }

    console.log(`\n👥 Users: ${users.length} total`);
    users.forEach(user => {
      console.log(`  ${user.username} (${user.email}) - Created: ${user.createdAt.toISOString().split('T')[0]}`);
    });

    // Show some sample cards
    console.log('\n🎯 Sample Cards:');
    const sampleCards = cards.slice(0, 5);
    sampleCards.forEach(card => {
      console.log(`  ${card.name} (${card.mythology}/${card.type}) - ${card.description.substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('❌ Error reading database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

viewDatabaseContents();
