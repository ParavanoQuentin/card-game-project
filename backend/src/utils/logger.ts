import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

// Determine log directory based on environment
const logDir = process.env.NODE_ENV === 'production' ? '/app/logs' : path.join(__dirname, '../../logs');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, service, gameId, playerId, action, ...meta } = info;
    return JSON.stringify({
      timestamp,
      level,
      service,
      message,
      gameId,
      playerId,
      action,
      ...meta
    });
  })
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'card-game-backend',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      level: 'info'
    }),
    // Separate file for errors
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Debug file for development
    new winston.transports.File({
      filename: path.join(logDir, 'debug.log'),
      level: 'debug',
      maxsize: 10485760, // 10MB
      maxFiles: 3,
    }),
    // Console transport with color formatting
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: 'HH:mm:ss'
        }),
        winston.format.printf((info) => {
          const { timestamp, level, message, gameId, playerId, action } = info;
          let logLine = `${timestamp} [${level}] ${message}`;
          
          if (gameId && typeof gameId === 'string') logLine += ` [Game: ${gameId.substring(0, 8)}]`;
          if (playerId && typeof playerId === 'string') logLine += ` [Player: ${playerId.substring(0, 8)}]`;
          if (action && typeof action === 'string') logLine += ` [Action: ${action}]`;
          
          return logLine;
        })
      )
    })
  ]
});

// Performance timing utilities
export const createTimer = (label: string) => {
  const start = Date.now();
  return {
    end: (metadata?: any) => {
      const duration = Date.now() - start;
      logger.debug(`Performance: ${label}`, {
        duration_ms: duration,
        performance_label: label,
        ...metadata
      });
      return duration;
    }
  };
};

// Game-specific logging helpers
export const gameLogger = {
  gameCreated: (gameId: string, player1Name: string, player2Name: string, player1Mythology: string, player2Mythology: string) => {
    logger.info('Game created', {
      gameId,
      action: 'GAME_CREATED',
      player1Name,
      player2Name,
      player1Mythology,
      player2Mythology
    });
  },

  actionExecuted: (gameId: string, playerId: string, action: string, success: boolean, metadata?: any) => {
    logger.info(`Action ${success ? 'executed' : 'failed'}`, {
      gameId,
      playerId,
      action,
      success,
      ...metadata
    });
  },

  actionBlocked: (gameId: string, playerId: string, action: string, reason: string, metadata?: any) => {
    logger.warn('Action blocked', {
      gameId,
      playerId,
      action,
      reason,
      blocked: true,
      ...metadata
    });
  },

  gameStateChanged: (gameId: string, phase: string, currentPlayerIndex: number, turnCount: number) => {
    logger.info('Game state changed', {
      gameId,
      action: 'STATE_CHANGE',
      phase,
      currentPlayerIndex,
      turnCount
    });
  },

  cardPlayed: (gameId: string, playerId: string, cardId: string, cardName: string, cardType: string) => {
    logger.info('Card played', {
      gameId,
      playerId,
      action: 'CARD_PLAYED',
      cardId,
      cardName,
      cardType
    });
  },

  combat: (gameId: string, attackerId: string, defenderId: string, attackName: string, damage: number, targetType: string) => {
    logger.info('Combat action', {
      gameId,
      attackerId,
      defenderId,
      action: 'COMBAT',
      attackName,
      damage,
      targetType
    });
  },

  gameEnded: (gameId: string, winnerId: string, reason: string) => {
    logger.info('Game ended', {
      gameId,
      action: 'GAME_ENDED',
      winnerId,
      reason
    });
  },

  error: (gameId: string, playerId: string, action: string, error: Error, metadata?: any) => {
    logger.error('Game error occurred', {
      gameId,
      playerId,
      action,
      error: error.message,
      stack: error.stack,
      ...metadata
    });
  }
};

export default logger;
