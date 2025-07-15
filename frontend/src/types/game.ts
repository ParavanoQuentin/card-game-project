export enum Mythology {
  GREEK = 'greek',
  EGYPTIAN = 'egyptian',
  NORSE = 'norse',
  CHINESE = 'chinese'
}

export enum CardType {
  BEAST = 'beast',
  TECHNIQUE = 'technique',
  ARTIFACT = 'artifact'
}

export interface Attack {
  name: string;
  damage: number;
  description?: string;
}

export interface PassiveEffect {
  name: string;
  description: string;
  effect: string;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  mythology: Mythology;
  description: string;
  imageUrl?: string;
  
  // Beast specific
  hp?: number;
  maxHp?: number;
  attacks?: Attack[];
  passiveEffect?: PassiveEffect;
  
  // Technique specific
  techniqueEffect?: string;
  
  // Artifact specific
  artifactEffect?: string;
}

export interface Player {
  id: string;
  name: string;
  nexusHp: number;
  maxNexusHp: number;
  hand: Card[];
  deck: Card[];
  activeBeast?: Card;
  artifacts: Card[];
  hasAttackedThisTurn?: boolean;
}

export interface GameState {
  id: string;
  players: [Player, Player];
  currentPlayerIndex: number;
  phase: 'draw' | 'main' | 'attack' | 'end';
  winner?: string;
  turnCount: number;
}

export interface GameAction {
  type: 'DRAW_CARD' | 'PLAY_CARD' | 'ATTACK_NEXUS' | 'ATTACK_BEAST' | 'END_TURN' | 'EQUIP_ARTIFACT' | 'USE_ARTIFACT' | 'USE_TECHNIQUE';
  playerId: string;
  cardId?: string;
  targetId?: string;
  damage?: number;
  attackIndex?: number;
  targetType?: 'ally_beast' | 'enemy_beast' | 'ally_nexus' | 'enemy_nexus';
}
