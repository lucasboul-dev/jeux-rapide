import type { BattleState, Projectile, Unit } from './types';

// Crochets appelés par la simulation. Remplis à la tâche 8 (capacités, tourelle, canon).

/** Appelé à l'apparition d'une unité. */
export function onSpawn(_state: BattleState, _unit: Unit): void {}

/** Renvoie les dégâts réellement retirés aux points de vie. */
export function onDamage(_state: BattleState, _unit: Unit, amount: number): number {
  return amount;
}

/** Appelé à la mort d'une unité. */
export function onDeath(_state: BattleState, _unit: Unit): void {}

export function tickAbilities(_state: BattleState, _dt: number): void {}

export function tickTurret(_state: BattleState, _dt: number): void {}

/** Renvoie `true` si le projectile a été entièrement traité ici (tir de zone). */
export function landProjectile(_state: BattleState, _p: Projectile): boolean {
  return false;
}
