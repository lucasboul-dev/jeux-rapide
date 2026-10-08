import { ECONOMY } from '../data/economy';
import type { UpgradeKey } from '../data/types';
import type { Wallet } from './capsules';

export type RocketLevels = Record<UpgradeKey, number>;

export interface RocketStats {
  hp: number;
  chargeMax: number;
  chargeRate: number;
  turretDamage: number;
  turretRange: number;
  turretInterval: number;
  cannonDamage: number;
  cannonRadius: number;
  cannonCooldown: number;
}

/** Coût pour passer du niveau `level` au suivant, arrondi à la dizaine. `null` au niveau max. */
export function upgradeCost(level: number): number | null {
  if (level >= ECONOMY.maxUpgradeLevel) return null;
  const raw = ECONOMY.upgradeBaseCost * ECONOMY.upgradeGrowth ** (level - 1);
  return Math.round(raw / 10) * 10;
}

export function rocketStats(levels: RocketLevels): RocketStats {
  const r = ECONOMY.rocket;
  const above = (key: UpgradeKey) => levels[key] - 1;
  return {
    hp: r.hp,
    chargeMax: r.chargeMax + r.chargeMaxPerLevel * above('chargeMax'),
    chargeRate: r.chargeRate + r.chargeRatePerLevel * above('chargeRate'),
    turretDamage: r.turretDamage * (1 + r.turretPerLevel * above('turret')),
    turretRange: r.turretRange,
    turretInterval: r.turretInterval,
    cannonDamage: r.cannonDamage * (1 + r.cannonDamagePerLevel * above('cannon')),
    cannonRadius: r.cannonRadius,
    cannonCooldown: r.cannonCooldown - r.cannonCooldownPerLevel * above('cannon'),
  };
}

/** Achète un niveau d'amélioration. `null` si niveau max ou crédits insuffisants. */
export function buyUpgrade<W extends Wallet & { rocket: RocketLevels }>(save: W, key: UpgradeKey): W | null {
  const cost = upgradeCost(save.rocket[key]);
  if (cost === null || save.credits < cost) return null;
  return {
    ...save,
    credits: save.credits - cost,
    rocket: { ...save.rocket, [key]: save.rocket[key] + 1 },
  };
}
