import { prisma } from './databaseService';

export interface GameData {
  [key: string]: any;
}

export interface GameActionData {
  [key: string]: any;
}

class GameDatabaseService {
  /**
   * Create a new game record
   */
  async createGame(
    player1Name: string,
    player2Name: string,
    player1Mythology: string,
    player2Mythology: string,
    player1Id?: string,
    player2Id?: string
  ) {
    return prisma.game.create({
      data: {
        player1Id,
        player2Id,
        player1Name,
        player2Name,
        player1Mythology,
        player2Mythology,
        gameData: '{}', // Initialize with empty object
      }
    });
  }

  /**
   * Update game data
   */
  async updateGameData(gameId: string, gameData: GameData) {
    return prisma.game.update({
      where: { id: gameId },
      data: {
        gameData: JSON.stringify(gameData)
      }
    });
  }

  /**
   * End a game
   */
  async endGame(gameId: string, winnerId?: string) {
    return prisma.game.update({
      where: { id: gameId },
      data: {
        endedAt: new Date(),
        winnerId
      }
    });
  }

  /**
   * Get game by ID
   */
  async getGame(gameId: string) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        player1: true,
        player2: true,
        winner: true,
        gameActions: {
          orderBy: { turnNumber: 'asc' }
        }
      }
    });

    if (game && game.gameData) {
      // Parse JSON string back to object
      try {
        const parsedGameData = JSON.parse(game.gameData);
        return { ...game, gameData: parsedGameData };
      } catch (error) {
        console.error('Error parsing game data:', error);
        return { ...game, gameData: {} };
      }
    }

    return game;
  }

  /**
   * Add a game action
   */
  async addGameAction(
    gameId: string,
    actionType: string,
    actionData: GameActionData,
    turnNumber?: number,
    playerId?: string
  ) {
    return prisma.gameAction.create({
      data: {
        gameId,
        playerId,
        actionType,
        actionData: JSON.stringify(actionData),
        turnNumber
      }
    });
  }

  /**
   * Get recent games
   */
  async getRecentGames(limit: number = 10) {
    return prisma.game.findMany({
      orderBy: { startedAt: 'desc' },
      take: limit,
      include: {
        player1: {
          select: { id: true, username: true }
        },
        player2: {
          select: { id: true, username: true }
        },
        winner: {
          select: { id: true, username: true }
        }
      }
    });
  }

  /**
   * Get games for a user
   */
  async getUserGames(userId: string) {
    return prisma.game.findMany({
      where: {
        OR: [
          { player1Id: userId },
          { player2Id: userId }
        ]
      },
      orderBy: { startedAt: 'desc' },
      include: {
        player1: {
          select: { id: true, username: true }
        },
        player2: {
          select: { id: true, username: true }
        },
        winner: {
          select: { id: true, username: true }
        }
      }
    });
  }

  /**
   * Get game statistics
   */
  async getGameStats() {
    const totalGames = await prisma.game.count();
    const completedGames = await prisma.game.count({
      where: { endedAt: { not: null } }
    });
    const activeGames = totalGames - completedGames;

    return {
      totalGames,
      completedGames,
      activeGames
    };
  }
}

export const gameDatabaseService = new GameDatabaseService();
