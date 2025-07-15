import { io, Socket } from 'socket.io-client';
import { GameState, GameAction, Mythology } from '../types/game';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.connected) {
        console.log('Already connected to server');
        resolve();
        return;
      }

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      console.log('Attempting to connect to:', backendUrl);
      
      // Add timeout to prevent hanging
      const connectionTimeout = setTimeout(() => {
        console.error('Connection timeout after 15 seconds');
        reject(new Error('Connection timeout - server may be unreachable'));
      }, 15000); // 15 second timeout
      
      this.socket = io(backendUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000
      });
      
      this.socket.on('connect', () => {
        clearTimeout(connectionTimeout);
        console.log('✅ Connected to server successfully');
        console.log('Socket ID:', this.socket?.id);
        console.log('Transport:', this.socket?.io?.engine?.transport?.name);
        resolve();
      });
      
      this.socket.on('connect_error', (error) => {
        clearTimeout(connectionTimeout);
        console.error('❌ Connection error details:', error);
        console.error('Error message:', error.message);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from server. Reason:', reason);
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          console.log('Server disconnected, attempting to reconnect...');
        }
        this.emit('disconnected');
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected to server after', attemptNumber, 'attempts');
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('🔄❌ Reconnection failed:', error);
      });
      
      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.emit('disconnected');
      });
      
      this.socket.on('game_started', (data: { gameState: GameState, yourPlayerId: string }) => {
        this.emit('game_started', data);
      });
      
      this.socket.on('game_updated', (gameState: GameState) => {
        this.emit('game_updated', gameState);
      });
      
      this.socket.on('game_ended', (data: { winner: string, gameState: GameState }) => {
        this.emit('game_ended', data);
      });
      
      this.socket.on('waiting_for_opponent', () => {
        this.emit('waiting_for_opponent');
      });
      
      this.socket.on('opponent_disconnected', () => {
        this.emit('opponent_disconnected');
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinMatchmaking(playerName: string, mythology: Mythology): void {
    if (this.socket) {
      this.socket.emit('join_matchmaking', { playerName, mythology });
    }
  }

  leaveMatchmaking(): void {
    if (this.socket) {
      this.socket.emit('leave_matchmaking');
    }
  }

  sendGameAction(gameId: string, action: GameAction): void {
    if (this.socket) {
      this.socket.emit('game_action', { gameId, action });
    }
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
