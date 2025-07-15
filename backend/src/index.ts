import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { databaseService } from './services/databaseService';
import { initializeSocketHandler } from './services/socketHandler';
import { gameService } from './services/gameService';
import { authService } from './services/authService';
import { userService } from './services/userService';
import { gameDatabaseService } from './services/gameDatabaseService';
import { CARD_DATABASE, getCardsByMythology } from './models/cards';
import { Mythology } from './models/types';
import { LoginRequest, RegisterRequest, ChangePasswordRequest } from './models/user';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3002",
      "http://localhost:3001"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

console.log('📡 Socket.IO server initialized with CORS origins:', [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3002", 
  "http://localhost:3001"
]);

const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3002",
    "http://localhost:3001"
  ]
}));
app.use(express.json());

// Routes
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await databaseService.healthCheck();
    res.json({ 
      status: 'OK', 
      message: 'Aether Beasts API is running',
      database: dbHealth ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/cards', (req, res) => {
  res.json(CARD_DATABASE);
});

app.get('/api/cards/:mythology', (req, res) => {
  const mythology = req.params.mythology as Mythology;
  const cards = getCardsByMythology(mythology);
  res.json(cards);
});

app.get('/api/mythologies', (req, res) => {
  res.json(Object.values(Mythology));
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const registerData: RegisterRequest = req.body;
    const result = await authService.register(registerData);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Registration endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const loginData: LoginRequest = req.body;
    const result = await authService.login(loginData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

app.get('/api/auth/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No valid authorization token provided' 
      });
    }

    const token = authHeader.substring(7);
    const user = await authService.validateTokenAndGetUser(token);
    
    if (user) {
      res.status(200).json({ 
        success: true, 
        user 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
  } catch (error) {
    console.error('Profile endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

app.post('/api/auth/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No valid authorization token provided' 
      });
    }

    const token = authHeader.substring(7);
    const payload = authService.verifyToken(token);
    if (!payload) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    const changePasswordData = req.body;
    const result = await authService.changePassword(payload.userId, changePasswordData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Change password endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Games API endpoints
app.get('/api/games/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const games = await gameDatabaseService.getRecentGames(limit);
    res.json({ success: true, games });
  } catch (error) {
    console.error('Get recent games error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch recent games' 
    });
  }
});

app.get('/api/games/stats', async (req, res) => {
  try {
    const stats = await gameDatabaseService.getGameStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch game statistics' 
    });
  }
});

app.get('/api/games/:gameId', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const game = await gameDatabaseService.getGame(gameId);
    
    if (!game) {
      return res.status(404).json({ 
        success: false, 
        message: 'Game not found' 
      });
    }
    
    res.json({ success: true, game });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch game' 
    });
  }
});

app.post('/api/test-game', (req, res) => {
  try {
    const { player1Name, player2Name, player1Mythology, player2Mythology } = req.body;
    const game = gameService.createGame(player1Name, player2Name, player1Mythology, player2Mythology);
    res.json(game);
  } catch (error) {
    console.error('Error creating test game:', error);
    res.status(500).json({ error: 'Failed to create test game' });
  }
});

// Admin middleware
const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No valid authorization token provided' 
      });
    }

    const token = authHeader.substring(7);
    const payload = authService.verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Check if user is admin (note: role is not in DB schema yet, so this will default to false)
    if (payload.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    (req as any).user = payload;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Admin routes
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ 
      success: true, 
      users,
      count: users.length 
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
});

app.delete('/api/admin/users/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    if (userId === currentUser.userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    await userService.deleteUser(userId);
    
    console.log(`User ${userId} deleted by admin ${currentUser.username}`);
    res.status(200).json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user' 
    });
  }
});

// Initialize Socket.IO handlers
initializeSocketHandler(io);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize database and start server
async function startServer() {
  try {
    await databaseService.connect();
    
    server.listen(PORT, () => {
      console.log(`🚀 Aether Beasts server running on port ${PORT}`);
      console.log(`WebSocket server ready for connections`);
      console.log(`📡 Server listening on http://localhost:${PORT}`);
      console.log(`🌐 Try connecting to: http://localhost:${PORT}/api/health`);
      console.log(`💾 Database connected and ready`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

// Start the server
startServer();

// Prisma with SQLite is successfully configured!
