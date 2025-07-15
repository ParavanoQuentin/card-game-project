# Aether Beasts - Mythological Card Game

A real-time multiplayer card game featuring legendary creatures from four ancient mythologies: Greek, Egyptian, Norse, and Chinese.

## Game Overview

**Aether Beasts** is a strategic 2-player turn-based card game where players command powerful mythological creatures in epic battles. Each player builds a deck from a single mythology and battles to reduce their opponent's Nexus HP to zero.

### Game Rules

- **Objective**: Reduce opponent's Nexus HP to 0 or eliminate all their beasts
- **Deck**: 10 cards from one mythology (Beasts, Techniques, Artifacts)
- **Starting**: 3 cards in hand, 20 Nexus HP
- **Turn Flow**: Draw → Play cards → Attack → End turn
- **Victory**: First to destroy opponent's Nexus or leave them without beasts

## Project Structure

```
/card-game-project/
│
├── frontend/                  # React TypeScript App
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Main pages (Home, Deck Creator, Combat)
│   │   ├── services/          # WebSocket & API services
│   │   ├── store/             # Zustand state management
│   │   ├── types/             # TypeScript definitions
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
│
├── backend/                   # Node.js + Socket.IO API
│   ├── src/
│   │   ├── models/            # Game types & card database
│   │   ├── services/          # Game logic & WebSocket handlers
│   │   └── index.ts
│   ├── Dockerfile
│   └── package.json
│
├── infra/                     # Infrastructure & DevOps
│   ├── nginx/
│   │   └── nginx.conf         # Reverse proxy configuration
│   └── docker-compose.yml     # Multi-container orchestration
│
├── db/                        # Database scripts
│   └── init.sql              # PostgreSQL initialization
│
├── .env
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (optional)
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd card-game-project
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the Game**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Docker Setup

1. **Start all services**
   ```bash
   cd infra
   docker-compose up --build
   ```

2. **Access the Game**
   - Game: http://localhost
   - API: http://localhost/api

## Features

### Core Gameplay
- Real-time multiplayer with WebSocket
- Turn-based combat system
- Four mythology themes (Greek, Egyptian, Norse, Chinese)
- Three card types (Beasts, Techniques, Artifacts)
- Deck building with 10-card limit
- Strategic gameplay with HP, attacks, and effects

### Technical Features
- React + TypeScript frontend
- Node.js + Socket.IO backend
- Zustand state management
- Real-time game synchronization
- Docker containerization
- Nginx reverse proxy
- PostgreSQL database support

### Pages & Components
- **Homepage**: Game introduction and navigation
- **Deck Creator**: Build custom decks by mythology
- **Combat Page**: Real-time multiplayer battles

## 🎴 Card Types

### Beasts
Powerful creatures with HP and attacks
- **Greek**: Zeus, Medusa
- **Egyptian**: Anubis, Sphinx  
- **Norse**: Thor, Fenrir
- **Chinese**: Azure Dragon, Phoenix

### Techniques
One-time effect cards
- Damage spells
- Healing abilities
- Draw effects

### Artifacts
Permanent equipment for beasts
- HP boosts
- Attack enhancements
- Passive abilities

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **Socket.IO Client** - Real-time communication
- **CSS3** - Styling & animations

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - WebSocket communication
- **TypeScript** - Type safety

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy & load balancer
- **PostgreSQL** - Database (optional)

## 🎨 Game Design

### Visual Theme
- Dark fantasy aesthetic
- Mythology-specific color schemes
- Glowing card effects
- Responsive design for all devices

### User Experience
- Intuitive drag-and-drop (planned)
- Real-time game updates
- Clear turn indicators
- Comprehensive game log

## 🔧 Development

### Available Scripts

**Frontend:**
```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
```

**Backend:**
```bash
npm run dev        # Development with nodemon
npm run build      # TypeScript compilation
npm start          # Production server
```

### Environment Variables

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=http://localhost:3001
```

**Backend (.env):**
```
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## 🚧 Future Enhancements

- [ ] User authentication & accounts
- [ ] Ranked matchmaking system
- [ ] Tournament modes
- [ ] Card animations & effects
- [ ] Sound effects & music
- [ ] Mobile app versions
- [ ] Spectator mode
- [ ] Replay system
- [ ] Custom card creation tools

## 📝 API Endpoints

### REST API
- `GET /api/health` - Health check
- `GET /api/cards` - Get all cards
- `GET /api/cards/:mythology` - Get cards by mythology
- `GET /api/mythologies` - Get available mythologies

### WebSocket Events
- `join_matchmaking` - Join game queue
- `game_action` - Send game action
- `game_started` - Game begins
- `game_updated` - Game state change
- `game_ended` - Game finished

## 🏆 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by classic TCGs like Magic: The Gathering
- Mythology references from various cultural sources
- Open source community for tools and libraries

---

**Aether Beasts** - *Where legends clash in digital realms*
