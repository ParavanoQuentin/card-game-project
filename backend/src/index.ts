import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeSocketHandler } from './services/socketHandler';
import { gameService } from './services/gameService';
import { authService } from './services/authService';
import { userStore } from './services/userStore';
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

const PORT = process.env.PORT || 3001;

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
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Aether Beasts API is running' });
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

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
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

// Admin-only endpoints
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

    // Check if user is admin
    if (payload.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    // Add user info to request for later use
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

// Get all users (admin only)
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = userStore.getAllUsers();
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

// Delete user (admin only)
app.delete('/api/admin/users/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    // Prevent admin from deleting themselves
    if (userId === currentUser.userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    const deleted = await userStore.deleteUser(userId);
    
    if (deleted) {
      console.log(`User ${userId} deleted by admin ${currentUser.username}`);
      res.status(200).json({ 
        success: true, 
        message: 'User deleted successfully' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user' 
    });
  }
});

// Update user role (admin only)
app.put('/api/admin/users/:userId/role', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const currentUser = (req as any).user;

    // Validate role
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be "user" or "admin"' 
      });
    }

    // Prevent admin from demoting themselves
    if (userId === currentUser.userId && role === 'user') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot change your own role' 
      });
    }

    const updatedUser = await userStore.updateUserRole(userId, role);
    
    if (updatedUser) {
      console.log(`User ${updatedUser.username} role changed to ${role} by admin ${currentUser.username}`);
      res.status(200).json({ 
        success: true, 
        message: `User role updated to ${role}`,
        user: userStore.userToProfile(updatedUser)
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user role' 
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

// Initialize Socket.IO handlers
initializeSocketHandler(io);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(PORT, () => {
  console.log(`🚀 Aether Beasts server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
  console.log(`📡 Server listening on http://localhost:${PORT}`);
  console.log(`🌐 Try connecting to: http://localhost:${PORT}/api/health`);
});
