import { Server as SocketIOServer, Socket } from 'socket.io';
import { gameService } from '../services/gameService';
import { GameAction, Mythology } from '../models/types';

interface SocketData {
  playerId?: string;
  gameId?: string;
  playerName?: string;
}

export class SocketHandler {
  private io: SocketIOServer;
  private waitingPlayers: Map<string, { socket: Socket, playerName: string, mythology: Mythology }> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    console.log('🔧 Setting up Socket.IO event handlers...');
    
    this.io.on('connection', (socket: Socket) => {
      console.log(`Player connected: ${socket.id} from ${socket.handshake.address}`);

      socket.on('join_matchmaking', (data: { playerName: string, mythology: Mythology }) => {
        console.log(`Player ${socket.id} joining matchmaking:`, data);
        this.handleJoinMatchmaking(socket, data);
      });

      socket.on('game_action', (data: { gameId: string, action: GameAction }) => {
        console.log(`Game action from ${socket.id}:`, data.action.type);
        this.handleGameAction(socket, data);
      });

      socket.on('leave_matchmaking', () => {
        console.log(`🚪 Player ${socket.id} leaving matchmaking`);
        this.handleLeaveMatchmaking(socket);
      });

      socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        this.handleDisconnect(socket);
      });
    });
    
    this.io.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });
  }

  private handleJoinMatchmaking(socket: Socket, data: { playerName: string, mythology: Mythology }): void {
    const { playerName, mythology } = data;
    
    // Check if there's already a waiting player
    const waitingPlayerEntries = Array.from(this.waitingPlayers.entries());
    
    if (waitingPlayerEntries.length > 0) {
      // Match with first waiting player
      const [waitingSocketId, waitingPlayerData] = waitingPlayerEntries[0];
      this.waitingPlayers.delete(waitingSocketId);
      
      // Create game
      const game = gameService.createGame(
        waitingPlayerData.playerName,
        playerName,
        waitingPlayerData.mythology,
        mythology
      );

      // Join both players to game room
      const waitingSocket = this.io.sockets.sockets.get(waitingSocketId);
      if (waitingSocket) {
        waitingSocket.join(game.id);
        socket.join(game.id);

        // Store game info in socket data
        waitingSocket.data = { 
          ...waitingSocket.data, 
          gameId: game.id, 
          playerId: game.players[0].id 
        };
        socket.data = { 
          ...socket.data, 
          gameId: game.id, 
          playerId: game.players[1].id 
        };

        // Notify both players
        this.io.to(game.id).emit('game_started', {
          gameState: game,
          yourPlayerId: game.players[0].id
        });
        
        socket.emit('game_started', {
          gameState: game,
          yourPlayerId: game.players[1].id
        });
      }
    } else {
      // Add to waiting list
      this.waitingPlayers.set(socket.id, { socket, playerName, mythology });
      socket.emit('waiting_for_opponent');
    }
  }

  private handleGameAction(socket: Socket, data: { gameId: string, action: GameAction }): void {
    const { gameId, action } = data;
    
    const updatedGame = gameService.executeAction(gameId, action);
    
    if (updatedGame) {
      // Broadcast updated game state to all players in the game
      this.io.to(gameId).emit('game_updated', updatedGame);
      
      // If game has ended, notify players
      if (updatedGame.winner) {
        this.io.to(gameId).emit('game_ended', {
          winner: updatedGame.winner,
          gameState: updatedGame
        });
      }
    }
  }

  private handleLeaveMatchmaking(socket: Socket): void {
    this.waitingPlayers.delete(socket.id);
    socket.emit('left_matchmaking');
  }

  private handleDisconnect(socket: Socket): void {
    console.log(`Player disconnected: ${socket.id}`);
    this.waitingPlayers.delete(socket.id);
    
    // Handle in-game disconnection
    const socketData = socket.data as SocketData;
    if (socketData.gameId) {
      socket.to(socketData.gameId).emit('opponent_disconnected');
    }
  }
}

export function initializeSocketHandler(io: SocketIOServer): SocketHandler {
  return new SocketHandler(io);
}
