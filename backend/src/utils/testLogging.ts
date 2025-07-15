import { gameService } from '../services/gameService';
import logger, { gameLogger } from '../utils/logger';

// Test script to generate sample game actions for logging demonstration
async function testGameLogging() {
  logger.info('Starting game logging test', { action: 'TEST_START' });

  try {
    // Create a new game
    const game = gameService.createGame('TestPlayer1', 'TestPlayer2', 'chinese', 'egyptian');
    
    logger.info('Test game created successfully', { 
      gameId: game.id,
      action: 'TEST_GAME_CREATED'
    });

    // Simulate some game actions
    const currentPlayer = game.players[game.currentPlayerIndex];
    const actions = [
      { type: 'DRAW_CARD' as const, playerId: currentPlayer.id },
      { type: 'END_TURN' as const, playerId: currentPlayer.id },
      { type: 'DRAW_CARD' as const, playerId: game.players[1 - game.currentPlayerIndex].id },
      { type: 'END_TURN' as const, playerId: game.players[1 - game.currentPlayerIndex].id },
    ];

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      logger.debug(`Executing test action ${i + 1}/${actions.length}`, {
        gameId: game.id,
        action: action.type,
        actionIndex: i
      });

      const result = gameService.executeAction(game.id, action);
      
      if (result) {
        logger.info('Test action executed successfully', {
          gameId: game.id,
          action: action.type,
          success: true,
          newPhase: result.phase,
          turnCount: result.turnCount
        });
      } else {
        logger.error('Test action failed', {
          gameId: game.id,
          action: action.type,
          success: false
        });
      }

      // Add small delay between actions
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Test error logging
    try {
      // This should generate an error log
      gameService.executeAction('invalid-game-id', { type: 'DRAW_CARD', playerId: 'test-player' });
    } catch (error) {
      logger.error('Expected error for testing', {
        action: 'TEST_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    logger.info('Game logging test completed successfully', { 
      action: 'TEST_COMPLETE',
      totalActions: actions.length
    });

  } catch (error) {
    logger.error('Game logging test failed', {
      action: 'TEST_FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testGameLogging().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

export { testGameLogging };
