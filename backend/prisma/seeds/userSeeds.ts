import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedUsers(prisma: PrismaClient) {
  console.log('👥 Seeding users...');

  try {
    // Clear existing users (this will also clear related games due to cascading)
    await prisma.user.deleteMany();
    console.log('  Cleared existing users');

    // Create sample users
    const sampleUsers = [
      {
        id: 'admin-user-001',
        username: 'admin',
        email: 'admin@aetherbeasts.com',
        password: 'Password123!',
      },
      {
        id: 'player-001',
        username: 'player1',
        email: 'player1@example.com',
        password: 'Password123!',
      },
      {
        id: 'player-002',
        username: 'player2',
        email: 'player2@example.com',
        password: 'Password123!',
      },
      {
        id: 'test-user-001',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      },
      {
        id: 'demo-user-001',
        username: 'demouser',
        email: 'demo@example.com',
        password: 'Password123!',
      },
    ];

    // Hash passwords and create users
    const usersToInsert = await Promise.all(
      sampleUsers.map(async (user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: await bcrypt.hash(user.password, 12),
      }))
    );

    // Insert users
    for (const user of usersToInsert) {
      await prisma.user.create({
        data: user,
      });
      console.log(`  Created user: ${user.username} (${user.email})`);
    }

    console.log(`✅ Successfully seeded ${usersToInsert.length} users`);

    // Log user information for development
    console.log('📝 Sample login credentials:');
    sampleUsers.forEach(user => {
      console.log(`  ${user.username}: ${user.email} / ${user.password}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}
