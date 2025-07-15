# 🚀 Aether Beasts - Deployment Guide

## Quick Start Options

### Option 1: Local Development (Recommended for testing)

1. **Prerequisites:**

   - Node.js 18+ installed
   - Git installed

2. **Start the game:**

   ```bash
   # Windows
   ./start-dev.bat

   # Linux/Mac
   chmod +x start-dev.sh
   ./start-dev.sh
   ```

3. **Access the game:**
   - Frontend: <http://localhost:3000>
   - Backend API: <http://localhost:3001>

### Option 2: Manual Setup

1. **Backend Setup:**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Setup (in another terminal):**

   ```bash
   cd frontend
   npm install
   npm start
   ```

### Option 3: Docker Deployment

1. **Using Docker Compose:**

   ```bash
   cd infra
   docker-compose up --build
   ```

2. **Access the game:**
   - Game: <http://localhost>
   - API: <http://localhost/api>

## Testing the Setup

Run the API test script:

```bash
# Make sure backend is running first
chmod +x test-api.sh
./test-api.sh
```

## Game Features

### Implemented Features

- **Homepage**: Game introduction and navigation
- **Deck Creator**: Build decks from 4 mythologies with card illustrations
- **Combat System**: Real-time multiplayer battles with strategic attack choices
- **WebSocket Communication**: Real-time game updates
- **Card Database**: 16 unique illustrated cards across 4 mythologies
- **Multiple Attacks**: Each beast has 2-3 different attacks to choose from
- **Turn-based Gameplay**: Complete game mechanics with player-controlled attacks

### How to Play

1. **Start from Homepage**

   - Choose "Create Deck" or "Quick Battle"

2. **Deck Creation**

   - Select a mythology (Greek, Egyptian, Norse, Chinese)
   - Build a 10-card deck with illustrated cards
   - Mix of Beasts, Techniques, and Artifacts
   - Each card features unique artwork representing the mythological theme

3. **Combat**
   - Enter your name and select mythology
   - Wait for matchmaking
   - Play turn-based battles:
     - **Play Phase**: Play beast/technique/artifact cards from hand
     - **Attack Phase**: **SELECT** which beast attack to use from multiple options, then choose targets
     - **End Turn**: Pass turn to opponent
   - Reduce opponent's Nexus HP to 0 to win

### Game Mechanics

- **Starting State**: 3 cards in hand, 20 Nexus HP
- **Turn Flow**: Draw → Play Cards → **Actively Use Beast Attacks** → End Turn
- **Beast Attacks**: Each beast card has specific attacks that **you must manually choose and execute** during your turn
- **Player Action Required**: Beast attacks are NOT automatic - you decide which attack to use and what to target
- **Win Conditions**: Reduce opponent Nexus to 0 OR eliminate all their beasts
- **Card Types**:
  - **Beasts**: Creatures with HP that can perform attacks each turn
  - **Techniques**: One-time effect spells
  - **Artifacts**: Permanent equipment buffs for beasts

### Combat System

- **Card Illustrations**: Every card features unique artwork from the respective mythology
- **Beast Attacks**: Each beast has 2-3 different attacks that the player must actively choose to use
- **Attack Selection**: Click on your beast card to see available attacks, select one, then choose target
- **Attack Types**:
  - Direct damage attacks
  - Healing attacks (heal yourself or allies)
  - Special effects (prevent enemy attacks, poison, card draw, etc.)
- **Player Choice**: During your turn, select which beast attacks to use and which targets to attack
- **Strategic Decisions**: Choose between attacking enemy beasts, enemy Nexus, or using defensive/healing abilities

### 📖 Combat Example

**Turn Structure:**

1. **Draw Phase**: Draw 1 card from deck
2. **Play Phase**: Play cards from hand (beasts, techniques, artifacts)
3. **Attack Phase**:
   - Select each beast you control
   - Choose their attack from available options
   - Select target (enemy beast or enemy Nexus)
   - Execute the attack effects
4. **End Phase**: Pass turn to opponent

**Example Beast Attacks:**

- **Minotaure**: "Charge" (4 damage) or "Horn Strike" (3 damage)
- **Méduse**: "Life Drain" (3 damage + heal) or "Stone Gaze" (2 damage + disable)
- **Hydre**: "Regeneration" (heal ally), "Multi-Head Strike" (3 damage), or "Venomous Bite" (2 damage + poison)
- **Chinese Dragon**: "Dragon Fire" (5 damage), "Wisdom Beam" (3 damage + card draw), or "Wind Dance" (2 damage + self heal)

**Strategic Decisions:**

- Choose between different attacks with varying damage and effects
- Attack enemy beasts to eliminate threats
- Attack enemy Nexus for direct damage
- Use healing attacks to keep your beasts alive
- Use control attacks to disrupt enemy strategy
- Select the right attack for each situation

## Troubleshooting

### Common Issues

1. **Port conflicts:**

   - Backend needs port 3001
   - Frontend needs port 3000
   - Check for existing processes: `netstat -an | grep :3001`

2. **Dependencies issues:**

   - Delete `node_modules` and run `npm install` again
   - Ensure Node.js 18+ is installed

3. **WebSocket connection fails:**
   - Check backend is running on port 3001
   - Verify CORS settings in backend
   - Check browser console for errors

### Environment Variables

**Frontend (.env):**

```txt
REACT_APP_BACKEND_URL=http://localhost:3001
```

**Backend (.env):**

```ini
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Production Deployment

### Docker Production Setup

1. **Build containers:**

   ```bash
   docker-compose -f infra/docker-compose.yml up --build -d
   ```

2. **With SSL (requires certificates):**
   - Place SSL certificates in `infra/nginx/ssl/`
   - Uncomment HTTPS server block in `nginx.conf`
   - Update environment variables for HTTPS URLs

### Cloud Deployment

**Recommended platforms:**

- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Heroku, AWS ECS, or Google Cloud Run
- **Database**: PostgreSQL on AWS RDS or Google Cloud SQL

**Environment setup for production:**

```bash
# Frontend
REACT_APP_BACKEND_URL=https://your-api-domain.com

# Backend
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NODE_ENV=production
```

## Database Setup (Optional)

For persistent game history and user accounts:

1. **PostgreSQL Setup:**

   ```bash
   # Using Docker
   docker run -d --name aether-db \
     -e POSTGRES_DB=aether_beasts \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=password123 \
     -p 5432:5432 postgres:15-alpine
   ```

2. **Initialize Database:**

   ```bash
   psql -h localhost -U postgres -d aether_beasts -f db/init.sql
   ```

## Performance Optimization

### Frontend Optimizations

- Enable code splitting for routes
- Implement card image lazy loading
- Use React.memo for card components
- Optimize bundle size with webpack-bundle-analyzer

### Backend Optimizations

- Implement Redis for session management
- Add rate limiting for API endpoints
- Use database connection pooling
- Implement proper logging with Winston

## Security Considerations

### For Production

- Implement JWT authentication
- Add input validation and sanitization
- Use HTTPS everywhere
- Implement proper CORS policies
- Add rate limiting and DDoS protection
- Regular security audits with `npm audit`

## Monitoring and Logging

### Recommended Tools

- **Application Monitoring**: New Relic, DataDog
- **Error Tracking**: Sentry
- **Logs**: ELK Stack or CloudWatch
- **Uptime Monitoring**: Pingdom, UptimeRobot

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## Support

- Create issues for bugs or feature requests
- Check existing documentation and README
- Test API endpoints with the provided test script

---

**Enjoy playing Aether Beasts!**
