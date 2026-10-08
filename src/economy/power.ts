import { ECONOMY } from '../data/economy';
import type { JimeeModel, Rarity, StatProfile } from '../data/types';

/** Puissance au niveau n : base × (1 + gain × (n − 1)), selon la rareté. */
export function modelPower(rarity: Rarity, level: number): number {
  const { base, gain } = ECONOMY.rarityCurve[rarity];
  return base * (1 + gain * (level - 1));
}

/** Statistiques réelles d'un modèle : vie et dégâts suivent la puissance, le reste ne change pas. */
export function unitStats(model: JimeeModel, level: number): StatProfile {
  const factor = modelPower(model.rarity, level) / 100;
  return {
    ...model.profile,
    hp: model.profile.hp * factor,
    damage: model.profile.damage * factor,
  };
}
