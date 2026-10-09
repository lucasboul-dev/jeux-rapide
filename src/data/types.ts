export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export const RARITIES: readonly Rarity[] = ['common', 'rare', 'epic', 'legendary'];

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

export type Ability =
  /** À sa mort, inflige damageFactor × ses dégâts aux ennemis dans le rayon. */
  | { kind: 'explodeOnDeath'; radius: number; damageFactor: number }
  /** Toutes les `interval` s, soigne amountFactor × sa vie max aux Jimees dans le rayon. */
  | { kind: 'heal'; radius: number; amountFactor: number; interval: number }
  /** Apparaît avec un bouclier de amountFactor × sa vie max. */
  | { kind: 'shield'; amountFactor: number }
  /** Ses tirs touchent tous les ennemis dans le rayon autour de l'impact. */
  | { kind: 'splash'; radius: number }
  /** Toutes les `interval` s, répare la fusée de amountFactor × sa vie max. */
  | { kind: 'repairRocket'; amountFactor: number; interval: number }
  /** Les ennemis touchés avancent à `factor` × leur vitesse pendant `duration` s. */
  | { kind: 'slow'; factor: number; duration: number }
  /** Les Jimees dans le rayon (lui compris) infligent +damageBonus (ex. 0,3 = +30 %) de dégâts. */
  | { kind: 'aura'; radius: number; damageBonus: number };

export interface StatProfile {
  hp: number;
  damage: number;
  speed: number;
  range: number;
  attackInterval: number;
}

export type Accessory =
  | 'none'
  | 'bow'
  | 'helmet'
  | 'sneakers'
  | 'dynamite'
  | 'cross'
  | 'plate'
  | 'antenna'
  | 'badge'
  | 'shield'
  | 'satchel'
  | 'wrench'
  | 'hourglass'
  | 'megaphone';

export interface JimeeModel {
  id: string;
  name: string;
  rarity: Rarity;
  /** Coût en points de chargement. */
  cost: number;
  ranged: boolean;
  /** Statistiques pour une puissance de 100. */
  profile: StatProfile;
  belt: string;
  accessory: Accessory;
  description: string;
  ability?: Ability;
}

export interface EnemyDef {
  id: string;
  name: string;
  ranged: boolean;
  stats: StatProfile;
  /** Crédits gagnés quand il est vaincu. */
  reward: number;
  look: 'blob' | 'spitter' | 'shell' | 'employee' | 'boss';
}

export interface Planet {
  id: number;
  name: string;
  biome: string;
  palette: { sky: string; ground: string; accent: string; creature: string };
  baseHp: number;
  enemyPool: string[];
  waveInterval: number;
  waveSize: number;
  statMultiplier: number;
  bossId?: string;
}

export type UpgradeKey = 'chargeRate' | 'chargeMax' | 'turret' | 'cannon';

export const UPGRADE_KEYS: readonly UpgradeKey[] = ['chargeRate', 'chargeMax', 'turret', 'cannon'];

export interface CorpLines {
  counter: string[];
  victory: string[];
  defeat: string[];
  newModel: string[];
  buyback: string[];
  mourningPosterTitles: string[];
}
