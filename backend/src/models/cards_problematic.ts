import { Card, CardType, Mythology } from './types';
import { getCardImagePath } from './imageUtils';

export const CARD_DATABASE: Card[] = [
  // Greek Mythology - Beasts
  {
    id: 'greek_minotaur',
    name: 'Minotaure',
    type: CardType.BEAST,
    mythology: Mythology.GREEK,
    description: 'Powerful bull-headed warrior with devastating charge attacks',
    imageUrl: getCardImagePath('greek_minotaur', Mythology.GREEK, CardType.BEAST),
    hp: 5,
    maxHp: 5,
    attacks: [
      { name: 'Charge', damage: 4, description: 'Powerful charge attack dealing 4 damage' },
      { name: 'Horn Strike', damage: 3, description: 'Quick horn attack for 3 damage' }
    ]
  },
  {
    id: 'greek_medusa',
    name: 'Méduse',
    type: CardType.BEAST,
    mythology: Mythology.GREEK,
    description: 'Gorgon with petrifying gaze and life-draining abilities',
    imageUrl: getCardImagePath('greek_medusa', Mythology.GREEK, CardType.BEAST),
    hp: 4,
    maxHp: 4,
    attacks: [
      { name: 'Life Drain', damage: 3, description: 'Drains 3 HP and heals self for 2' },
      { name: 'Stone Gaze', damage: 2, description: 'Petrifying gaze that prevents enemy from attacking next turn' }
    ],
    passiveEffect: {
      name: 'Stone Skin',
      description: 'Reduces incoming damage by 1',
      effect: '{"type": "damage_reduction", "amount": 1}'
    }
  },
  {
    id: 'greek_cerberus',
    name: 'Cerbère',
    type: CardType.BEAST,
    mythology: Mythology.GREEK,
    description: 'Three-headed guardian of the underworld',
    imageUrl: getCardImagePath('greek_cerberus', Mythology.GREEK, CardType.BEAST),
    hp: 10,
    maxHp: 10,
    attacks: [
      { name: 'Triple Bite', damage: 4, description: 'Three-headed attack dealing 4 damage' },
      { name: 'Hellfire Breath', damage: 5, description: 'Devastating fire breath for 5 damage' },
      { name: 'Guardian Howl', damage: 0, description: 'Intimidating howl that reduces enemy attack by 1 for 2 turns' }
    ],
    passiveEffect: {
      name: 'Bloodlust',
      description: 'Gains +1 attack when enemy Nexus < 10 HP',
      effect: '{"type": "conditional_attack_boost", "condition": "enemy_nexus_low", "amount": 1}'
    }
  },
  {
    id: 'greek_hydra',
    name: 'Hydre',
    type: CardType.BEAST,
    mythology: Mythology.GREEK,
    description: 'Multi-headed serpent with regenerative powers',
    imageUrl: getCardImagePath('greek_hydra', Mythology.GREEK, CardType.BEAST),
    hp: 6,
    maxHp: 6,
    attacks: [
      { name: 'Regeneration', damage: 0, description: 'Heals 3 HP to self or ally' },
      { name: 'Multi-Head Strike', damage: 3, description: 'Multiple heads attack for 3 damage' },
      { name: 'Venomous Bite', damage: 2, description: 'Poisonous attack that deals 2 damage plus poison effect' }
    ],
    passiveEffect: {
      name: 'Regeneration',
      description: 'Heals 1 HP per turn',
      effect: '{"type": "heal_per_turn", "amount": 1}'
    }
  },

  // Greek Techniques
  {
    id: 'greek_zeus_bolt',
    name: 'Éclair de Zeus',
    type: CardType.TECHNIQUE,
    mythology: Mythology.GREEK,
    description: 'Lightning bolt from the king of gods',
    imageUrl: getCardImagePath('greek_zeus_bolt', Mythology.GREEK, CardType.TECHNIQUE),
    techniqueEffect: '{"type": "direct_damage", "damage": 5, "target": "enemy"}'
  },

  // Greek Artifacts
  {
    id: 'greek_aegis',
    name: 'Égide',
    type: CardType.ARTIFACT,
    mythology: Mythology.GREEK,
    description: "Zeus's protective shield",
    imageUrl: getCardImagePath('greek_aegis', Mythology.GREEK, CardType.ARTIFACT),
    artifactEffect: '{"type": "damage_reduction", "amount": 2, "duration": "permanent"}'
  },

  // Egyptian Mythology - Beasts
  {
    id: 'egyptian_anubis',
    name: 'Anubis',
    type: CardType.BEAST,
    mythology: Mythology.EGYPTIAN,
    description: 'God of the dead with divine judgment powers',
    imageUrl: getCardImagePath('egyptian_anubis', Mythology.EGYPTIAN, CardType.BEAST),
    hp: 6,
    maxHp: 6,
    attacks: [
      { name: 'Death Strike', damage: 3, description: 'Divine judgment dealing 3 damage' },
      { name: 'Soul Harvest', damage: 2, description: 'Harvests soul energy, deals 2 damage and draws a card' }
    ],
    passiveEffect: {
      name: 'Death Knowledge',
      description: 'Draw a card when entering play',
      effect: '{"type": "draw_on_play"}'
    }
  },
  {
    id: 'egyptian_bastet',
    name: 'Bastet',
    type: CardType.BEAST,
    mythology: Mythology.EGYPTIAN,
    description: 'Cat goddess with protective and healing powers',
    imageUrl: getCardImagePath('egyptian_bastet', Mythology.EGYPTIAN, CardType.BEAST),
    hp: 4,
    maxHp: 4,
    attacks: [
      { name: 'Healing Touch', damage: 0, description: 'Heals 3 HP to target' },
      { name: 'Cat Claw', damage: 2, description: 'Swift claw attack for 2 damage' }
    ],
    passiveEffect: {
      name: 'Divine Protection',
      description: 'Reduces incoming damage by 1',
      effect: '{"type": "damage_reduction", "amount": 1}'
    }
  },
  {
    id: 'egyptian_sphinx',
    name: 'Sphinx',
    type: CardType.BEAST,
    mythology: Mythology.EGYPTIAN,
    description: 'Riddle master with ancient wisdom',
    imageUrl: getCardImagePath('egyptian_sphinx', Mythology.EGYPTIAN, CardType.BEAST),
    hp: 7,
    maxHp: 7,
    attacks: [
      { name: 'Riddle Strike', damage: 4, description: 'Confusing attack dealing 4 damage' },
      { name: 'Wisdom Blast', damage: 3, description: 'Ancient knowledge attack for 3 damage' }
    ]
  },
  {
    id: 'egyptian_scarab',
    name: 'Scarabée Sacré',
    type: CardType.BEAST,
    mythology: Mythology.EGYPTIAN,
    description: 'Sacred beetle with divine fury',
    imageUrl: getCardImagePath('egyptian_scarab', Mythology.EGYPTIAN, CardType.BEAST),
    hp: 5,
    maxHp: 5,
    attacks: [
      { name: 'Sacred Strike', damage: 3, description: 'Holy attack dealing 3 damage' },
      { name: 'Swarm Call', damage: 2, description: 'Summons beetle swarm for 2 damage to all enemies' }
    ],
    passiveEffect: {
      name: 'Divine Fury',
      description: 'Gains +1 attack when enemy Nexus < 10 HP',
      effect: '{"type": "conditional_attack_boost", "condition": "enemy_nexus_low", "amount": 1}'
    }
  },

  // Egyptian Techniques
  {
    id: 'egyptian_ra_blessing',
    name: 'Bénédiction de Râ',
    type: CardType.TECHNIQUE,
    mythology: Mythology.EGYPTIAN,
    description: 'Solar blessing that heals and empowers',
    imageUrl: getCardImagePath('egyptian_ra_blessing', Mythology.EGYPTIAN, CardType.TECHNIQUE),
    techniqueEffect: '{"type": "heal_and_buff", "heal": 4, "buff": "+2 attack for 2 turns"}'
  },

  // Egyptian Artifacts
  {
    id: 'egyptian_ankh',
    name: 'Ankh',
    type: CardType.ARTIFACT,
    mythology: Mythology.EGYPTIAN,
    description: 'Symbol of eternal life',
    imageUrl: getCardImagePath('egyptian_ankh', Mythology.EGYPTIAN, CardType.ARTIFACT),
    artifactEffect: '{"type": "heal_per_turn", "amount": 1, "duration": "permanent"}'
  },

  // Norse Mythology - Beasts
  {
    id: 'norse_fenrir',
    name: 'Fenrir',
    type: CardType.BEAST,
    mythology: Mythology.NORSE,
    description: 'Giant wolf destined to devour Odin',
    imageUrl: getCardImagePath('norse_fenrir', Mythology.NORSE, CardType.BEAST),
    hp: 8,
    maxHp: 8,
    attacks: [
      { name: 'Devour', damage: 5, description: 'Devastating bite dealing 5 damage' },
      { name: 'Howl of Ragnarök', damage: 3, description: 'Apocalyptic howl for 3 damage and fear effect' },
      { name: 'Wolf Pack', damage: 2, description: 'Calls wolf pack, 2 damage to all enemies' }
    ],
    passiveEffect: {
      name: 'Growing Rage',
      description: 'Gains +1 attack each turn',
      effect: '{"type": "attack_boost_per_turn", "amount": 1}'
    }
  },
  {
    id: 'norse_jormungandr',
    name: 'Jörmungandr',
    type: CardType.BEAST,
    mythology: Mythology.NORSE,
    description: 'World serpent that encircles Midgard',
    imageUrl: getCardImagePath('norse_jormungandr', Mythology.NORSE, CardType.BEAST),
    hp: 12,
    maxHp: 12,
    attacks: [
      { name: 'Poison Breath', damage: 4, description: 'Toxic breath dealing 4 damage plus poison' },
      { name: 'Tail Whip', damage: 3, description: 'Massive tail attack for 3 damage' },
      { name: 'World Shake', damage: 2, description: 'Shakes the world, 2 damage to all enemies' }
    ]
  },
  {
    id: 'norse_valkyrie',
    name: 'Valkyrie',
    type: CardType.BEAST,
    mythology: Mythology.NORSE,
    description: 'Warrior maiden who chooses the slain',
    imageUrl: getCardImagePath('norse_valkyrie', Mythology.NORSE, CardType.BEAST),
    hp: 5,
    maxHp: 5,
    attacks: [
      { name: 'Divine Strike', damage: 4, description: 'Holy warrior attack for 4 damage' },
      { name: 'Valhalla Call', damage: 0, description: 'Resurrects fallen ally with 2 HP' },
      { name: 'Wings of War', damage: 3, description: 'Aerial attack for 3 damage' }
    ]
  },
  {
    id: 'norse_thor',
    name: 'Thor',
    type: CardType.BEAST,
    mythology: Mythology.NORSE,
    description: 'God of thunder wielding Mjölnir',
    imageUrl: getCardImagePath('norse_thor', Mythology.NORSE, CardType.BEAST),
    hp: 9,
    maxHp: 9,
    attacks: [
      { name: 'Mjölnir Strike', damage: 6, description: 'Hammer blow dealing 6 damage' },
      { name: 'Lightning Bolt', damage: 4, description: 'Thunder attack for 4 damage' },
      { name: 'Thunder Clap', damage: 2, description: 'Area thunder dealing 2 damage to all enemies' }
    ]
  },

  // Norse Techniques
  {
    id: 'norse_ragnarok',
    name: 'Ragnarök',
    type: CardType.TECHNIQUE,
    mythology: Mythology.NORSE,
    description: 'The end of worlds, devastating all',
    imageUrl: getCardImagePath('norse_ragnarok', Mythology.NORSE, CardType.TECHNIQUE),
    techniqueEffect: '{"type": "area_damage", "damage": 3, "target": "all_enemies"}'
  },

  // Norse Artifacts
  {
    id: 'norse_mjolnir',
    name: 'Mjöllnir',
    type: CardType.ARTIFACT,
    mythology: Mythology.NORSE,
    description: "Thor's mighty hammer",
    imageUrl: getCardImagePath('norse_mjolnir', Mythology.NORSE, CardType.ARTIFACT),
    artifactEffect: '{"type": "attack_boost", "amount": 3, "duration": "permanent"}'
  },

  // Chinese Mythology - Beasts
  {
    id: 'chinese_dragon',
    name: 'Long',
    type: CardType.BEAST,
    mythology: Mythology.CHINESE,
    description: 'Celestial dragon of infinite wisdom',
    imageUrl: getCardImagePath('chinese_dragon', Mythology.CHINESE, CardType.BEAST),
    hp: 10,
    maxHp: 10,
    attacks: [
      { name: 'Dragon Fire', damage: 5, description: 'Celestial fire dealing 5 damage' },
      { name: 'Wisdom Beam', damage: 3, description: 'Ancient wisdom attack for 3 damage and card draw' },
      { name: 'Wind Dance', damage: 2, description: 'Graceful attack for 2 damage, heals self 2 HP' }
    ]
  },
  {
    id: 'chinese_phoenix',
    name: 'Fenghuang',
    type: CardType.BEAST,
    mythology: Mythology.CHINESE,
    description: 'Immortal bird of rebirth and renewal',
    imageUrl: getCardImagePath('chinese_phoenix', Mythology.CHINESE, CardType.BEAST),
    hp: 6,
    maxHp: 6,
    attacks: [
      { name: 'Phoenix Fire', damage: 4, description: 'Rebirth flames dealing 4 damage' },
      { name: 'Healing Song', damage: 0, description: 'Mystical song healing 4 HP to target' },
      { name: 'Rebirth', damage: 0, description: 'Returns to hand and heals all allies 2 HP' }
    ],
    passiveEffect: {
      name: 'Immortal Spirit',
      description: 'When destroyed, returns to hand instead',
      effect: '{"type": "return_to_hand_on_death"}'
    }
  },
  {
    id: 'chinese_qilin',
    name: 'Qilin',
    type: CardType.BEAST,
    mythology: Mythology.CHINESE,
    description: 'Benevolent chimera bringing good fortune',
    imageUrl: getCardImagePath('chinese_qilin', Mythology.CHINESE, CardType.BEAST),
    hp: 7,
    maxHp: 7,
    attacks: [
      { name: 'Fortune Strike', damage: 3, description: 'Lucky attack dealing 3 damage and draws card' },
      { name: 'Blessing', damage: 0, description: 'Blesses ally, +2 attack for 3 turns' },
      { name: 'Justice Beam', damage: 4, description: 'Righteous beam dealing 4 damage' }
    ]
  },
  {
    id: 'chinese_baihu',
    name: 'Baihu',
    type: CardType.BEAST,
    mythology: Mythology.CHINESE,
    description: 'White tiger guardian of the west',
    imageUrl: getCardImagePath('chinese_baihu', Mythology.CHINESE, CardType.BEAST),
    hp: 8,
    maxHp: 8,
    attacks: [
      { name: 'Tiger Claw', damage: 4, description: 'Fierce claw attack dealing 4 damage' },
      { name: 'Roar of Power', damage: 2, description: 'Intimidating roar, 2 damage and reduces enemy attack' },
      { name: 'Pounce', damage: 5, description: 'Surprise pounce dealing 5 damage' }
    ]
  },

  // Chinese Techniques
  {
    id: 'chinese_dao_harmony',
    name: 'Harmonie du Dao',
    type: CardType.TECHNIQUE,
    mythology: Mythology.CHINESE,
    description: 'Perfect balance restoring peace',
    imageUrl: getCardImagePath('chinese_dao_harmony', Mythology.CHINESE, CardType.TECHNIQUE),
    techniqueEffect: '{"type": "heal_all", "heal": 3, "target": "all_allies"}'
  },

  // Chinese Artifacts
  {
    id: 'chinese_jade_amulet',
    name: 'Amulette de Jade',
    type: CardType.ARTIFACT,
    mythology: Mythology.CHINESE,
    description: 'Precious jade bringing fortune',
    imageUrl: getCardImagePath('chinese_jade_amulet', Mythology.CHINESE, CardType.ARTIFACT),
    artifactEffect: '{"type": "card_draw", "amount": 1, "trigger": "turn_start"}'
  }
];

export function getCardsByMythology(mythology: Mythology): Card[] {
  return CARD_DATABASE.filter(card => card.mythology === mythology);
}

export function createDeck(mythology: Mythology): Card[] {
  const mythologyCards = getCardsByMythology(mythology);
  
  // Create a balanced deck: 4 beasts, 3 techniques, 3 artifacts
  const beasts = mythologyCards.filter(card => card.type === CardType.BEAST).slice(0, 4);
  const techniques = mythologyCards.filter(card => card.type === CardType.TECHNIQUE).slice(0, 3);
  const artifacts = mythologyCards.filter(card => card.type === CardType.ARTIFACT).slice(0, 3);
  
  return [...beasts, ...techniques, ...artifacts];
}
