import { jimeeById } from '../data/jimees';
import type { Ability } from '../data/types';
import { damageBase, dealDamage, opponent } from './sim';
import { ROCKET_X, type BattleState, type Projectile, type Unit } from './types';

function abilityOf(unit: Unit): Ability | undefined {
  return unit.side === 'jimee' ? jimeeById(unit.defId).ability : undefined;
}

function unitsWithin(state: BattleState, side: Unit['side'], x: number, radius: number): Unit[] {
  return state.units.filter((u) => u.side === side && u.hp > 0 && Math.abs(u.x - x) <= radius);
}

/** Le Blindé apparaît avec son bouclier. */
export function onSpawn(_state: BattleState, unit: Unit): void {
  const ability = abilityOf(unit);
  if (ability?.kind === 'shield') unit.shield = ability.amountFactor * unit.maxHp;
}

/** Le bouclier absorbe en premier ; renvoie les dégâts retirés aux points de vie. */
export function onDamage(_state: BattleState, unit: Unit, amount: number): number {
  const absorbed = Math.min(unit.shield, amount);
  unit.shield -= absorbed;
  return amount - absorbed;
}

/** Le Kamikaze explose à sa mort. */
export function onDeath(state: BattleState, unit: Unit): void {
  const ability = abilityOf(unit);
  if (ability?.kind !== 'explodeOnDeath') return;
  for (const foe of unitsWithin(state, opponent(unit.side), unit.x, ability.radius)) {
    dealDamage(state, foe, ability.damageFactor * unit.damage);
  }
  state.events.push({ kind: 'explosion', x: unit.x, radius: ability.radius });
}

/**
 * Capacités périodiques : l'Infirmier soigne les Jimees proches (lui compris),
 * le Mécano répare la fusée. Jamais au-delà du maximum.
 */
export function tickAbilities(state: BattleState, dt: number): void {
  for (const unit of state.units) {
    const ability = abilityOf(unit);
    if (!ability || unit.hp <= 0 || (ability.kind !== 'heal' && ability.kind !== 'repairRocket')) continue;
    unit.abilityTimer += dt;
    if (unit.abilityTimer < ability.interval) continue;
    unit.abilityTimer -= ability.interval;
    const amount = ability.amountFactor * unit.maxHp;
    if (ability.kind === 'heal') {
      for (const ally of unitsWithin(state, unit.side, unit.x, ability.radius)) {
        ally.hp = Math.min(ally.maxHp, ally.hp + amount);
      }
      state.events.push({ kind: 'heal', x: unit.x });
    } else {
      state.rocketHp = Math.min(state.setup.rocket.hp, state.rocketHp + amount);
      state.events.push({ kind: 'heal', x: ROCKET_X });
    }
  }
}

/** Ralentit une unité ; un nouveau ralentissement remplace l'ancien s'il dure plus longtemps. */
export function applySlow(unit: Unit, slow: { factor: number; duration: number }): void {
  unit.slowFactor = slow.factor;
  unit.slowTimer = Math.max(unit.slowTimer, slow.duration);
}

/** Multiplicateur de dégâts d'une unité : +bonus si un Jimee à aura (lui compris) est à portée (non cumulable). */
export function auraMultiplier(state: BattleState, unit: Unit): number {
  let best = 0;
  for (const other of state.units) {
    if (other.side !== unit.side || other.hp <= 0) continue;
    const ability = abilityOf(other);
    if (ability?.kind === 'aura' && Math.abs(other.x - unit.x) <= ability.radius) {
      best = Math.max(best, ability.damageBonus);
    }
  }
  return 1 + best;
}

/** La tourelle de la fusée tire seule sur l'ennemi le plus proche à portée. */
export function tickTurret(state: BattleState, dt: number): void {
  const { rocket } = state.setup;
  state.turretCooldown = Math.max(0, state.turretCooldown - dt);
  if (state.turretCooldown > 0) return;
  let target: Unit | null = null;
  for (const u of state.units) {
    if (u.side !== 'enemy' || u.hp <= 0 || u.x - ROCKET_X > rocket.turretRange) continue;
    if (!target || u.x < target.x) target = u;
  }
  if (!target) return;
  dealDamage(state, target, rocket.turretDamage);
  state.turretCooldown = rocket.turretInterval;
}

/** Tir de zone (Prototype) : touche tous les adversaires autour du point d'impact. */
export function landProjectile(state: BattleState, p: Projectile): boolean {
  if (p.splash === undefined) return false;
  if (p.targetId === null) damageBase(state, opponent(p.side), p.damage);
  for (const foe of unitsWithin(state, opponent(p.side), p.toX, p.splash)) {
    dealDamage(state, foe, p.damage);
    if (p.slow) applySlow(foe, p.slow);
  }
  state.events.push({ kind: 'explosion', x: p.toX, radius: p.splash });
  return true;
}

/** Canon de la fusée : frappe une zone autour de `x`, puis se recharge. */
export function fireCannon(state: BattleState, x: number): boolean {
  if (state.outcome !== 'running' || state.cannonCooldown > 0) return false;
  const { rocket } = state.setup;
  for (const foe of unitsWithin(state, 'enemy', x, rocket.cannonRadius)) dealDamage(state, foe, rocket.cannonDamage);
  state.cannonCooldown = rocket.cannonCooldown;
  state.events.push({ kind: 'cannon', x, radius: rocket.cannonRadius });
  return true;
}
