import { ECONOMY } from '../data/economy';
import { PLANETS } from '../data/planets';
import type { Wallet } from './capsules';
import type { Rng } from './rng';

/** Un abandon compte comme une défaite. */
export type BattleOutcome = 'won' | 'lost';

export type Progress = Wallet & {
  highestUnlocked: number;
  conquered: number[];
};

/**
 * Victoire : crédits des ennemis + bonus de planète. Défaite : crédits des ennemis seulement.
 * Planète déjà conquise : tout est multiplié par le facteur de farm.
 */
export function battleCredits(p: {
  outcome: BattleOutcome;
  planetId: number;
  enemyCredits: number;
  firstConquest: boolean;
}): number {
  const bonus = p.outcome === 'won' ? ECONOMY.planetBonusPerPlanet * p.planetId : 0;
  const factor = p.firstConquest ? 1 : ECONOMY.replayFactor;
  return Math.round((p.enemyCredits + bonus) * factor);
}

export function rollCrystal(rng: Rng): boolean {
  return rng() < ECONOMY.crystalDropChance;
}

const LAST_PLANET = PLANETS.length;

export function applyBattleResult<P extends Progress>(
  save: P,
  r: { outcome: BattleOutcome; planetId: number; credits: number; crystal: boolean },
): P {
  const next: P = {
    ...save,
    credits: save.credits + r.credits,
    crystals: save.crystals + (r.crystal ? 1 : 0),
  };
  if (r.outcome !== 'won') return next;
  return {
    ...next,
    conquered: save.conquered.includes(r.planetId) ? save.conquered : [...save.conquered, r.planetId],
    highestUnlocked: Math.max(save.highestUnlocked, Math.min(r.planetId + 1, LAST_PLANET)),
  };
}
