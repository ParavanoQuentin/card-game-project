import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { socketService } from '../services/socketService';
import { Card, CardType, GameAction, Mythology } from '../types/game';
import CardImage from '../components/CardImage';
import './CombatPage.css';

const CombatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    currentGame,
    playerId,
    isConnected,
    isInMatchmaking,
    selectedMythology,
    setCurrentGame,
    setPlayerId,
    setConnected,
    setInMatchmaking,
    getCurrentPlayer,
    getOpponent,
    isMyTurn
  } = useGameStore();

  const [playerName, setPlayerName] = useState(isAuthenticated && user ? user.username : '');
  const [selectedMythologyForBattle, setSelectedMythologyForBattle] = useState<Mythology | null>(selectedMythology);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedAttack, setSelectedAttack] = useState<{cardId: string, attackIndex: number} | null>(null);
  const [selectedActiveCard, setSelectedActiveCard] = useState<string | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [selectedArtifact, setSelectedArtifact] = useState<Card | null>(null);
  const [showTargetSelection, setShowTargetSelection] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<Card | null>(null);
  const [showTechniqueTargetSelection, setShowTechniqueTargetSelection] = useState(false);
  const [gameResult, setGameResult] = useState<'victory' | 'defeat' | null>(null);
  const [showGameEndScreen, setShowGameEndScreen] = useState(false);

  const currentPlayer = getCurrentPlayer();
  const opponent = getOpponent();
  const myTurn = isMyTurn();
  const hasAttackedThisTurn = currentPlayer?.hasAttackedThisTurn || false;

  const initializeSocket = async () => {
    try {
      console.log('🔌 CombatPage: Starting socket initialization...');
      setConnectionStatus('connecting');
      
      await socketService.connect();
      
      console.log('✅ CombatPage: Socket connected successfully');
      setConnected(true);
      setConnectionStatus('connected');
      
      // Set up event listeners
      socketService.on('game_started', handleGameStarted);
      socketService.on('game_updated', handleGameUpdated);
      socketService.on('game_ended', handleGameEnded);
      socketService.on('waiting_for_opponent', handleWaitingForOpponent);
      socketService.on('opponent_disconnected', handleOpponentDisconnected);
      socketService.on('disconnected', handleDisconnected);
      
      console.log('🎧 CombatPage: All event listeners set up');
    } catch (error) {
      console.error('❌ CombatPage: Failed to connect to server:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setConnectionStatus('failed');
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const setupConnection = async () => {
      if (!mounted) return;
      
      await initializeSocket();
    };
    
    setupConnection();
    
    return () => {
      mounted = false;
      // Clean up event listeners but don't disconnect as it might be used by other components
      socketService.off('game_started', handleGameStarted);
      socketService.off('game_updated', handleGameUpdated);
      socketService.off('game_ended', handleGameEnded);
      socketService.off('waiting_for_opponent', handleWaitingForOpponent);
      socketService.off('opponent_disconnected', handleOpponentDisconnected);
      socketService.off('disconnected', handleDisconnected);
    };
  }, []);

  // Update player name when authentication state changes
  useEffect(() => {
    if (isAuthenticated && user && user.username) {
      setPlayerName(user.username);
    }
  }, [isAuthenticated, user]);

  // Check for game end conditions
  const checkForGameEnd = () => {
    if (!currentPlayer || !opponent) return;

    // Check if opponent's nexus is destroyed (victory)
    if (opponent.nexusHp <= 0) {
      setGameResult('victory');
      setShowGameEndScreen(true);
      addToGameLog('Victory! Enemy Nexus destroyed!');
      return;
    }

    // Check if player's nexus is destroyed (defeat)
    if (currentPlayer.nexusHp <= 0) {
      setGameResult('defeat');
      setShowGameEndScreen(true);
      addToGameLog('Defeat! Your Nexus has been destroyed!');
      return;
    }
  };

  // Check for game end conditions
  useEffect(() => {
    checkForGameEnd();
  }, [currentPlayer?.nexusHp, opponent?.nexusHp]);

  const handleGameStarted = (data: { gameState: any, yourPlayerId: string }) => {
    // Don't override test game states
    if (currentGame?.id === 'test-game') {
      console.log('🧪 Ignoring game started for test game');
      return;
    }
    setCurrentGame(data.gameState);
    setPlayerId(data.yourPlayerId);
    setInMatchmaking(false);
    addToGameLog('Game started! Draw your initial hand.');
  };

  const handleGameUpdated = (gameState: any) => {
    console.log('Frontend received game update:', gameState);
    
    // Don't override test game states for now, but log that we received an update
    if (currentGame?.id === 'test-game') {
      console.log('🧪 Received game update for test game (ignoring)');
      return;
    }
    
    // Reset attack state if turn count changed (new turn)
    // Note: hasAttackedThisTurn is now managed in the backend game state
    
    setCurrentGame(gameState);
    addToGameLog(`Game updated - Turn ${gameState.turnCount}, Phase: ${gameState.phase}`);
  };

  const handleGameEnded = (data: { winner: string, gameState: any }) => {
    // Don't override test game states
    if (currentGame?.id === 'test-game') {
      console.log('🧪 Ignoring game ended for test game');
      return;
    }
    setCurrentGame(data.gameState);
    const isWinner = data.winner === playerId;
    addToGameLog(isWinner ? '🎉 You won!' : '😞 You lost!');
  };

  const handleWaitingForOpponent = () => {
    addToGameLog('Waiting for opponent...');
  };

  const handleOpponentDisconnected = () => {
    addToGameLog('Opponent disconnected');
    setCurrentGame(null);
  };

  const handleDisconnected = () => {
    setConnected(false);
    setConnectionStatus('disconnected');
    addToGameLog('Disconnected from server');
  };

  const addToGameLog = (message: string) => {
    setGameLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Test function to create a demo game state for testing
  const createTestGameState = () => {
    const testMinotaure = {
      id: 'test-minotaure',
      name: 'Minotaure',
      type: CardType.BEAST,
      hp: 8,
      maxHp: 8,
      cost: 4,
      description: 'A mighty beast from Greek mythology',
      mythology: 'greek' as Mythology,
      attacks: [
        {
          name: 'Charge',
          damage: 4,
          description: 'A powerful frontal assault'
        },
        {
          name: 'Horn Strike',
          damage: 3,
          description: 'Strike with deadly horns'
        }
      ]
    };

    const player1 = {
      id: 'player1',
      name: 'Test Player',
      nexusHp: 20,
      maxNexusHp: 20,
      deck: [],
      hand: [
        {
          id: 'test-zeus-bolt',
          name: 'Éclair de Zeus',
          type: CardType.TECHNIQUE,
          mythology: 'greek' as Mythology,
          description: 'Lightning bolt from the king of gods - Strikes any target',
          techniqueEffect: '{"type": "damage", "amount": 5, "target": "any"}'
        },
        {
          id: 'test-ra-blessing',
          name: 'Bénédiction de Râ',
          type: CardType.TECHNIQUE,
          mythology: 'egyptian' as Mythology,
          description: 'Solar blessing that heals ally beast',
          techniqueEffect: '{"type": "heal", "amount": 4, "target": "ally_beast"}'
        },
        {
          id: 'test-dao-harmony',
          name: 'Harmonie du Dao',
          type: CardType.TECHNIQUE,
          mythology: 'chinese' as Mythology,
          description: 'Perfect balance - Heals ally nexus',
          techniqueEffect: '{"type": "heal", "amount": 5, "target": "ally_nexus"}'
        }
      ],
      activeBeast: testMinotaure,
      artifacts: [],
      hasAttackedThisTurn: false
    };

    const player2 = {
      id: 'player2',
      name: 'Test Opponent',
      nexusHp: 18,
      maxNexusHp: 20,
      deck: [],
      hand: [],
      activeBeast: {
        id: 'test-sphinx',
        name: 'Sphinx',
        type: CardType.BEAST,
        hp: 6,
        maxHp: 6,
        cost: 3,
        description: 'A mysterious guardian',
        mythology: 'egyptian' as Mythology,
        attacks: [
          {
            name: 'Riddle',
            damage: 2,
            description: 'Confuse the enemy'
          }
        ]
      },
      artifacts: [],
      hasAttackedThisTurn: false
    };

    const testGameState = {
      id: 'test-game',
      turnCount: 3,
      phase: 'attack' as const,
      currentPlayerIndex: 0,
      players: [player1, player2] as [typeof player1, typeof player2],
      winner: undefined
    };

    setCurrentGame(testGameState);
    setPlayerId('player1');
    addToGameLog('Test game state created - try using techniques from your hand!');
  };

  // Debug function to force attack phase
  const forceAttackPhase = () => {
    if (currentGame) {
      const updatedGame = {
        ...currentGame,
        phase: 'attack' as const
      };
      console.log('🔧 Forcing attack phase:', {
        oldPhase: currentGame.phase,
        newPhase: updatedGame.phase,
        gameId: currentGame.id
      });
      setCurrentGame(updatedGame);
      addToGameLog('🔧 Forced game phase to ATTACK');
      
      // Force a re-render by updating a dummy state
      setTimeout(() => {
        console.log('🔍 State after force:', {
          currentGamePhase: currentGame?.phase,
          updatedGamePhase: updatedGame.phase
        });
      }, 50);
    }
  };

  const joinMatchmaking = () => {
    if (!playerName.trim() || !selectedMythologyForBattle) {
      alert('Please enter your name and select a mythology');
      return;
    }
    
    setInMatchmaking(true);
    socketService.joinMatchmaking(playerName.trim(), selectedMythologyForBattle);
    addToGameLog(`Joining matchmaking as ${playerName} with ${selectedMythologyForBattle} mythology`);
  };

  const leaveMatchmaking = () => {
    setInMatchmaking(false);
    socketService.leaveMatchmaking();
    addToGameLog('Left matchmaking');
  };

  const sendGameAction = (action: Omit<GameAction, 'playerId'>) => {
    if (!currentGame || !playerId) return;
    
    const fullAction: GameAction = { ...action, playerId };
    socketService.sendGameAction(currentGame.id, fullAction);
  };

  const markPlayerAttacked = () => {
    if (currentGame?.id === 'test-game' && currentPlayer) {
      const updatedPlayers = currentGame.players.map(player => 
        player.id === currentPlayer.id 
          ? { ...player, hasAttackedThisTurn: true }
          : player
      );
      
      const updatedGame = {
        ...currentGame,
        players: updatedPlayers as [typeof updatedPlayers[0], typeof updatedPlayers[1]]
      };
      setCurrentGame(updatedGame);
    }
    // For multiplayer games, the backend handles this
  };

  const processLocalTechnique = (technique: Card, targetType: string): boolean => {
    if (currentGame?.id !== 'test-game') return false;

    try {
      const effect = JSON.parse(technique.techniqueEffect || '{}');
      
      // Find the target based on targetType
      let target = null;
      let targetLabel = '';
      
      switch (targetType) {
        case 'ally_beast':
          target = currentGame.players[0].activeBeast;
          targetLabel = 'your active beast';
          break;
        case 'enemy_beast':
          target = currentGame.players[1].activeBeast;
          targetLabel = 'enemy active beast';
          break;
        case 'ally_nexus':
          target = currentGame.players[0];
          targetLabel = 'your nexus';
          break;
        case 'enemy_nexus':
          target = currentGame.players[1];
          targetLabel = 'enemy nexus';
          break;
      }

      if (!target) {
        addToGameLog(`❌ No valid target for ${technique.name}`);
        return false;
      }

      // Apply the technique effect
      switch (effect.type) {
        case 'damage':
          if (targetType === 'ally_nexus' || targetType === 'enemy_nexus') {
            const nexusTarget = target as any;
            const oldHp = nexusTarget.nexusHp;
            nexusTarget.nexusHp = Math.max(0, nexusTarget.nexusHp - effect.amount);
            addToGameLog(`💥 ${technique.name} deals ${effect.amount} damage to ${targetLabel} (${oldHp} → ${nexusTarget.nexusHp})`);
            
            // Update game state and check for game end
            setCurrentGame({ ...currentGame });
            setTimeout(() => checkForGameEnd(), 100);
          } else if (targetType === 'ally_beast' || targetType === 'enemy_beast') {
            const beastTarget = target as Card;
            if (beastTarget.hp !== undefined) {
              const oldHp = beastTarget.hp;
              beastTarget.hp = Math.max(0, beastTarget.hp - effect.amount);
              addToGameLog(`💥 ${technique.name} deals ${effect.amount} damage to ${targetLabel} (${oldHp} → ${beastTarget.hp})`);
              
              // Remove beast if HP reaches 0
              if (beastTarget.hp <= 0) {
                if (targetType === 'enemy_beast') {
                  currentGame.players[1].activeBeast = undefined;
                } else {
                  currentGame.players[0].activeBeast = undefined;
                }
                addToGameLog(`${beastTarget.name} has been defeated!`);
              }
            }
          }
          break;

        case 'heal':
          if (targetType === 'ally_nexus' || targetType === 'enemy_nexus') {
            const nexusTarget = target as any;
            const oldHp = nexusTarget.nexusHp;
            nexusTarget.nexusHp = Math.min(nexusTarget.maxNexusHp, nexusTarget.nexusHp + effect.amount);
            addToGameLog(`💚 ${technique.name} heals ${effect.amount} HP to ${targetLabel} (${oldHp} → ${nexusTarget.nexusHp})`);
          } else if (targetType === 'ally_beast' || targetType === 'enemy_beast') {
            const beastTarget = target as Card;
            if (beastTarget.hp !== undefined && beastTarget.maxHp !== undefined) {
              const oldHp = beastTarget.hp;
              beastTarget.hp = Math.min(beastTarget.maxHp, beastTarget.hp + effect.amount);
              addToGameLog(`💚 ${technique.name} heals ${effect.amount} HP to ${targetLabel} (${oldHp} → ${beastTarget.hp})`);
            }
          }
          break;
      }

      // Remove the technique from hand
      const currentPlayer = currentGame.players[0];
      const techniqueIndex = currentPlayer.hand.findIndex(card => card.id === technique.id);
      if (techniqueIndex !== -1) {
        currentPlayer.hand.splice(techniqueIndex, 1);
      }

      // Force re-render
      setCurrentGame({ ...currentGame });
      return true;
    } catch (error) {
      console.error('Error processing local technique:', error);
      addToGameLog(`❌ Error using ${technique.name}: Invalid effect`);
      return false;
    }
  };

  const handleDrawCard = () => {
    if (currentGame?.phase === 'draw' && myTurn) {
      sendGameAction({ type: 'DRAW_CARD' });
    }
  };

  const handlePlayCard = (card: Card) => {
    if (currentGame?.phase === 'main' && myTurn) {
      sendGameAction({ type: 'PLAY_CARD', cardId: card.id });
      setSelectedCard(null);
    }
  };

  const handleAttackNexus = () => {
    if (currentGame?.phase === 'attack' && myTurn && currentPlayer?.activeBeast && selectedAttack) {
      const beast = currentPlayer.activeBeast;
      const attack = beast.attacks?.[selectedAttack.attackIndex];
      if (attack) {
        sendGameAction({ 
          type: 'ATTACK_NEXUS', 
          cardId: beast.id,
          damage: attack.damage,
          attackIndex: selectedAttack.attackIndex
        });
        addToGameLog(`${beast.name} uses ${attack.name} to attack enemy Nexus for ${attack.damage} damage!`);
        setSelectedAttack(null);
      }
    }
  };

  const handleAttackBeast = () => {
    if (currentGame?.phase === 'attack' && myTurn && currentPlayer?.activeBeast && opponent?.activeBeast && selectedAttack) {
      const beast = currentPlayer.activeBeast;
      const attack = beast.attacks?.[selectedAttack.attackIndex];
      if (attack) {
        sendGameAction({ 
          type: 'ATTACK_BEAST', 
          cardId: beast.id,
          targetId: opponent.activeBeast.id,
          damage: attack.damage,
          attackIndex: selectedAttack.attackIndex
        });
        addToGameLog(`${beast.name} uses ${attack.name} to attack ${opponent.activeBeast.name} for ${attack.damage} damage!`);
        setSelectedAttack(null);
      }
    }
  };

  const handleEndTurn = () => {
    if (myTurn) {
      // For test games, handle turn change locally
      if (currentGame?.id === 'test-game') {
        // Reset attack flags for both players when ending turn
        const updatedPlayers = currentGame.players.map(player => ({
          ...player,
          hasAttackedThisTurn: false
        }));
        
        const updatedGame = {
          ...currentGame,
          players: updatedPlayers as [typeof updatedPlayers[0], typeof updatedPlayers[1]],
          currentPlayerIndex: 1 - currentGame.currentPlayerIndex,
          phase: 'draw' as const,
          turnCount: currentGame.turnCount + 1
        };
        setCurrentGame(updatedGame);
        addToGameLog(`Turn ${updatedGame.turnCount} - Player ${updatedGame.currentPlayerIndex + 1}'s turn`);
      } else {
        // For multiplayer games, send to backend
        sendGameAction({ type: 'END_TURN' });
      }
    }
  };

  const executeAttackOnTarget = (target: 'nexus' | 'beast', attack: any, attackIndex: number) => {
    console.log('executeAttackOnTarget called:', { 
      target, 
      attack, 
      attackIndex, 
      currentGame: currentGame?.id, 
      myTurn, 
      activeBeast: currentPlayer?.activeBeast?.name, 
      hasAttackedThisTurn, 
      turnCount: currentGame?.turnCount,
      gamePhase: currentGame?.phase,
      opponent: opponent?.name,
      opponentNexusHp: opponent?.nexusHp
    });
    
    if (!currentGame || !currentPlayer?.activeBeast || !myTurn) {
      console.log('❌ Attack blocked:', { 
        hasGame: !!currentGame, 
        hasActiveBeast: !!currentPlayer?.activeBeast, 
        myTurn, 
        gamePhase: currentGame?.phase 
      });
      addToGameLog('❌ Cannot attack right now!');
      return;
    }

    // Check if it's the first turn (no attacks allowed)
    if (currentGame.turnCount === 1) {
      console.log('❌ Attack blocked: First turn, no attacks allowed');
      addToGameLog('❌ No attacks allowed on the first turn!');
      return;
    }

    // Check if already attacked this turn
    if (hasAttackedThisTurn) {
      console.log('❌ Attack blocked: Already attacked this turn');
      addToGameLog('❌ You can only use one attack per turn!');
      return;
    }

    const beast = currentPlayer.activeBeast;
    
    // Check if this is test mode or real multiplayer
    const isTestMode = currentGame.id === 'test-game';
    console.log('Attack mode:', { isTestMode, gameId: currentGame.id });
    
    if (target === 'nexus') {
      if (isTestMode && opponent) {
        console.log('🧪 Test mode nexus attack:', { opponentNexusHp: opponent.nexusHp, damage: attack.damage });
        // Test mode: Apply damage directly to opponent's nexus
        const updatedOpponent = {
          ...opponent,
          nexusHp: Math.max(0, opponent.nexusHp - attack.damage)
        };
        
        // Update the game state by finding and replacing the correct players (both opponent and current player)
        const updatedPlayers = currentGame.players.map(player => {
          if (player.id === opponent.id) {
            return updatedOpponent;
          } else if (player.id === currentPlayer?.id) {
            return { ...player, hasAttackedThisTurn: true };
          } else {
            return player;
          }
        });
        
        const updatedGameState = {
          ...currentGame,
          players: updatedPlayers as [typeof updatedPlayers[0], typeof updatedPlayers[1]]
        };
        
        setCurrentGame(updatedGameState);
        addToGameLog(`${beast.name} uses ${attack.name} to attack enemy Nexus for ${attack.damage} damage! (${opponent.nexusHp} → ${updatedOpponent.nexusHp})`);
        console.log('✅ Test nexus attack completed');
        
        // Check for game end after nexus attack
        setTimeout(() => checkForGameEnd(), 100);
      } else {
        console.log('🌐 Multiplayer nexus attack');
        // Multiplayer mode: Send action to backend
        const action = { 
          type: 'ATTACK_NEXUS' as const, 
          cardId: beast.id,
          damage: attack.damage,
          attackIndex: attackIndex
        };
        console.log('📤 Sending nexus attack action:', action);
        sendGameAction(action);
        addToGameLog(`${beast.name} uses ${attack.name} to attack enemy Nexus for ${attack.damage} damage!`);
        
        // For multiplayer games, the backend handles marking the attack
      }
    } else if (target === 'beast' && opponent?.activeBeast) {
      if (isTestMode && opponent.activeBeast && opponent.activeBeast.hp !== undefined) {
        // Test mode: Apply damage directly to opponent's active beast
        const currentBeastHp = opponent.activeBeast.hp;
        const updatedActiveBeast = {
          ...opponent.activeBeast,
          hp: Math.max(0, currentBeastHp - attack.damage)
        };
        
        const updatedOpponent = {
          ...opponent,
          activeBeast: updatedActiveBeast.hp > 0 ? updatedActiveBeast : undefined
        };
        
        // Update the game state by finding and replacing the correct players (both opponent and current player)
        const updatedPlayers = currentGame.players.map(player => {
          if (player.id === opponent.id) {
            return updatedOpponent;
          } else if (player.id === currentPlayer?.id) {
            return { ...player, hasAttackedThisTurn: true };
          } else {
            return player;
          }
        });
        
        const updatedGameState = {
          ...currentGame,
          players: updatedPlayers as [typeof updatedPlayers[0], typeof updatedPlayers[1]]
        };
        
        setCurrentGame(updatedGameState);
        addToGameLog(`${beast.name} uses ${attack.name} to attack ${opponent.activeBeast.name} for ${attack.damage} damage! (${currentBeastHp} → ${updatedActiveBeast.hp})`);
        
        if (updatedActiveBeast.hp <= 0) {
          addToGameLog(`${opponent.activeBeast.name} has been defeated!`);
        }
      } else {
        console.log('🌐 Multiplayer beast attack');
        // Multiplayer mode: Send action to backend
        const action = { 
          type: 'ATTACK_BEAST' as const, 
          cardId: beast.id,
          targetId: opponent.activeBeast.id,
          damage: attack.damage,
          attackIndex: attackIndex
        };
        console.log('📤 Sending beast attack action:', action);
        sendGameAction(action);
        addToGameLog(`${beast.name} uses ${attack.name} to attack ${opponent.activeBeast?.name} for ${attack.damage} damage!`);
        
        // For multiplayer games, the backend handles marking the attack
      }
    }
    
    // Clear any selected attack since we just executed one
    setSelectedAttack(null);
    setSelectedActiveCard(null); // Also hide the attack options
  };

  const handleArtifactClick = (artifact: Card) => {
    if (!myTurn || currentGame?.phase !== 'main') {
      addToGameLog('❌ You can only use artifacts during your main phase!');
      return;
    }

    if (artifact.type !== CardType.ARTIFACT) {
      addToGameLog('❌ This is not an artifact!');
      return;
    }

    setSelectedArtifact(artifact);
    setShowTargetSelection(true);
    addToGameLog(`Select a target for ${artifact.name}`);
  };

  const handleArtifactTarget = (targetType: 'ally_beast' | 'enemy_beast' | 'ally_nexus' | 'enemy_nexus') => {
    if (!selectedArtifact || !currentGame || !playerId) return;

    // Validate target exists
    let targetValid = false;
    switch (targetType) {
      case 'ally_beast':
        targetValid = !!currentPlayer?.activeBeast;
        break;
      case 'enemy_beast':
        targetValid = !!opponent?.activeBeast;
        break;
      case 'ally_nexus':
      case 'enemy_nexus':
        targetValid = true; // Nexus always exists
        break;
    }

    if (!targetValid) {
      addToGameLog('❌ Invalid target selected!');
      return;
    }

    // Send the artifact use action
    sendGameAction({
      type: 'USE_ARTIFACT',
      cardId: selectedArtifact.id,
      targetType: targetType
    });

    addToGameLog(`Used ${selectedArtifact.name} on target!`);
    
    // Clear selection
    setSelectedArtifact(null);
    setShowTargetSelection(false);
  };

  const cancelArtifactSelection = () => {
    setSelectedArtifact(null);
    setShowTargetSelection(false);
    addToGameLog('❌ Artifact selection cancelled');
  };

  const handleTechniqueClick = (technique: Card) => {
    if (!myTurn || currentGame?.phase !== 'main') {
      addToGameLog('❌ You can only use techniques during your main phase!');
      return;
    }

    if (technique.type !== CardType.TECHNIQUE) {
      addToGameLog('❌ This is not a technique!');
      return;
    }

    setSelectedTechnique(technique);
    setShowTechniqueTargetSelection(true);
    addToGameLog(`Select a target for ${technique.name}`);
  };

  const handleTechniqueTarget = (targetType: 'ally_beast' | 'enemy_beast' | 'ally_nexus' | 'enemy_nexus') => {
    if (!selectedTechnique || !currentGame || !playerId) return;

    // Validate target exists
    let targetValid = false;
    switch (targetType) {
      case 'ally_beast':
        targetValid = !!currentPlayer?.activeBeast;
        break;
      case 'enemy_beast':
        targetValid = !!opponent?.activeBeast;
        break;
      case 'ally_nexus':
      case 'enemy_nexus':
        targetValid = true; // Nexus always exists
        break;
    }

    if (!targetValid) {
      addToGameLog('❌ Invalid target selected!');
      return;
    }

    // Handle test game locally or send to backend
    const isTestGame = currentGame?.id === 'test-game';
    if (isTestGame) {
      // Process technique locally for test game
      const success = processLocalTechnique(selectedTechnique, targetType);
      if (success) {
        addToGameLog(`Used ${selectedTechnique.name} on ${targetType}!`);
      } else {
        addToGameLog(`❌ Failed to use ${selectedTechnique.name}!`);
      }
    } else {
      // Send the technique use action to backend for real games
      console.log('Frontend sending USE_TECHNIQUE action:', {
        type: 'USE_TECHNIQUE',
        cardId: selectedTechnique.id,
        targetType: targetType,
        techniqueEffect: selectedTechnique.techniqueEffect
      });
      
      sendGameAction({
        type: 'USE_TECHNIQUE',
        cardId: selectedTechnique.id,
        targetType: targetType
      });

      addToGameLog(`Used ${selectedTechnique.name} (${targetType}) - Effect should be applied!`);
    }
    
    // Clear selection
    setSelectedTechnique(null);
    setShowTechniqueTargetSelection(false);
  };

  const cancelTechniqueSelection = () => {
    setSelectedTechnique(null);
    setShowTechniqueTargetSelection(false);
    addToGameLog('❌ Technique selection cancelled');
  };

  const renderCard = (card: Card, isPlayable: boolean = false, isActiveBeast: boolean = false, isMyBeast: boolean = false) => {
    const isActiveCardSelected = isActiveBeast && selectedActiveCard === card.id;
    const canShowAttacks = isActiveBeast && isMyBeast && myTurn && !hasAttackedThisTurn; // Show attacks only for MY beast when it's my turn and haven't attacked yet
    
    const handleCardClick = () => {
      if (card.type === CardType.ARTIFACT && isPlayable) {
        // Handle artifact click
        handleArtifactClick(card);
      } else if (card.type === CardType.TECHNIQUE && isPlayable) {
        // Handle technique click
        handleTechniqueClick(card);
      } else if (isPlayable && card.type === CardType.BEAST) {
        setSelectedCard(card);
        addToGameLog(`✅ Selected ${card.name} to play`);
      } else if (isActiveBeast && myTurn && hasAttackedThisTurn) {
        addToGameLog(`⚠️ You can only use one attack per turn!`);
      } else if (isActiveBeast && isMyBeast && canShowAttacks) {
        // Toggle attack options for MY active beast only
        const newSelection = isActiveCardSelected ? null : card.id;
        setSelectedActiveCard(newSelection);
        addToGameLog(newSelection ? `Showing attacks for ${card.name}` : `Hiding attacks for ${card.name}`);
      } else if (isActiveBeast && isMyBeast) {
        addToGameLog(`⚠️ Cannot show attacks - it's not your turn`);
      } else if (isActiveBeast && !isMyBeast) {
        addToGameLog(`❌ You cannot control enemy beasts!`);
      }
    };

    return (
      <div 
        key={card.id} 
        className={`combat-card ${card.type} ${selectedCard?.id === card.id ? 'selected' : ''} ${isActiveCardSelected ? 'selected' : ''} ${isPlayable ? 'playable' : ''} ${isActiveBeast ? 'active-beast-card' : ''} ${isActiveBeast && isMyBeast && myTurn && currentGame?.phase === 'attack' ? 'attack-phase' : ''} ${canShowAttacks ? 'clickable' : ''}`}
        onClick={handleCardClick}
      >
        <CardImage card={card} className="combat-card-image" />
        
        <div className="card-header">
          <h4>{card.name}</h4>
          <span className="card-type">{card.type}</span>
        </div>
        
        {card.type === CardType.BEAST && (
          <div className="beast-info">
            <div className="hp">❤️ {card.hp}/{card.maxHp}</div>
            {card.attacks && card.attacks.length > 0 && (
              <div className="attacks-info">
                {/* Show "Already attacked" message when attacks are disabled for MY beast */}
                {isActiveBeast && isMyBeast && myTurn && hasAttackedThisTurn && (
                  <div className="attack-disabled-msg" style={{
                    color: '#ff6b6b',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    fontStyle: 'italic',
                    marginBottom: '0.5rem'
                  }}>
                    Already attacked this turn
                  </div>
                )}
                
                {/* Show attack options when active beast is clicked during player's turn */}
                {isActiveCardSelected && canShowAttacks && (
                  <div className="attack-options">
                    <div className="attack-help">Choose your attack:</div>
                    {card.attacks.map((attack, index) => (
                      <div key={index} className="attack-choice">
                        <div className="attack-info">
                          <div className="attack-name">📛 <strong>{attack.name}</strong> ({attack.damage} dmg)</div>
                          {attack.description && <div className="attack-desc">{attack.description}</div>}
                        </div>
                        <div className="attack-targets">
                          <button
                            className="attack-target-btn nexus"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Nexus attack clicked:', { attack, index, beast: currentPlayer?.activeBeast?.name });
                              addToGameLog(`Attempting to attack nexus with ${attack.name}`);
                              executeAttackOnTarget('nexus', attack, index);
                              setSelectedActiveCard(null); // Hide attacks after using one
                            }}
                            title={`Attack enemy nexus for ${attack.damage} damage`}
                          >
                            Nexus
                          </button>
                          {opponent?.activeBeast && (
                            <button
                              className="attack-target-btn beast"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Beast attack clicked:', { attack, index, targetBeast: opponent.activeBeast?.name });
                                addToGameLog(`Attempting to attack ${opponent.activeBeast?.name} with ${attack.name}`);
                                executeAttackOnTarget('beast', attack, index);
                                setSelectedActiveCard(null); // Hide attacks after using one
                              }}
                              title={`Attack ${opponent.activeBeast?.name} for ${attack.damage} damage`}
                            >
                              🐉 Beast
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Show click hint when MY active beast can be clicked but attacks aren't shown */}
                {isActiveBeast && isMyBeast && canShowAttacks && !isActiveCardSelected && (
                  <div className="click-hint">
                    👆 Click to show attacks
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {card.type === CardType.ARTIFACT && (
          <div className="artifact-info">
            <div className="artifact-indicator">Artifact</div>
            {isPlayable && (
              <div className="artifact-usage-hint">
                👆 Click to use with targeting
              </div>
            )}
          </div>
        )}

        {card.type === CardType.TECHNIQUE && (
          <div className="technique-info">
            <div className="technique-indicator">Technique</div>
            {isPlayable && (
              <div className="technique-usage-hint">
                👆 Click to use with targeting
              </div>
            )}
          </div>
        )}
        
        <div className="card-description">{card.description}</div>
      </div>
    );
  };

  if (connectionStatus === 'connecting') {
    return (
      <div className="combat-page loading-state">
        <div className="loading-content">
          <h2>Connecting to server...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'failed') {
    return (
      <div className="combat-page error-state">
        <div className="error-content">
          <h2>Connection Failed</h2>
          <p>Unable to connect to the game server. Please try again.</p>
          <div className="error-details">
            <p><strong>Backend Server:</strong> http://localhost:3001</p>
            <p><strong>Status:</strong> Connection timeout or refused</p>
            <p><strong>Suggestion:</strong> Make sure the backend server is running</p>
          </div>
          <div className="error-actions">
            <button onClick={() => {
              setConnectionStatus('disconnected');
              initializeSocket();
            }}>
              Try Again
            </button>
            <button onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentGame) {
    return (
      <div className="combat-page matchmaking-state">
        <div className="matchmaking-content">
          <h1>Aether Beasts Combat</h1>
          
          {!isInMatchmaking ? (
            <div className="join-matchmaking">
              <div className="input-group">
                <label>{isAuthenticated ? 'Playing as:' : 'Player Name:'}</label>
                {isAuthenticated ? (
                  <div className="authenticated-username">
                    {user?.username}
                    <span className="authenticated-badge">✓ Authenticated</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={20}
                  />
                )}
              </div>
              
              <div className="mythology-selection">
                <label>Choose Your Mythology:</label>
                <div className="mythology-buttons">
                  {Object.values(Mythology).map(mythology => (
                    <button
                      key={mythology}
                      className={`mythology-btn ${mythology} ${selectedMythologyForBattle === mythology ? 'selected' : ''}`}
                      onClick={() => setSelectedMythologyForBattle(mythology)}
                    >
                      {mythology.charAt(0).toUpperCase() + mythology.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
                <button
                className="join-button"
                onClick={joinMatchmaking}
                disabled={!playerName.trim() || !selectedMythologyForBattle}
              >
                Find Opponent
              </button>
            </div>
          ) : (
            <div className="waiting-state">
              <h2>🔍 Finding Opponent...</h2>
              <p>Searching for a worthy challenger...</p>
              <div className="loading-spinner"></div>
              <button className="cancel-button" onClick={leaveMatchmaking}>
                Cancel
              </button>
            </div>
          )}
          
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Check for game end whenever game state changes
  return (
    <div className="combat-page game-state">
      {/* Victory/Defeat Screen */}
      {showGameEndScreen && (
        <div className="game-end-overlay">
          <div className="game-end-modal">
            <div className={`game-end-content ${gameResult}`}>
              {gameResult === 'victory' ? (
                <>
                  <div className="victory-icon">🏆</div>
                  <h1 className="game-end-title">VICTORY!</h1>
                  <p className="game-end-message">
                    You have triumphed! The enemy Nexus has been destroyed!
                  </p>
                  <div className="victory-details">
                    <p>Your mythological beasts have proven their superiority!</p>
                    <p>The enemy Nexus crumbles before your power!</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="defeat-icon">💀</div>
                  <h1 className="game-end-title">DEFEAT</h1>
                  <p className="game-end-message">
                    Your Nexus has been destroyed...
                  </p>
                  <div className="defeat-details">
                    <p>The enemy forces have overwhelmed your defenses.</p>
                    <p>Your Nexus lies in ruins, but this is not the end!</p>
                  </div>
                </>
              )}
              <div className="game-end-actions">
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/')}
                >
                  Return Home
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => navigate('/deck-creator')}
                >
                  Build New Deck
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setShowGameEndScreen(false);
                    setGameResult(null);
                  }}
                >
                  View Battle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="game-header">
        <div className="player-info opponent-info">
          <h3>{opponent?.name || 'Opponent'}</h3>
          <div className="nexus-hp">🏛️ {opponent?.nexusHp || 0}/20</div>
          <div className="deck-count">📚 {opponent?.deck.length || 0} cards</div>
        </div>
        
        <div className="game-status">
          <div className="turn-info">
            Turn {currentGame.turnCount} - {currentGame.phase.toUpperCase()}
            {myTurn ? ' (Your Turn)' : ' (Opponent\'s Turn)'}
          </div>
          {currentGame.turnCount === 1 && (
            <div className="first-turn-notice">
              No attacks allowed on the first turn
            </div>
          )}
          {currentGame.winner && (
            <div className="game-result">
              {currentGame.winner === playerId ? '🎉 Victory!' : '😞 Defeat!'}
            </div>
          )}
          
          {/* Debug controls for testing */}
          {currentGame?.id === 'test-game' && (
            <div className="debug-controls" style={{
              marginTop: '10px', 
              padding: '10px', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '5px',
              fontSize: '12px'
            }}>
              <div style={{marginBottom: '5px', color: '#ffd700'}}>Debug Controls:</div>
              <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                <button 
                  onClick={() => {
                    if (opponent && currentGame) {
                      const updatedOpponent = { ...opponent, nexusHp: 1 };
                      const updatedPlayers = [...currentGame.players];
                      updatedPlayers[1] = updatedOpponent;
                      setCurrentGame({ ...currentGame, players: updatedPlayers as [typeof updatedPlayers[0], typeof updatedPlayers[1]] });
                    }
                  }}
                  style={{background: 'rgba(255,0,0,0.6)', color: 'white', border: 'none', padding: '3px 6px', borderRadius: '3px', fontSize: '10px'}}
                >
                  Enemy 1 HP
                </button>
                <button 
                  onClick={() => {
                    if (currentPlayer && currentGame) {
                      const updatedPlayer = { ...currentPlayer, nexusHp: 1 };
                      const updatedPlayers = [...currentGame.players];
                      updatedPlayers[0] = updatedPlayer;
                      setCurrentGame({ ...currentGame, players: updatedPlayers as [typeof updatedPlayers[0], typeof updatedPlayers[1]] });
                    }
                  }}
                  style={{background: 'rgba(255,0,0,0.6)', color: 'white', border: 'none', padding: '3px 6px', borderRadius: '3px', fontSize: '10px'}}
                >
                  Player 1 HP
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="player-info my-info">
          <h3>{currentPlayer?.name || 'You'}</h3>
          <div className="nexus-hp">🏛️ {currentPlayer?.nexusHp || 0}/20</div>
          <div className="deck-count">📚 {currentPlayer?.deck.length || 0} cards</div>
        </div>
      </div>

      <div className="battlefield">
        <div className="opponent-field">
          {opponent?.activeBeast ? (
            <div className="active-beast opponent-beast">
              {renderCard(opponent.activeBeast, false, true, false)}
            </div>
          ) : (
            <div className="empty-field">No Beast on Field</div>
          )}
        </div>
        
        <div className="my-field">
          {currentPlayer?.activeBeast ? (
            <div className="active-beast my-beast">
              {renderCard(currentPlayer.activeBeast, false, true, true)}
            </div>
          ) : (
            <div className="empty-field">No Beast on Field</div>
          )}
        </div>
      </div>

      <div className="action-area">
        <div className="turn-actions">
          {myTurn && currentGame.phase === 'draw' && (
            <button className="action-button draw" onClick={handleDrawCard}>
              Draw Card
            </button>
          )}
          
          {myTurn && currentPlayer?.activeBeast && (
            <div className="attack-instruction-simple">
              <p>Click on your active beast to see attack options</p>
            </div>
          )}
          
          {myTurn && (
            <button className="action-button end-turn" onClick={handleEndTurn}>
              End Turn
            </button>
          )}
        </div>

        {selectedCard && myTurn && currentGame.phase === 'main' && (
          <div className="selected-card-actions">
            <button 
              className="play-card-button"
              onClick={() => handlePlayCard(selectedCard)}
            >
              Play {selectedCard.name}
            </button>
            <button 
              className="cancel-button"
              onClick={() => setSelectedCard(null)}
            >
              Cancel
            </button>
          </div>
        )}

        {showTargetSelection && selectedArtifact && (
          <div className="artifact-target-selection">
            <h4>Select target for {selectedArtifact.name}</h4>
            <div className="target-buttons">
              {currentPlayer?.activeBeast && (
                <button 
                  className="target-button ally-beast"
                  onClick={() => handleArtifactTarget('ally_beast')}
                >
                  🐉 Your Beast
                </button>
              )}
              {opponent?.activeBeast && (
                <button 
                  className="target-button enemy-beast"
                  onClick={() => handleArtifactTarget('enemy_beast')}
                >
                  🐲 Enemy Beast
                </button>
              )}
              <button 
                className="target-button ally-nexus"
                onClick={() => handleArtifactTarget('ally_nexus')}
              >
                🏛️ Your Nexus
              </button>
              <button 
                className="target-button enemy-nexus"
                onClick={() => handleArtifactTarget('enemy_nexus')}
              >
                🏛️ Enemy Nexus
              </button>
            </div>
            <button 
              className="cancel-button"
              onClick={cancelArtifactSelection}
            >
              Cancel
            </button>
          </div>
        )}

        {showTechniqueTargetSelection && selectedTechnique && (
          <div className="technique-target-selection">
            <h4>Select target for {selectedTechnique.name}</h4>
            <div className="target-buttons">
              {currentPlayer?.activeBeast && (
                <button 
                  className="target-button ally-beast"
                  onClick={() => handleTechniqueTarget('ally_beast')}
                >
                  🐉 Your Beast
                </button>
              )}
              {opponent?.activeBeast && (
                <button 
                  className="target-button enemy-beast"
                  onClick={() => handleTechniqueTarget('enemy_beast')}
                >
                  🐲 Enemy Beast
                </button>
              )}
              <button 
                className="target-button ally-nexus"
                onClick={() => handleTechniqueTarget('ally_nexus')}
              >
                🏛️ Your Nexus
              </button>
              <button 
                className="target-button enemy-nexus"
                onClick={() => handleTechniqueTarget('enemy_nexus')}
              >
                🏛️ Enemy Nexus
              </button>
            </div>
            <button 
              className="cancel-button"
              onClick={cancelTechniqueSelection}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="hand-area">
        <h3>Your Hand ({currentPlayer?.hand.length || 0} cards)</h3>
        <div className="hand-cards">
          {currentPlayer?.hand.map(card => 
            renderCard(card, myTurn && currentGame.phase === 'main')
          )}
        </div>
      </div>

      <div className="game-log">
        <h4>Game Log</h4>
        <div className="log-messages">
          {gameLog.map((message, index) => (
            <div key={index} className="log-message">{message}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CombatPage;
