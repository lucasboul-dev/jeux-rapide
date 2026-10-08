import type { JimeeModel, Planet } from '../data/types';
import type { RocketStats } from '../economy/rocket';
import type { Rng } from '../economy/rng';

/** Largeur du terrain, environ 3 écrans de téléphone. */
export const WORLD_WIDTH = 1200;
export const ROCKET_X = 60;
export const ENEMY_BASE_X = 1140;
export const FIXED_DT = 1 / 60;
/** Secondes simulées au plus par image (évite un bond après une mise en arrière-plan). */
export const MAX_FRAME = 0.25;
export const PROJECTILE_DURATION = 0.4;
export const WAVE_SPACING = 0.6;
export const BOSS_TIME = 20;
export const FIRST_WAVE_DELAY = 3;

export type Side = 'jimee' | 'enemy';

export interface TeamSlot {
  model: JimeeModel;
  level: number;
}

export interface BattleSetup {
  planet: Planet;
  team: (TeamSlot | null)[];
  rocket: RocketStats;
  seed: number;
}

export interface Unit {
  id: number;
  side: Side;
  /** Id du modèle de Jimee ou de l'ennemi. */
  defId: string;
  x: number;
  hp: number;
  maxHp: number;
  shield: number;
  damage: number;
  speed: number;
  range: number;
  attackInterval: number;
  cooldown: number;
  ranged: boolean;
  abilityTimer: number;
  isBoss: boolean;
  /** Vrai pendant un pas où l'unité attaque ou attend à portée (sert à l'animation). */
  engaged: boolean;
}

export interface Projectile {
  fromX: number;
  toX: number;
  /** Avancement de 0 à 1. */
  t: number;
  side: Side;
  damage: number;
  /** Unité visée, ou `null` si c'est la base adverse. */
  targetId: number | null;
  splash?: number;
}

export type BattleEvent =
  | { kind: 'hit'; x: number }
  | { kind: 'death'; x: number; side: Side }
  | { kind: 'explosion'; x: number; radius: number }
  | { kind: 'heal'; x: number }
  | { kind: 'cannon'; x: number; radius: number };

export interface BattleState {
  time: number;
  outcome: 'running' | 'won' | 'lost';
  rng: Rng;
  setup: BattleSetup;
  units: Unit[];
  projectiles: Projectile[];
  rocketHp: number;
  enemyBaseHp: number;
  enemyBaseMaxHp: number;
  charge: number;
  cannonCooldown: number;
  turretCooldown: number;
  waveTimer: number;
  /** Ennemis d'une vague en attente d'apparition, avec leur délai restant. */
  spawnQueue: { enemyId: string; delay: number }[];
  bossSpawned: boolean;
  nextId: number;
  /** Temps non encore simulé (pas fixe). */
  accumulator: number;
  stats: { kills: number; enemyCredits: number; jimeesLost: number };
  /** Vidé par le rendu à chaque image. */
  events: BattleEvent[];
}
