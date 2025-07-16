# Database Seeding Guide

This guide explains how to use the Prisma seeding system for the Aether Beasts card game.

## Overview

The seeding system populates the database with:
- **Cards**: Game cards from various mythologies (Greek, Egyptian, Norse, Chinese)
- **Users**: Sample user accounts for testing and development

## Available Seed Configurations

The system supports multiple card datasets:

| Config Name | Command | Description | Total Cards |
|-------------|---------|-------------|-------------|
| `updated` | `npm run db:seed:updated` | Latest updated card dataset with balanced stats | 24 cards |
| `original` | `npm run db:seed:original` | Original card dataset | 32 cards |
| `new` | `npm run db:seed:new` | New card dataset | Varies |
| `backup` | `npm run db:seed:backup` | Backup card dataset | Varies |
| `withNewCards` | `npm run db:seed:with-new` | Card dataset including new additions | Varies |

## Quick Start Commands

### Basic Seeding
```bash
# Use default configuration (updated cards)
npm run db:seed

# Use specific configuration
npm run db:seed:original
npm run db:seed:updated
npm run db:seed:new
```

### Database Management
```bash
# Reset database and run migrations
npm run db:reset

# Generate Prisma client (run after schema changes)
npm run db:generate

# Create new migration
npm run db:migrate

# Push schema changes (development only)
npm run db:push
```

## Sample User Accounts

After seeding, these test accounts are available:

| Username | Email | Password | Role |
|----------|-------|----------|------|
| `admin` | admin@aetherbeasts.com | admin123 | Admin |
| `player1` | player1@example.com | password123 | User |
| `player2` | player2@example.com | password123 | User |
| `testuser` | test@example.com | testpassword | User |
| `demouser` | demo@example.com | demo123 | User |

## Card Distribution

Each mythology typically includes:
- **4 Beast cards**: Combat units with HP and attacks
- **2 Technique cards**: One-time effect cards
- **2 Artifact cards**: Persistent buff cards

Available mythologies:
- **Greek**: Minotaur, Medusa, Cerberus, Hydra + techniques & artifacts
- **Egyptian**: Anubis, Sphinx, Mummy, Scarab + techniques & artifacts
- **Norse**: Thor, Loki, Fenrir, Valkyrie + techniques & artifacts
- **Chinese**: Dragon, Phoenix, Qilin, Baihu + techniques & artifacts

## Development Workflow

1. **Initial Setup**:
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

2. **After Schema Changes**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

3. **Testing Different Card Sets**:
   ```bash
   npm run db:seed:original    # Test with original cards
   npm run db:seed:updated     # Test with updated cards
   ```

4. **Fresh Start**:
   ```bash
   npm run db:reset            # Resets database and runs seeds
   ```

## Database Schema

### Cards Table
- `id`: Unique card identifier
- `name`: Display name
- `type`: beast/technique/artifact
- `mythology`: greek/egyptian/norse/chinese
- `description`: Card description
- `imageUrl`: Path to card image
- Beast fields: `hp`, `maxHp`, `attacks`, `passiveEffect`
- Technique fields: `techniqueEffect`
- Artifact fields: `artifactEffect`

### Users Table
- `id`: UUID
- `username`: Unique username
- `email`: Unique email
- `passwordHash`: Bcrypt hashed password
- Timestamps: `createdAt`, `updatedAt`

## File Structure

```
backend/prisma/
├── schema.prisma              # Database schema
├── seed.ts                    # Main seed script
├── seedWithConfig.ts          # Configurable seed script
└── seeds/
    ├── seedConfig.ts          # Seed configurations
    ├── cardSeeds.ts           # Card seeding logic
    └── userSeeds.ts           # User seeding logic
```

## Troubleshooting

### Common Issues

1. **"Property 'card' does not exist"**
   ```bash
   npm run db:generate
   ```

2. **Migration conflicts**
   ```bash
   npm run db:reset
   ```

3. **TypeScript errors**
   ```bash
   npm install @types/node
   ```

### Logging

The seed scripts provide detailed output including:
- Number of cards seeded per mythology
- Card type distribution
- User creation status
- Sample login credentials

## Adding New Card Sets

1. Create new card data file in `src/models/`
2. Add configuration to `seedConfig.ts`
3. Add npm script to `package.json`
4. Test with `npm run db:seed:your-config`

## Production Notes

- Never run seeding scripts in production
- Use environment-specific configurations
- Always backup production data before migrations
- Consider using separate staging/dev databases
