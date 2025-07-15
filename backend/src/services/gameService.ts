import { GameState, Player, GameAction, Card, CardType, Attack } from '../models/types';
import { createDeck } from '../models/cards';
import { v4 as uuidv4 } from 'uuid';

export class GameService {
  private games: Map<string, GameState> = new Map();

  createGame(player1Name: string, player2Name: string, player1Mythology: string, player2Mythology: string): GameState {
    const gameId = uuidv4();
    
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
    return gameState;
  }

  getGame(gameId: string): GameState | undefined {
    return this.games.get(gameId);
  }

  executeAction(gameId: string, action: GameAction): GameState | null {
    const game = this.games.get(gameId);
    if (!game) return null;

    const currentPlayer = game.players[game.currentPlayerIndex];
    const opponent = game.players[1 - game.currentPlayerIndex];

    switch (action.type) {
      case 'DRAW_CARD':
        if (game.phase === 'draw') {
          this.drawCards(currentPlayer, 1);
          game.phase = 'main';
        }
        break;

      case 'PLAY_CARD':
        if (game.phase === 'main' && action.cardId) {
          this.playCard(currentPlayer, action.cardId);
        }
        break;

      case 'ATTACK_NEXUS':
        // No attacks allowed on the first turn
        if (game.turnCount === 1) {
          console.log('Attack blocked: No attacks allowed on the first turn');
          break;
        }
        // Only one attack per turn allowed
        if (currentPlayer.hasAttackedThisTurn) {
          console.log('Attack blocked: Player has already attacked this turn');
          break;
        }
        if (currentPlayer.activeBeast && action.attackIndex !== undefined) {
          this.attackNexus(currentPlayer, opponent, action.attackIndex);
          currentPlayer.hasAttackedThisTurn = true;
          // Only change phase to 'end' if we're currently in 'attack' phase
          if (game.phase === 'attack') {
            game.phase = 'end';
          }
        }
        break;

      case 'ATTACK_BEAST':
        // No attacks allowed on the first turn
        if (game.turnCount === 1) {
          console.log('Attack blocked: No attacks allowed on the first turn');
          break;
        }
        // Only one attack per turn allowed
        if (currentPlayer.hasAttackedThisTurn) {
          console.log('Attack blocked: Player has already attacked this turn');
          break;
        }
        if (currentPlayer.activeBeast && opponent.activeBeast && action.attackIndex !== undefined) {
          this.attackBeast(currentPlayer, opponent, action.attackIndex);
          currentPlayer.hasAttackedThisTurn = true;
          // Only change phase to 'end' if we're currently in 'attack' phase
          if (game.phase === 'attack') {
            game.phase = 'end';
          }
        }
        break;

      case 'END_TURN':
        this.endTurn(game);
        break;

      case 'EQUIP_ARTIFACT':
        if (action.cardId && currentPlayer.activeBeast) {
          this.equipArtifact(currentPlayer, action.cardId);
        }
        break;

      case 'USE_ARTIFACT':
        if (action.cardId && action.targetType) {
          this.useArtifact(currentPlayer, opponent, action.cardId, action.targetType, action.targetId);
        }
        break;

      case 'USE_TECHNIQUE':
        console.log('USE_TECHNIQUE action received:', action);
        if (action.cardId && action.targetType) {
          const result = this.useTechnique(currentPlayer, opponent, action.cardId, action.targetType, action.targetId);
          console.log('useTechnique result:', result);
        } else {
          console.log('USE_TECHNIQUE action missing required fields:', { cardId: action.cardId, targetType: action.targetType });
        }
        break;
    }

    // Check win conditions
    this.checkWinConditions(game);
    
    this.games.set(gameId, game);
    return game;
  }

  private drawCards(player: Player, count: number): void {
    for (let i = 0; i < count && player.deck.length > 0; i++) {
      const card = player.deck.pop();
      if (card) {
        player.hand.push(card);
      }
    }
  }

  private playCard(player: Player, cardId: string): boolean {
    const cardIndex = player.hand.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return false;

    const card = player.hand[cardIndex];
    player.hand.splice(cardIndex, 1);

    switch (card.type) {
      case CardType.BEAST:
        if (!player.activeBeast) {
          player.activeBeast = { ...card };
        } else {
          // Replace current beast
          player.activeBeast = { ...card };
        }
        break;

      case CardType.TECHNIQUE:
        this.executeTechnique(player, card);
        break;

      case CardType.ARTIFACT:
        player.artifacts.push(card);
        break;
    }

    return true;
  }

  private executeTechnique(player: Player, card: Card): void {
    if (!card.techniqueEffect) return;

    try {
      const effect = JSON.parse(card.techniqueEffect);
      
      switch (effect.type) {
        case 'damage':
          // Technique damage logic would be implemented here
          break;
        case 'heal':
          player.nexusHp = Math.min(player.maxNexusHp, player.nexusHp + effect.amount);
          break;
        case 'draw':
          this.drawCards(player, effect.amount || 1);
          break;
      }
    } catch (error) {
      console.error('Error executing technique:', error);
    }
  }

  private equipArtifact(player: Player, artifactId: string): boolean {
    const artifactIndex = player.artifacts.findIndex(artifact => artifact.id === artifactId);
    if (artifactIndex === -1 || !player.activeBeast) return false;

    const artifact = player.artifacts[artifactIndex];
    
    try {
      const effect = JSON.parse(artifact.artifactEffect || '{}');
      
      switch (effect.type) {
        case 'hp_boost':
          if (player.activeBeast) {
            player.activeBeast.hp = (player.activeBeast.hp || 0) + effect.amount;
            player.activeBeast.maxHp = (player.activeBeast.maxHp || 0) + effect.amount;
          }
          break;
        case 'attack_boost':
          // Attack boost logic would be applied during combat
          break;
      }
    } catch (error) {
      console.error('Error equipping artifact:', error);
    }

    return true;
  }

  private attackNexus(attacker: Player, defender: Player, attackIndex: number): void {
    if (!attacker.activeBeast || !attacker.activeBeast.attacks || attackIndex < 0 || attackIndex >= attacker.activeBeast.attacks.length) return;

    const attack = attacker.activeBeast.attacks[attackIndex];
    if (attack) {
      defender.nexusHp = Math.max(0, defender.nexusHp - attack.damage);
      
      // Apply any special attack effects here
      // For example, healing attacks, status effects, etc.
      this.applyAttackEffects(attacker, defender, attack);
    }
  }

  private attackBeast(attacker: Player, defender: Player, attackIndex: number): void {
    if (!attacker.activeBeast || !defender.activeBeast || !attacker.activeBeast.attacks || attackIndex < 0 || attackIndex >= attacker.activeBeast.attacks.length) return;

    const attack = attacker.activeBeast.attacks[attackIndex];
    if (attack && defender.activeBeast) {
      defender.activeBeast.hp = Math.max(0, (defender.activeBeast.hp || 0) - attack.damage);
      
      // Apply any special attack effects
      this.applyAttackEffects(attacker, defender, attack);
      
      // Remove beast if HP reaches 0
      if (defender.activeBeast.hp <= 0) {
        defender.activeBeast = undefined;
      }
    }
  }

  private endTurn(game: GameState): void {
    // Reset attack flags for both players at the start of a new turn
    game.players[0].hasAttackedThisTurn = false;
    game.players[1].hasAttackedThisTurn = false;
    
    game.currentPlayerIndex = 1 - game.currentPlayerIndex;
    game.phase = 'draw';
    game.turnCount++;
  }

  private checkWinConditions(game: GameState): void {
    const [player1, player2] = game.players;

    // Check if either player's Nexus HP is 0
    if (player1.nexusHp <= 0) {
      game.winner = player2.id;
    } else if (player2.nexusHp <= 0) {
      game.winner = player1.id;
    }

    // Check if player has no beasts and can't play any
    for (let i = 0; i < 2; i++) {
      const player = game.players[i];
      const opponent = game.players[1 - i];
      
      if (!player.activeBeast) {
        const hasBeasts = player.hand.some(card => card.type === CardType.BEAST) || 
                         player.deck.some(card => card.type === CardType.BEAST);
        
        if (!hasBeasts) {
          game.winner = opponent.id;
        }
      }
    }
  }

  private applyAttackEffects(attacker: Player, defender: Player, attack: Attack): void {
    // Handle special attack effects based on attack properties
    // This can be extended to handle healing, status effects, etc.
    
    // Example: Life Drain attack (heals attacker)
    if (attack.name === 'Life Drain' && attacker.activeBeast) {
      const healAmount = 2; // Fixed heal amount for Life Drain
      attacker.activeBeast.hp = Math.min(
        attacker.activeBeast.maxHp || attacker.activeBeast.hp || 0,
        (attacker.activeBeast.hp || 0) + healAmount
      );
    }
    
    // Example: Regeneration attack (heals self or ally)
    if (attack.name === 'Regeneration' && attacker.activeBeast) {
      const healAmount = 3; // Fixed heal amount for Regeneration
      attacker.activeBeast.hp = Math.min(
        attacker.activeBeast.maxHp || attacker.activeBeast.hp || 0,
        (attacker.activeBeast.hp || 0) + healAmount
      );
    }
    
    // Add more special effects here as needed
  }

  private useArtifact(player: Player, opponent: Player, artifactId: string, targetType: string, targetId?: string): boolean {
    // Find the artifact in player's hand
    const artifactIndex = player.hand.findIndex(card => card.id === artifactId);
    if (artifactIndex === -1) return false;

    const artifact = player.hand[artifactIndex];
    if (artifact.type !== CardType.ARTIFACT) return false;

    try {
      const effect = JSON.parse(artifact.artifactEffect || '{}');
      
      // Determine the target based on targetType
      let target = null;
      switch (targetType) {
        case 'ally_beast':
          target = player.activeBeast;
          break;
        case 'enemy_beast':
          target = opponent.activeBeast;
          break;
        case 'ally_nexus':
          target = player;
          break;
        case 'enemy_nexus':
          target = opponent;
          break;
      }

      if (!target) return false;

      // Apply the artifact effect
      switch (effect.type) {
        case 'direct_damage':
          if (targetType === 'enemy_nexus' || targetType === 'ally_nexus') {
            const nexusTarget = target as Player;
            nexusTarget.nexusHp = Math.max(0, nexusTarget.nexusHp - effect.amount);
          } else if (targetType === 'enemy_beast' || targetType === 'ally_beast') {
            const beastTarget = target as Card;
            if (beastTarget.hp !== undefined) {
              beastTarget.hp = Math.max(0, beastTarget.hp - effect.amount);
              // Remove beast if HP reaches 0
              if (beastTarget.hp <= 0) {
                if (targetType === 'enemy_beast') {
                  opponent.activeBeast = undefined;
                } else {
                  player.activeBeast = undefined;
                }
              }
            }
          }
          break;

        case 'heal':
          if (targetType === 'enemy_nexus' || targetType === 'ally_nexus') {
            const nexusTarget = target as Player;
            nexusTarget.nexusHp = Math.min(nexusTarget.maxNexusHp, nexusTarget.nexusHp + effect.amount);
          } else if (targetType === 'enemy_beast' || targetType === 'ally_beast') {
            const beastTarget = target as Card;
            if (beastTarget.hp !== undefined && beastTarget.maxHp !== undefined) {
              beastTarget.hp = Math.min(beastTarget.maxHp, beastTarget.hp + effect.amount);
            }
          }
          break;

        case 'heal_nexus':
          if (targetType === 'ally_nexus') {
            player.nexusHp = Math.min(player.maxNexusHp, player.nexusHp + effect.amount);
          }
          break;

        case 'attack_boost':
          if (targetType === 'ally_beast' && player.activeBeast && player.activeBeast.attacks) {
            // Boost all attacks
            player.activeBeast.attacks.forEach(attack => {
              attack.damage += effect.amount;
            });
          }
          break;

        case 'damage_reduction':
          if (targetType === 'ally_beast' && player.activeBeast) {
            // Add damage reduction effect (this could be stored as a temporary effect)
            // For now, we'll increase HP to simulate damage reduction
            if (player.activeBeast.maxHp !== undefined) {
              player.activeBeast.maxHp += effect.amount;
              player.activeBeast.hp = (player.activeBeast.hp || 0) + effect.amount;
            }
          }
          break;

        case 'curse':
          if (targetType === 'enemy_beast' && opponent.activeBeast && opponent.activeBeast.attacks) {
            // Reduce attack damage
            opponent.activeBeast.attacks.forEach(attack => {
              attack.damage = Math.max(1, attack.damage - effect.amount);
            });
          }
          break;

        case 'dispel':
          if (targetType === 'enemy_beast' && opponent.activeBeast) {
            // Remove all positive effects (for now, just reset attacks to base values)
            // This is a simplified implementation
            console.log('Dispel effect applied to enemy beast');
          }
          break;
      }

      // Remove the artifact from hand after use
      player.hand.splice(artifactIndex, 1);
      return true;
    } catch (error) {
      console.error('Error using artifact:', error);
      return false;
    }
  }

  private useTechnique(player: Player, opponent: Player, techniqueId: string, targetType: string, targetId?: string): boolean {
    console.log('useTechnique called with:', { techniqueId, targetType, targetId });
    
    // Find the technique in player's hand
    const techniqueIndex = player.hand.findIndex(card => card.id === techniqueId);
    if (techniqueIndex === -1) {
      console.log('Technique not found in hand:', techniqueId);
      return false;
    }

    const technique = player.hand[techniqueIndex];
    console.log('Found technique:', technique);
    
    if (technique.type !== CardType.TECHNIQUE) {
      console.log('Card is not a technique:', technique.type);
      return false;
    }

    try {
      const effect = JSON.parse(technique.techniqueEffect || '{}');
      console.log('Parsed technique effect:', effect);
      
      // Determine the target based on targetType
      let target = null;
      switch (targetType) {
        case 'ally_beast':
          target = player.activeBeast;
          console.log('Target ally_beast:', target);
          break;
        case 'enemy_beast':
          target = opponent.activeBeast;
          console.log('Target enemy_beast:', target);
          break;
        case 'ally_nexus':
          target = player;
          console.log('Target ally_nexus, current HP:', player.nexusHp);
          break;
        case 'enemy_nexus':
          target = opponent;
          console.log('Target enemy_nexus, current HP:', opponent.nexusHp);
          break;
      }

      if (!target) {
        console.log('No valid target found for targetType:', targetType);
        return false;
      }

      console.log('About to apply effect:', effect.type, 'amount:', effect.amount);

      // Apply the technique effect - only damage or heal
      switch (effect.type) {
        case 'damage':
          if (targetType === 'enemy_nexus' || targetType === 'ally_nexus') {
            const nexusTarget = target as Player;
            const oldHp = nexusTarget.nexusHp;
            nexusTarget.nexusHp = Math.max(0, nexusTarget.nexusHp - effect.amount);
            console.log('Nexus damage applied:', oldHp, '=>', nexusTarget.nexusHp);
          } else if (targetType === 'enemy_beast' || targetType === 'ally_beast') {
            const beastTarget = target as Card;
            if (beastTarget.hp !== undefined) {
              const oldHp = beastTarget.hp;
              beastTarget.hp = Math.max(0, beastTarget.hp - effect.amount);
              console.log('Beast damage applied:', oldHp, '=>', beastTarget.hp);
              // Remove beast if HP reaches 0
              if (beastTarget.hp <= 0) {
                if (targetType === 'enemy_beast') {
                  opponent.activeBeast = undefined;
                  console.log('Enemy beast destroyed');
                } else {
                  player.activeBeast = undefined;
                  console.log('Ally beast destroyed');
                }
              }
            } else {
              console.log('Beast target has no HP property');
            }
          }
          break;

        case 'heal':
          if (targetType === 'ally_nexus' || targetType === 'enemy_nexus') {
            const nexusTarget = target as Player;
            const oldHp = nexusTarget.nexusHp;
            nexusTarget.nexusHp = Math.min(nexusTarget.maxNexusHp, nexusTarget.nexusHp + effect.amount);
            console.log('Nexus heal applied:', oldHp, '=>', nexusTarget.nexusHp);
          } else if (targetType === 'ally_beast' || targetType === 'enemy_beast') {
            const beastTarget = target as Card;
            if (beastTarget.hp !== undefined && beastTarget.maxHp !== undefined) {
              const oldHp = beastTarget.hp;
              beastTarget.hp = Math.min(beastTarget.maxHp, beastTarget.hp + effect.amount);
              console.log('Beast heal applied:', oldHp, '=>', beastTarget.hp);
            } else {
              console.log('Beast target missing HP or maxHp properties');
            }
          }
          break;
          
        default:
          console.log('Unknown technique effect type:', effect.type);
      }

      // Remove the technique from hand after use
      player.hand.splice(techniqueIndex, 1);
      console.log('Technique removed from hand, new hand size:', player.hand.length);
      return true;
    } catch (error) {
      console.error('Error using technique:', error);
      return false;
    }
  }
}

export const gameService = new GameService();
