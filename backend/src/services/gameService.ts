import { GameState, Player, GameAction, Card, CardType, Attack } from '../models/types';
import { createDeck } from '../models/cards';
import { v4 as uuidv4 } from 'uuid';
import logger, { gameLogger, createTimer } from '../utils/logger';

export class GameService {
  private games: Map<string, GameState> = new Map();

  createGame(player1Name: string, player2Name: string, player1Mythology: string, player2Mythology: string): GameState {
    const timer = createTimer('createGame');
    const gameId = uuidv4();
    
    logger.debug('Starting game creation', {
      gameId,
      action: 'CREATE_GAME_START',
      player1Name,
      player2Name,
      player1Mythology,
      player2Mythology
    });
    
    const player1: Player = {
      id: uuidv4(),
      name: player1Name,
      nexusHp: 20,
      maxNexusHp: 20,
      hand: [],
      deck: createDeck(player1Mythology as any),
      artifacts: [],
      hasAttackedThisTurn: false
    };
    
    const player2: Player = {
      id: uuidv4(),
      name: player2Name,
      nexusHp: 20,
      maxNexusHp: 20,
      hand: [],
      deck: createDeck(player2Mythology as any),
      artifacts: [],
      hasAttackedThisTurn: false
    };

    logger.debug('Players created', {
      gameId,
      player1Id: player1.id,
      player2Id: player2.id,
      player1DeckSize: player1.deck.length,
      player2DeckSize: player2.deck.length
    });

    // Draw initial hands (3 cards each)
    this.drawCards(player1, 3);
    this.drawCards(player2, 3);

    const gameState: GameState = {
      id: gameId,
      players: [player1, player2],
      currentPlayerIndex: 0,
      phase: 'draw',
      turnCount: 1
    };

    this.games.set(gameId, gameState);
    
    gameLogger.gameCreated(gameId, player1Name, player2Name, player1Mythology, player2Mythology);
    timer.end({ gameId, totalGames: this.games.size });
    
    return gameState;
  }

  getGame(gameId: string): GameState | undefined {
    logger.debug('Getting game', { gameId, action: 'GET_GAME' });
    const game = this.games.get(gameId);
    
    if (!game) {
      logger.warn('Game not found', { gameId, action: 'GET_GAME' });
    } else {
      logger.debug('Game retrieved successfully', { 
        gameId, 
        action: 'GET_GAME',
        phase: game.phase,
        turnCount: game.turnCount,
        currentPlayerIndex: game.currentPlayerIndex
      });
    }
    
    return game;
  }

  executeAction(gameId: string, action: GameAction): GameState | null {
    const timer = createTimer(`executeAction_${action.type}`);
    logger.debug('Executing action', { 
      gameId, 
      action: action.type,
      actionData: action
    });

    const game = this.games.get(gameId);
    if (!game) {
      logger.error('Game not found for action execution', { 
        gameId, 
        action: action.type 
      });
      return null;
    }

    const currentPlayer = game.players[game.currentPlayerIndex];
    const opponent = game.players[1 - game.currentPlayerIndex];

    logger.debug('Action context', {
      gameId,
      action: action.type,
      currentPlayerId: currentPlayer.id,
      opponentId: opponent.id,
      gamePhase: game.phase,
      turnCount: game.turnCount
    });

    switch (action.type) {
      case 'DRAW_CARD':
        if (game.phase === 'draw') {
          logger.debug('Drawing card', { 
            gameId, 
            playerId: currentPlayer.id,
            action: 'DRAW_CARD',
            currentHandSize: currentPlayer.hand.length,
            deckSize: currentPlayer.deck.length
          });
          this.drawCards(currentPlayer, 1);
          game.phase = 'main';
          gameLogger.actionExecuted(gameId, currentPlayer.id, 'DRAW_CARD', true, {
            newHandSize: currentPlayer.hand.length,
            newPhase: game.phase
          });
        } else {
          gameLogger.actionBlocked(gameId, currentPlayer.id, 'DRAW_CARD', 'wrong_phase', {
            currentPhase: game.phase,
            requiredPhase: 'draw'
          });
        }
        break;

      case 'PLAY_CARD':
        if (game.phase === 'main' && action.cardId) {
          const cardIndex = currentPlayer.hand.findIndex(card => card.id === action.cardId);
          if (cardIndex !== -1) {
            const card = currentPlayer.hand[cardIndex];
            logger.debug('Playing card', {
              gameId,
              playerId: currentPlayer.id,
              action: 'PLAY_CARD',
              cardId: action.cardId,
              cardName: card.name,
              cardType: card.type
            });
            
            const success = this.playCard(currentPlayer, action.cardId);
            gameLogger.actionExecuted(gameId, currentPlayer.id, 'PLAY_CARD', success, {
              cardId: action.cardId,
              cardName: card.name,
              cardType: card.type
            });
          } else {
            gameLogger.actionBlocked(gameId, currentPlayer.id, 'PLAY_CARD', 'card_not_found', {
              cardId: action.cardId
            });
          }
        } else {
          gameLogger.actionBlocked(gameId, currentPlayer.id, 'PLAY_CARD', 
            game.phase !== 'main' ? 'wrong_phase' : 'missing_card_id', {
            currentPhase: game.phase,
            hasCardId: !!action.cardId
          });
        }
        break;

      case 'ATTACK_NEXUS':
        // No attacks allowed on the first turn
        if (game.turnCount === 1) {
          gameLogger.actionBlocked(gameId, currentPlayer.id, 'ATTACK_NEXUS', 'first_turn_restriction', {
            turnCount: game.turnCount
          });
          break;
        }
        // Only one attack per turn allowed
        if (currentPlayer.hasAttackedThisTurn) {
          gameLogger.actionBlocked(gameId, currentPlayer.id, 'ATTACK_NEXUS', 'already_attacked', {
            hasAttackedThisTurn: currentPlayer.hasAttackedThisTurn
          });
          break;
        }
        if (currentPlayer.activeBeast && action.attackIndex !== undefined) {
          const attack = currentPlayer.activeBeast.attacks?.[action.attackIndex];
          if (attack) {
            logger.debug('Attacking nexus', {
              gameId,
              attackerId: currentPlayer.id,
              defenderId: opponent.id,
              action: 'ATTACK_NEXUS',
              attackIndex: action.attackIndex,
              attackName: attack.name,
              damage: attack.damage,
              defenderCurrentHp: opponent.nexusHp
            });
            
            this.attackNexus(currentPlayer, opponent, action.attackIndex);
            currentPlayer.hasAttackedThisTurn = true;
            
            gameLogger.combat(gameId, currentPlayer.id, opponent.id, attack.name, attack.damage, 'nexus');
            
            // Only change phase to 'end' if we're currently in 'attack' phase
            if (game.phase === 'attack') {
              game.phase = 'end';
            }
          } else {
            gameLogger.actionBlocked(gameId, currentPlayer.id, 'ATTACK_NEXUS', 'invalid_attack_index', {
              attackIndex: action.attackIndex,
              availableAttacks: currentPlayer.activeBeast.attacks?.length || 0
            });
          }
        } else {
          gameLogger.actionBlocked(gameId, currentPlayer.id, 'ATTACK_NEXUS', 
            !currentPlayer.activeBeast ? 'no_active_beast' : 'missing_attack_index');
        }
        break;

      case 'ATTACK_BEAST':
        // No attacks allowed on the first turn
        if (game.turnCount === 1) {
          gameLogger.actionBlocked(gameId, currentPlayer.id, 'ATTACK_BEAST', 'first_turn_restriction', {
            turnCount: game.turnCount
          });
          break;
        }
        // Only one attack per turn allowed
        if (currentPlayer.hasAttackedThisTurn) {
          gameLogger.actionBlocked(gameId, currentPlayer.id, 'ATTACK_BEAST', 'already_attacked', {
            hasAttackedThisTurn: currentPlayer.hasAttackedThisTurn
          });
          break;
        }
        if (currentPlayer.activeBeast && opponent.activeBeast && action.attackIndex !== undefined) {
          const attack = currentPlayer.activeBeast.attacks?.[action.attackIndex];
          if (attack) {
            logger.debug('Attacking beast', {
              gameId,
              attackerId: currentPlayer.id,
              defenderId: opponent.id,
              action: 'ATTACK_BEAST',
              attackIndex: action.attackIndex,
              attackName: attack.name,
              damage: attack.damage,
              defenderBeastHp: opponent.activeBeast.hp,
              defenderBeastName: opponent.activeBeast.name
            });
            
            this.attackBeast(currentPlayer, opponent, action.attackIndex);
            currentPlayer.hasAttackedThisTurn = true;
            
            gameLogger.combat(gameId, currentPlayer.id, opponent.id, attack.name, attack.damage, 'beast');
            
            // Only change phase to 'end' if we're currently in 'attack' phase
            if (game.phase === 'attack') {
              game.phase = 'end';
            }
          } else {
            gameLogger.actionBlocked(gameId, currentPlayer.id, 'ATTACK_BEAST', 'invalid_attack_index', {
              attackIndex: action.attackIndex,
              availableAttacks: currentPlayer.activeBeast.attacks?.length || 0
            });
          }
        } else {
          const reason = !currentPlayer.activeBeast ? 'no_active_beast' : 
                        !opponent.activeBeast ? 'no_enemy_beast' : 'missing_attack_index';
          gameLogger.actionBlocked(gameId, currentPlayer.id, 'ATTACK_BEAST', reason);
        }
        break;

      case 'END_TURN':
        logger.debug('Ending turn', {
          gameId,
          playerId: currentPlayer.id,
          action: 'END_TURN',
          currentTurn: game.turnCount,
          currentPhase: game.phase
        });
        this.endTurn(game);
        gameLogger.actionExecuted(gameId, currentPlayer.id, 'END_TURN', true, {
          newCurrentPlayerIndex: game.currentPlayerIndex,
          newTurnCount: game.turnCount,
          newPhase: game.phase
        });
        break;

      case 'EQUIP_ARTIFACT':
        if (action.cardId && currentPlayer.activeBeast) {
          logger.debug('Equipping artifact', {
            gameId,
            playerId: currentPlayer.id,
            action: 'EQUIP_ARTIFACT',
            artifactId: action.cardId,
            beastName: currentPlayer.activeBeast.name
          });
          const success = this.equipArtifact(currentPlayer, action.cardId);
          gameLogger.actionExecuted(gameId, currentPlayer.id, 'EQUIP_ARTIFACT', success, {
            artifactId: action.cardId
          });
        } else {
          gameLogger.actionBlocked(gameId, currentPlayer.id, 'EQUIP_ARTIFACT', 
            !action.cardId ? 'missing_artifact_id' : 'no_active_beast');
        }
        break;

      case 'USE_ARTIFACT':
        if (action.cardId && action.targetType) {
          logger.debug('Using artifact', {
            gameId,
            playerId: currentPlayer.id,
            action: 'USE_ARTIFACT',
            artifactId: action.cardId,
            targetType: action.targetType,
            targetId: action.targetId
          });
          const success = this.useArtifact(currentPlayer, opponent, action.cardId, action.targetType, action.targetId);
          gameLogger.actionExecuted(gameId, currentPlayer.id, 'USE_ARTIFACT', success, {
            artifactId: action.cardId,
            targetType: action.targetType
          });
        } else {
          gameLogger.actionBlocked(gameId, currentPlayer.id, 'USE_ARTIFACT', 'missing_required_fields', {
            hasCardId: !!action.cardId,
            hasTargetType: !!action.targetType
          });
        }
        break;

      case 'USE_TECHNIQUE':
        logger.debug('USE_TECHNIQUE action received', {
          gameId,
          playerId: currentPlayer.id,
          action: 'USE_TECHNIQUE',
          techniqueId: action.cardId,
          targetType: action.targetType,
          targetId: action.targetId
        });
        
        if (action.cardId && action.targetType) {
          const success = this.useTechnique(currentPlayer, opponent, action.cardId, action.targetType, action.targetId);
          gameLogger.actionExecuted(gameId, currentPlayer.id, 'USE_TECHNIQUE', success, {
            techniqueId: action.cardId,
            targetType: action.targetType
          });
        } else {
          gameLogger.actionBlocked(gameId, currentPlayer.id, 'USE_TECHNIQUE', 'missing_required_fields', {
            hasCardId: !!action.cardId,
            hasTargetType: !!action.targetType
          });
        }
        break;
    }

    // Check win conditions
    this.checkWinConditions(game);
    
    this.games.set(gameId, game);
    timer.end({ gameId, action: action.type });
    return game;
  }

  private drawCards(player: Player, count: number): void {
    const initialHandSize = player.hand.length;
    const initialDeckSize = player.deck.length;
    
    logger.debug('Drawing cards', {
      playerId: player.id,
      action: 'DRAW_CARDS',
      requestedCount: count,
      initialHandSize,
      initialDeckSize
    });

    let drawnCount = 0;
    for (let i = 0; i < count && player.deck.length > 0; i++) {
      const card = player.deck.pop();
      if (card) {
        player.hand.push(card);
        drawnCount++;
        logger.debug('Card drawn', {
          playerId: player.id,
          cardId: card.id,
          cardName: card.name,
          cardType: card.type
        });
      }
    }

    if (drawnCount < count) {
      logger.warn('Insufficient cards in deck', {
        playerId: player.id,
        action: 'DRAW_CARDS',
        requestedCount: count,
        actualDrawn: drawnCount,
        deckEmpty: player.deck.length === 0
      });
    }

    logger.debug('Cards drawn successfully', {
      playerId: player.id,
      action: 'DRAW_CARDS',
      drawnCount,
      newHandSize: player.hand.length,
      newDeckSize: player.deck.length
    });
  }

  private playCard(player: Player, cardId: string): boolean {
    logger.debug('Attempting to play card', {
      playerId: player.id,
      cardId,
      action: 'PLAY_CARD',
      handSize: player.hand.length
    });

    const cardIndex = player.hand.findIndex(card => card.id === cardId);
    if (cardIndex === -1) {
      logger.warn('Card not found in hand', {
        playerId: player.id,
        cardId,
        action: 'PLAY_CARD',
        handCardIds: player.hand.map(c => c.id)
      });
      return false;
    }

    const card = player.hand[cardIndex];
    player.hand.splice(cardIndex, 1);

    logger.info('Card removed from hand', {
      playerId: player.id,
      cardId,
      cardName: card.name,
      cardType: card.type,
      newHandSize: player.hand.length
    });

    switch (card.type) {
      case CardType.BEAST:
        if (!player.activeBeast) {
          player.activeBeast = { ...card };
          logger.info('Beast summoned as active beast', {
            playerId: player.id,
            beastId: card.id,
            beastName: card.name,
            hp: card.hp,
            maxHp: card.maxHp,
            attackCount: card.attacks?.length || 0
          });
        } else {
          const oldBeast = player.activeBeast;
          player.activeBeast = { ...card };
          logger.info('Active beast replaced', {
            playerId: player.id,
            oldBeastName: oldBeast.name,
            newBeastName: card.name,
            newBeastId: card.id
          });
        }
        break;

      case CardType.TECHNIQUE:
        logger.debug('Executing technique card', {
          playerId: player.id,
          techniqueId: card.id,
          techniqueName: card.name
        });
        this.executeTechnique(player, card);
        break;

      case CardType.ARTIFACT:
        player.artifacts.push(card);
        logger.info('Artifact added to collection', {
          playerId: player.id,
          artifactId: card.id,
          artifactName: card.name,
          totalArtifacts: player.artifacts.length
        });
        break;
    }

    gameLogger.cardPlayed('game_id', player.id, card.id, card.name, card.type);
    return true;
  }

  private executeTechnique(player: Player, card: Card): void {
    if (!card.techniqueEffect) {
      logger.warn('Technique card has no effect', {
        playerId: player.id,
        cardId: card.id,
        cardName: card.name
      });
      return;
    }

    logger.debug('Executing technique', {
      playerId: player.id,
      cardId: card.id,
      cardName: card.name,
      techniqueEffect: card.techniqueEffect
    });

    try {
      const effect = JSON.parse(card.techniqueEffect);
      
      logger.debug('Parsed technique effect', {
        playerId: player.id,
        cardId: card.id,
        effectType: effect.type,
        effectAmount: effect.amount
      });
      
      switch (effect.type) {
        case 'damage':
          logger.info('Technique damage effect applied', {
            playerId: player.id,
            cardName: card.name,
            damage: effect.amount
          });
          // Technique damage logic would be implemented here
          break;
        case 'heal':
          const oldHp = player.nexusHp;
          player.nexusHp = Math.min(player.maxNexusHp, player.nexusHp + effect.amount);
          logger.info('Technique heal effect applied', {
            playerId: player.id,
            cardName: card.name,
            healAmount: effect.amount,
            oldHp,
            newHp: player.nexusHp
          });
          break;
        case 'draw':
          const drawAmount = effect.amount || 1;
          logger.info('Technique draw effect applied', {
            playerId: player.id,
            cardName: card.name,
            drawAmount,
            handSizeBefore: player.hand.length
          });
          this.drawCards(player, drawAmount);
          break;
        default:
          logger.warn('Unknown technique effect type', {
            playerId: player.id,
            cardId: card.id,
            effectType: effect.type
          });
      }
    } catch (error) {
      logger.error('Error executing technique', {
        playerId: player.id,
        cardId: card.id,
        cardName: card.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        techniqueEffect: card.techniqueEffect
      });
    }
  }

  private equipArtifact(player: Player, artifactId: string): boolean {
    logger.debug('Attempting to equip artifact', {
      playerId: player.id,
      artifactId,
      action: 'EQUIP_ARTIFACT',
      hasActiveBeast: !!player.activeBeast,
      artifactCount: player.artifacts.length
    });

    const artifactIndex = player.artifacts.findIndex(artifact => artifact.id === artifactId);
    if (artifactIndex === -1 || !player.activeBeast) {
      logger.warn('Failed to equip artifact', {
        playerId: player.id,
        artifactId,
        reason: artifactIndex === -1 ? 'artifact_not_found' : 'no_active_beast',
        availableArtifacts: player.artifacts.map(a => ({ id: a.id, name: a.name }))
      });
      return false;
    }

    const artifact = player.artifacts[artifactIndex];
    
    try {
      const effect = JSON.parse(artifact.artifactEffect || '{}');
      
      logger.info('Equipping artifact', {
        playerId: player.id,
        artifactId,
        artifactName: artifact.name,
        effectType: effect.type,
        effectAmount: effect.amount,
        beastName: player.activeBeast?.name
      });
      
      switch (effect.type) {
        case 'hp_boost':
          if (player.activeBeast) {
            const oldHp = player.activeBeast.hp || 0;
            const oldMaxHp = player.activeBeast.maxHp || 0;
            player.activeBeast.hp = oldHp + effect.amount;
            player.activeBeast.maxHp = oldMaxHp + effect.amount;
            
            logger.info('HP boost applied', {
              playerId: player.id,
              beastName: player.activeBeast.name,
              oldHp,
              newHp: player.activeBeast.hp,
              oldMaxHp,
              newMaxHp: player.activeBeast.maxHp,
              boostAmount: effect.amount
            });
          }
          break;
        case 'attack_boost':
          logger.info('Attack boost artifact equipped', {
            playerId: player.id,
            artifactId,
            boostAmount: effect.amount,
            note: 'Boost will be applied during combat'
          });
          break;
        default:
          logger.warn('Unknown artifact effect type', {
            playerId: player.id,
            artifactId,
            effectType: effect.type
          });
      }
      
      return true;
    } catch (error) {
      logger.error('Error equipping artifact', {
        playerId: player.id,
        artifactId,
        artifactName: artifact.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        artifactEffect: artifact.artifactEffect
      });
      return false;
    }
  }

  private attackNexus(attacker: Player, defender: Player, attackIndex: number): void {
    logger.debug('Attacking nexus', {
      attackerId: attacker.id,
      defenderId: defender.id,
      attackIndex,
      action: 'ATTACK_NEXUS'
    });

    if (!attacker.activeBeast || !attacker.activeBeast.attacks || attackIndex < 0 || attackIndex >= attacker.activeBeast.attacks.length) {
      logger.error('Invalid attack parameters', {
        attackerId: attacker.id,
        defenderId: defender.id,
        attackIndex,
        hasActiveBeast: !!attacker.activeBeast,
        attacksAvailable: attacker.activeBeast?.attacks?.length || 0
      });
      return;
    }

    const attack = attacker.activeBeast.attacks[attackIndex];
    if (attack) {
      const oldNexusHp = defender.nexusHp;
      defender.nexusHp = Math.max(0, defender.nexusHp - attack.damage);
      
      logger.info('Nexus attack executed', {
        attackerId: attacker.id,
        defenderId: defender.id,
        attackName: attack.name,
        damage: attack.damage,
        oldNexusHp,
        newNexusHp: defender.nexusHp,
        beastName: attacker.activeBeast.name
      });
      
      // Apply any special attack effects here
      this.applyAttackEffects(attacker, defender, attack);
      
      if (defender.nexusHp <= 0) {
        logger.warn('Nexus destroyed', {
          attackerId: attacker.id,
          defenderId: defender.id,
          attackName: attack.name,
          finalDamage: attack.damage
        });
      }
    } else {
      logger.error('Attack not found at index', {
        attackerId: attacker.id,
        attackIndex,
        availableAttacks: attacker.activeBeast.attacks.length
      });
    }
  }

  private attackBeast(attacker: Player, defender: Player, attackIndex: number): void {
    logger.debug('Attacking beast', {
      attackerId: attacker.id,
      defenderId: defender.id,
      attackIndex,
      action: 'ATTACK_BEAST'
    });

    if (!attacker.activeBeast || !defender.activeBeast || !attacker.activeBeast.attacks || attackIndex < 0 || attackIndex >= attacker.activeBeast.attacks.length) {
      logger.error('Invalid beast attack parameters', {
        attackerId: attacker.id,
        defenderId: defender.id,
        attackIndex,
        attackerHasBeast: !!attacker.activeBeast,
        defenderHasBeast: !!defender.activeBeast,
        attacksAvailable: attacker.activeBeast?.attacks?.length || 0
      });
      return;
    }

    const attack = attacker.activeBeast.attacks[attackIndex];
    if (attack && defender.activeBeast) {
      const oldBeastHp = defender.activeBeast.hp || 0;
      defender.activeBeast.hp = Math.max(0, oldBeastHp - attack.damage);
      
      logger.info('Beast attack executed', {
        attackerId: attacker.id,
        defenderId: defender.id,
        attackName: attack.name,
        damage: attack.damage,
        attackerBeastName: attacker.activeBeast.name,
        defenderBeastName: defender.activeBeast.name,
        oldBeastHp,
        newBeastHp: defender.activeBeast.hp
      });
      
      // Apply any special attack effects
      this.applyAttackEffects(attacker, defender, attack);
      
      // Remove beast if HP reaches 0
      if (defender.activeBeast.hp <= 0) {
        const destroyedBeast = defender.activeBeast;
        defender.activeBeast = undefined;
        logger.warn('Beast destroyed', {
          attackerId: attacker.id,
          defenderId: defender.id,
          destroyedBeastName: destroyedBeast.name,
          attackName: attack.name,
          finalDamage: attack.damage
        });
      }
    } else {
      logger.error('Beast attack failed - invalid attack or target', {
        attackerId: attacker.id,
        defenderId: defender.id,
        attackIndex,
        hasAttack: !!attack,
        hasDefenderBeast: !!defender.activeBeast
      });
    }
  }

  private endTurn(game: GameState): void {
    const currentPlayer = game.players[game.currentPlayerIndex];
    const nextPlayerIndex = 1 - game.currentPlayerIndex;
    const nextPlayer = game.players[nextPlayerIndex];

    logger.info('Ending turn', {
      gameId: game.id,
      action: 'END_TURN',
      currentPlayerId: currentPlayer.id,
      nextPlayerId: nextPlayer.id,
      currentTurn: game.turnCount,
      currentPhase: game.phase
    });

    // Reset attack flags for both players at the start of a new turn
    game.players[0].hasAttackedThisTurn = false;
    game.players[1].hasAttackedThisTurn = false;
    
    logger.debug('Attack flags reset', {
      gameId: game.id,
      player1HasAttacked: game.players[0].hasAttackedThisTurn,
      player2HasAttacked: game.players[1].hasAttackedThisTurn
    });
    
    game.currentPlayerIndex = nextPlayerIndex;
    game.phase = 'draw';
    game.turnCount++;

    logger.info('Turn ended successfully', {
      gameId: game.id,
      newCurrentPlayerId: nextPlayer.id,
      newTurnCount: game.turnCount,
      newPhase: game.phase,
      previousPlayerId: currentPlayer.id
    });

    gameLogger.gameStateChanged(game.id, game.phase, game.currentPlayerIndex, game.turnCount);
  }

  private checkWinConditions(game: GameState): void {
    const [player1, player2] = game.players;

    logger.debug('Checking win conditions', {
      gameId: game.id,
      player1NexusHp: player1.nexusHp,
      player2NexusHp: player2.nexusHp,
      player1HasActiveBeast: !!player1.activeBeast,
      player2HasActiveBeast: !!player2.activeBeast
    });

    // Check if either player's Nexus HP is 0
    if (player1.nexusHp <= 0) {
      game.winner = player2.id;
      logger.warn('Game ended - Player 1 nexus destroyed', {
        gameId: game.id,
        winnerId: player2.id,
        winnerName: player2.name,
        loserId: player1.id,
        loserName: player1.name,
        reason: 'nexus_destroyed'
      });
      gameLogger.gameEnded(game.id, player2.id, 'nexus_destroyed');
    } else if (player2.nexusHp <= 0) {
      game.winner = player1.id;
      logger.warn('Game ended - Player 2 nexus destroyed', {
        gameId: game.id,
        winnerId: player1.id,
        winnerName: player1.name,
        loserId: player2.id,
        loserName: player2.name,
        reason: 'nexus_destroyed'
      });
      gameLogger.gameEnded(game.id, player1.id, 'nexus_destroyed');
    }

    // Check if player has no beasts and can't play any
    for (let i = 0; i < 2; i++) {
      const player = game.players[i];
      const opponent = game.players[1 - i];
      
      if (!player.activeBeast) {
        const hasBeasts = player.hand.some(card => card.type === CardType.BEAST) || 
                         player.deck.some(card => card.type === CardType.BEAST);
        
        logger.debug('Checking beast availability', {
          gameId: game.id,
          playerId: player.id,
          hasActiveBeast: false,
          hasBeatsInHand: player.hand.some(card => card.type === CardType.BEAST),
          hasBeastsInDeck: player.deck.some(card => card.type === CardType.BEAST),
          totalBeasts: hasBeasts
        });
        
        if (!hasBeasts) {
          game.winner = opponent.id;
          logger.warn('Game ended - Player has no beasts', {
            gameId: game.id,
            winnerId: opponent.id,
            winnerName: opponent.name,
            loserId: player.id,
            loserName: player.name,
            reason: 'no_beasts_available'
          });
          gameLogger.gameEnded(game.id, opponent.id, 'no_beasts_available');
        }
      }
    }
  }

  private applyAttackEffects(attacker: Player, defender: Player, attack: Attack): void {
    logger.debug('Applying attack effects', {
      attackerId: attacker.id,
      defenderId: defender.id,
      attackName: attack.name,
      action: 'APPLY_ATTACK_EFFECTS'
    });

    // Handle special attack effects based on attack properties
    
    // Example: Life Drain attack (heals attacker)
    if (attack.name === 'Life Drain' && attacker.activeBeast) {
      const healAmount = 2; // Fixed heal amount for Life Drain
      const oldHp = attacker.activeBeast.hp || 0;
      const maxHp = attacker.activeBeast.maxHp || attacker.activeBeast.hp || 0;
      
      attacker.activeBeast.hp = Math.min(maxHp, oldHp + healAmount);
      
      logger.info('Life Drain effect applied', {
        attackerId: attacker.id,
        beastName: attacker.activeBeast.name,
        healAmount,
        oldHp,
        newHp: attacker.activeBeast.hp,
        maxHp
      });
    }
    
    // Example: Regeneration attack (heals self or ally)
    if (attack.name === 'Regeneration' && attacker.activeBeast) {
      const healAmount = 3; // Fixed heal amount for Regeneration
      const oldHp = attacker.activeBeast.hp || 0;
      const maxHp = attacker.activeBeast.maxHp || attacker.activeBeast.hp || 0;
      
      attacker.activeBeast.hp = Math.min(maxHp, oldHp + healAmount);
      
      logger.info('Regeneration effect applied', {
        attackerId: attacker.id,
        beastName: attacker.activeBeast.name,
        healAmount,
        oldHp,
        newHp: attacker.activeBeast.hp,
        maxHp
      });
    }
    
    // Log if no special effects were applied
    if (attack.name !== 'Life Drain' && attack.name !== 'Regeneration') {
      logger.debug('No special attack effects for this attack', {
        attackerId: attacker.id,
        attackName: attack.name
      });
    }
  }

  private useArtifact(player: Player, opponent: Player, artifactId: string, targetType: string, targetId?: string): boolean {
    logger.debug('Using artifact', {
      playerId: player.id,
      artifactId,
      targetType,
      targetId,
      action: 'USE_ARTIFACT',
      handSize: player.hand.length
    });

    // Find the artifact in player's hand
    const artifactIndex = player.hand.findIndex(card => card.id === artifactId);
    if (artifactIndex === -1) {
      logger.warn('Artifact not found in hand', {
        playerId: player.id,
        artifactId,
        handCardIds: player.hand.map(c => c.id)
      });
      return false;
    }

    const artifact = player.hand[artifactIndex];
    if (artifact.type !== CardType.ARTIFACT) {
      logger.warn('Card is not an artifact', {
        playerId: player.id,
        cardId: artifactId,
        cardType: artifact.type
      });
      return false;
    }

    try {
      const effect = JSON.parse(artifact.artifactEffect || '{}');
      
      logger.debug('Parsed artifact effect', {
        playerId: player.id,
        artifactId,
        effectType: effect.type,
        effectAmount: effect.amount,
        targetType
      });
      
      // Determine the target based on targetType
      let target = null;
      switch (targetType) {
        case 'ally_beast':
          target = player.activeBeast;
          logger.debug('Target: ally beast', { beastName: target?.name });
          break;
        case 'enemy_beast':
          target = opponent.activeBeast;
          logger.debug('Target: enemy beast', { beastName: target?.name });
          break;
        case 'ally_nexus':
          target = player;
          logger.debug('Target: ally nexus', { nexusHp: player.nexusHp });
          break;
        case 'enemy_nexus':
          target = opponent;
          logger.debug('Target: enemy nexus', { nexusHp: opponent.nexusHp });
          break;
      }

      if (!target) {
        logger.warn('No valid target found', {
          playerId: player.id,
          artifactId,
          targetType
        });
        return false;
      }

      // Apply the artifact effect
      switch (effect.type) {
        case 'direct_damage':
          if (targetType === 'enemy_nexus' || targetType === 'ally_nexus') {
            const nexusTarget = target as Player;
            const oldHp = nexusTarget.nexusHp;
            nexusTarget.nexusHp = Math.max(0, nexusTarget.nexusHp - effect.amount);
            logger.info('Artifact direct damage to nexus', {
              playerId: player.id,
              artifactName: artifact.name,
              targetPlayerId: nexusTarget.id,
              damage: effect.amount,
              oldHp,
              newHp: nexusTarget.nexusHp
            });
          } else if (targetType === 'enemy_beast' || targetType === 'ally_beast') {
            const beastTarget = target as Card;
            if (beastTarget.hp !== undefined) {
              const oldHp = beastTarget.hp;
              beastTarget.hp = Math.max(0, beastTarget.hp - effect.amount);
              logger.info('Artifact direct damage to beast', {
                playerId: player.id,
                artifactName: artifact.name,
                beastName: beastTarget.name,
                damage: effect.amount,
                oldHp,
                newHp: beastTarget.hp
              });
              
              // Remove beast if HP reaches 0
              if (beastTarget.hp <= 0) {
                if (targetType === 'enemy_beast') {
                  opponent.activeBeast = undefined;
                  logger.warn('Enemy beast destroyed by artifact', {
                    playerId: player.id,
                    artifactName: artifact.name,
                    destroyedBeast: beastTarget.name
                  });
                } else {
                  player.activeBeast = undefined;
                  logger.warn('Ally beast destroyed by artifact', {
                    playerId: player.id,
                    artifactName: artifact.name,
                    destroyedBeast: beastTarget.name
                  });
                }
              }
            }
          }
          break;

        case 'heal':
          if (targetType === 'enemy_nexus' || targetType === 'ally_nexus') {
            const nexusTarget = target as Player;
            const oldHp = nexusTarget.nexusHp;
            nexusTarget.nexusHp = Math.min(nexusTarget.maxNexusHp, nexusTarget.nexusHp + effect.amount);
            logger.info('Artifact heal to nexus', {
              playerId: player.id,
              artifactName: artifact.name,
              targetPlayerId: nexusTarget.id,
              healAmount: effect.amount,
              oldHp,
              newHp: nexusTarget.nexusHp
            });
          } else if (targetType === 'enemy_beast' || targetType === 'ally_beast') {
            const beastTarget = target as Card;
            if (beastTarget.hp !== undefined && beastTarget.maxHp !== undefined) {
              const oldHp = beastTarget.hp;
              beastTarget.hp = Math.min(beastTarget.maxHp, beastTarget.hp + effect.amount);
              logger.info('Artifact heal to beast', {
                playerId: player.id,
                artifactName: artifact.name,
                beastName: beastTarget.name,
                healAmount: effect.amount,
                oldHp,
                newHp: beastTarget.hp
              });
            }
          }
          break;

        case 'heal_nexus':
          if (targetType === 'ally_nexus') {
            const oldHp = player.nexusHp;
            player.nexusHp = Math.min(player.maxNexusHp, player.nexusHp + effect.amount);
            logger.info('Artifact nexus heal', {
              playerId: player.id,
              artifactName: artifact.name,
              healAmount: effect.amount,
              oldHp,
              newHp: player.nexusHp
            });
          }
          break;

        case 'attack_boost':
          if (targetType === 'ally_beast' && player.activeBeast && player.activeBeast.attacks) {
            // Boost all attacks
            player.activeBeast.attacks.forEach((attack, index) => {
              const oldDamage = attack.damage;
              attack.damage += effect.amount;
              logger.info('Attack boosted', {
                playerId: player.id,
                artifactName: artifact.name,
                beastName: player.activeBeast!.name,
                attackIndex: index,
                attackName: attack.name,
                oldDamage,
                newDamage: attack.damage,
                boost: effect.amount
              });
            });
          }
          break;

        case 'damage_reduction':
          if (targetType === 'ally_beast' && player.activeBeast) {
            // Add damage reduction effect (this could be stored as a temporary effect)
            // For now, we'll increase HP to simulate damage reduction
            if (player.activeBeast.maxHp !== undefined) {
              const oldHp = player.activeBeast.hp || 0;
              const oldMaxHp = player.activeBeast.maxHp;
              player.activeBeast.maxHp += effect.amount;
              player.activeBeast.hp = oldHp + effect.amount;
              logger.info('Damage reduction applied', {
                playerId: player.id,
                artifactName: artifact.name,
                beastName: player.activeBeast.name,
                reductionAmount: effect.amount,
                oldHp,
                newHp: player.activeBeast.hp,
                oldMaxHp,
                newMaxHp: player.activeBeast.maxHp
              });
            }
          }
          break;

        case 'curse':
          if (targetType === 'enemy_beast' && opponent.activeBeast && opponent.activeBeast.attacks) {
            // Reduce attack damage
            opponent.activeBeast.attacks.forEach((attack, index) => {
              const oldDamage = attack.damage;
              attack.damage = Math.max(1, attack.damage - effect.amount);
              logger.info('Curse applied to attack', {
                playerId: player.id,
                artifactName: artifact.name,
                targetBeast: opponent.activeBeast!.name,
                attackIndex: index,
                attackName: attack.name,
                oldDamage,
                newDamage: attack.damage,
                reduction: effect.amount
              });
            });
          }
          break;

        case 'dispel':
          if (targetType === 'enemy_beast' && opponent.activeBeast) {
            // Remove all positive effects (for now, just reset attacks to base values)
            // This is a simplified implementation
            logger.info('Dispel effect applied', {
              playerId: player.id,
              artifactName: artifact.name,
              targetBeast: opponent.activeBeast.name,
              note: 'Positive effects removed (simplified implementation)'
            });
          }
          break;

        default:
          logger.warn('Unknown artifact effect type', {
            playerId: player.id,
            artifactId,
            effectType: effect.type
          });
      }

      // Remove the artifact from hand after use
      player.hand.splice(artifactIndex, 1);
      logger.info('Artifact consumed', {
        playerId: player.id,
        artifactName: artifact.name,
        newHandSize: player.hand.length
      });
      
      return true;
    } catch (error) {
      logger.error('Error using artifact', {
        playerId: player.id,
        artifactId,
        artifactName: artifact.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        artifactEffect: artifact.artifactEffect
      });
      return false;
    }
  }

  private useTechnique(player: Player, opponent: Player, techniqueId: string, targetType: string, targetId?: string): boolean {
    logger.debug('Using technique', {
      playerId: player.id,
      techniqueId,
      targetType,
      targetId,
      action: 'USE_TECHNIQUE',
      handSize: player.hand.length
    });
    
    // Find the technique in player's hand
    const techniqueIndex = player.hand.findIndex(card => card.id === techniqueId);
    if (techniqueIndex === -1) {
      logger.warn('Technique not found in hand', {
        playerId: player.id,
        techniqueId,
        handCardIds: player.hand.map(c => c.id)
      });
      return false;
    }

    const technique = player.hand[techniqueIndex];
    logger.debug('Found technique', {
      playerId: player.id,
      techniqueId,
      techniqueName: technique.name,
      techniqueType: technique.type
    });
    
    if (technique.type !== CardType.TECHNIQUE) {
      logger.warn('Card is not a technique', {
        playerId: player.id,
        cardId: techniqueId,
        cardType: technique.type,
        expectedType: CardType.TECHNIQUE
      });
      return false;
    }

    try {
      const effect = JSON.parse(technique.techniqueEffect || '{}');
      logger.debug('Parsed technique effect', {
        playerId: player.id,
        techniqueId,
        effectType: effect.type,
        effectAmount: effect.amount,
        targetType
      });
      
      // Determine the target based on targetType
      let target = null;
      switch (targetType) {
        case 'ally_beast':
          target = player.activeBeast;
          logger.debug('Target: ally beast', {
            playerId: player.id,
            beastName: target?.name,
            beastHp: target?.hp
          });
          break;
        case 'enemy_beast':
          target = opponent.activeBeast;
          logger.debug('Target: enemy beast', {
            playerId: player.id,
            beastName: target?.name,
            beastHp: target?.hp
          });
          break;
        case 'ally_nexus':
          target = player;
          logger.debug('Target: ally nexus', {
            playerId: player.id,
            nexusHp: player.nexusHp,
            maxNexusHp: player.maxNexusHp
          });
          break;
        case 'enemy_nexus':
          target = opponent;
          logger.debug('Target: enemy nexus', {
            playerId: player.id,
            targetPlayerId: opponent.id,
            nexusHp: opponent.nexusHp,
            maxNexusHp: opponent.maxNexusHp
          });
          break;
      }

      if (!target) {
        logger.warn('No valid target found', {
          playerId: player.id,
          techniqueId,
          targetType,
          allyBeastExists: !!player.activeBeast,
          enemyBeastExists: !!opponent.activeBeast
        });
        return false;
      }

      logger.debug('About to apply technique effect', {
        playerId: player.id,
        techniqueName: technique.name,
        effectType: effect.type,
        effectAmount: effect.amount
      });

      // Apply the technique effect - only damage or heal
      switch (effect.type) {
        case 'damage':
          if (targetType === 'enemy_nexus' || targetType === 'ally_nexus') {
            const nexusTarget = target as Player;
            const oldHp = nexusTarget.nexusHp;
            nexusTarget.nexusHp = Math.max(0, nexusTarget.nexusHp - effect.amount);
            logger.info('Technique damage applied to nexus', {
              playerId: player.id,
              techniqueName: technique.name,
              targetPlayerId: nexusTarget.id,
              damage: effect.amount,
              oldHp,
              newHp: nexusTarget.nexusHp
            });
          } else if (targetType === 'enemy_beast' || targetType === 'ally_beast') {
            const beastTarget = target as Card;
            if (beastTarget.hp !== undefined) {
              const oldHp = beastTarget.hp;
              beastTarget.hp = Math.max(0, beastTarget.hp - effect.amount);
              logger.info('Technique damage applied to beast', {
                playerId: player.id,
                techniqueName: technique.name,
                beastName: beastTarget.name,
                damage: effect.amount,
                oldHp,
                newHp: beastTarget.hp
              });
              
              // Remove beast if HP reaches 0
              if (beastTarget.hp <= 0) {
                if (targetType === 'enemy_beast') {
                  opponent.activeBeast = undefined;
                  logger.warn('Enemy beast destroyed by technique', {
                    playerId: player.id,
                    techniqueName: technique.name,
                    destroyedBeast: beastTarget.name
                  });
                } else {
                  player.activeBeast = undefined;
                  logger.warn('Ally beast destroyed by technique', {
                    playerId: player.id,
                    techniqueName: technique.name,
                    destroyedBeast: beastTarget.name
                  });
                }
              }
            } else {
              logger.error('Beast target has no HP property', {
                playerId: player.id,
                techniqueId,
                beastName: beastTarget.name
              });
            }
          }
          break;

        case 'heal':
          if (targetType === 'ally_nexus' || targetType === 'enemy_nexus') {
            const nexusTarget = target as Player;
            const oldHp = nexusTarget.nexusHp;
            nexusTarget.nexusHp = Math.min(nexusTarget.maxNexusHp, nexusTarget.nexusHp + effect.amount);
            logger.info('Technique heal applied to nexus', {
              playerId: player.id,
              techniqueName: technique.name,
              targetPlayerId: nexusTarget.id,
              healAmount: effect.amount,
              oldHp,
              newHp: nexusTarget.nexusHp
            });
          } else if (targetType === 'ally_beast' || targetType === 'enemy_beast') {
            const beastTarget = target as Card;
            if (beastTarget.hp !== undefined && beastTarget.maxHp !== undefined) {
              const oldHp = beastTarget.hp;
              beastTarget.hp = Math.min(beastTarget.maxHp, beastTarget.hp + effect.amount);
              logger.info('Technique heal applied to beast', {
                playerId: player.id,
                techniqueName: technique.name,
                beastName: beastTarget.name,
                healAmount: effect.amount,
                oldHp,
                newHp: beastTarget.hp
              });
            } else {
              logger.error('Beast target missing HP or maxHp properties', {
                playerId: player.id,
                techniqueId,
                beastName: beastTarget.name,
                hasHp: beastTarget.hp !== undefined,
                hasMaxHp: beastTarget.maxHp !== undefined
              });
            }
          }
          break;
          
        default:
          logger.warn('Unknown technique effect type', {
            playerId: player.id,
            techniqueId,
            effectType: effect.type
          });
      }

      // Remove the technique from hand after use
      player.hand.splice(techniqueIndex, 1);
      logger.info('Technique consumed', {
        playerId: player.id,
        techniqueName: technique.name,
        newHandSize: player.hand.length
      });
      
      return true;
    } catch (error) {
      logger.error('Error using technique', {
        playerId: player.id,
        techniqueId,
        techniqueName: technique.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        techniqueEffect: technique.techniqueEffect
      });
      return false;
    }
  }
}

export const gameService = new GameService();
