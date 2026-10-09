import { ENEMIES } from '../data/enemies';
import { jimeeById } from '../data/jimees';
import { unitStats } from '../economy/power';
import { createRng, pick } from '../economy/rng';
import { applySlow, auraMultiplier, landProjectile, onDamage, onDeath, onSpawn, tickAbilities, tickTurret } from './abilities';
export { fireCannon } from './abilities';
import {
  BOSS_TIME,
  ENEMY_BASE_X,
  FIRST_WAVE_DELAY,
  FIXED_DT,
  MAX_FRAME,
  PROJECTILE_DURATION,
  ROCKET_X,
  WAVE_SPACING,
  type BattleSetup,
  type BattleState,
  type Projectile,
  type Side,
  type TeamSlot,
  type Unit,
} from './types';

export function createBattle(setup: BattleSetup): BattleState {
  return {
    time: 0,
    outcome: 'running',
    rng: createRng(setup.seed),
    setup,
    units: [],
    projectiles: [],
    rocketHp: setup.rocket.hp,
    enemyBaseHp: setup.planet.baseHp,
    enemyBaseMaxHp: setup.planet.baseHp,
    charge: 0,
    cannonCooldown: 0,
    turretCooldown: 0,
    waveTimer: FIRST_WAVE_DELAY,
    spawnQueue: [],
    bossSpawned: false,
    nextId: 1,
    accumulator: 0,
    stats: { kills: 0, enemyCredits: 0, jimeesLost: 0 },
    events: [],
  };
}

function addUnit(state: BattleState, unit: Omit<Unit, 'id' | 'cooldown' | 'abilityTimer' | 'shield' | 'engaged' | 'slowTimer' | 'slowFactor'>): Unit {
  const full: Unit = {
    ...unit,
    id: state.nextId++,
    cooldown: 0,
    abilityTimer: 0,
    shield: 0,
    engaged: false,
    slowTimer: 0,
    slowFactor: 1,
  };
  state.units.push(full);
  onSpawn(state, full);
  return full;
}

export function spawnJimee(state: BattleState, slot: TeamSlot): Unit {
  const stats = unitStats(slot.model, slot.level);
  return addUnit(state, {
    side: 'jimee',
    defId: slot.model.id,
    x: ROCKET_X + 20,
    hp: stats.hp,
    maxHp: stats.hp,
    damage: stats.damage,
    speed: stats.speed,
    range: stats.range,
    attackInterval: stats.attackInterval,
    ranged: slot.model.ranged,
    isBoss: false,
  });
}

/** Fait apparaître un ennemi ; vie et dégâts sont multipliés par la difficulté de la planète. */
export function spawnEnemy(state: BattleState, enemyId: string, x = ENEMY_BASE_X - 20): Unit {
  const def = ENEMIES[enemyId];
  if (!def) throw new Error(`Ennemi inconnu : ${enemyId}`);
  const m = state.setup.planet.statMultiplier;
  return addUnit(state, {
    side: 'enemy',
    defId: def.id,
    x,
    hp: def.stats.hp * m,
    maxHp: def.stats.hp * m,
    damage: def.stats.damage * m,
    speed: def.stats.speed,
    range: def.stats.range,
    attackInterval: def.stats.attackInterval,
    ranged: def.ranged,
    isBoss: def.look === 'boss',
  });
}

/** Envoie le Jimee d'un emplacement. `false` si vide, partie finie ou chargement insuffisant. */
export function sendJimee(state: BattleState, slot: number): boolean {
  if (state.outcome !== 'running') return false;
  const teamSlot = state.setup.team[slot];
  if (!teamSlot || state.charge < teamSlot.model.cost) return false;
  state.charge -= teamSlot.model.cost;
  spawnJimee(state, teamSlot);
  return true;
}

export function abandonBattle(state: BattleState): void {
  if (state.outcome === 'running') state.outcome = 'lost';
}

/** Inflige des dégâts à une unité (le bouclier éventuel absorbe d'abord). */
export function dealDamage(state: BattleState, unit: Unit, amount: number): void {
  if (unit.hp <= 0) return;
  unit.hp -= onDamage(state, unit, amount);
  state.events.push({ kind: 'hit', x: unit.x });
}

/** Inflige des dégâts à la base du camp `side` (la fusée pour 'jimee', la base ennemie pour 'enemy'). */
export function damageBase(state: BattleState, side: Side, amount: number): void {
  if (side === 'jimee') {
    state.rocketHp = Math.max(0, state.rocketHp - amount);
    state.events.push({ kind: 'hit', x: ROCKET_X });
  } else {
    state.enemyBaseHp = Math.max(0, state.enemyBaseHp - amount);
    state.events.push({ kind: 'hit', x: ENEMY_BASE_X });
  }
}

export const opponent = (side: Side): Side => (side === 'jimee' ? 'enemy' : 'jimee');
const direction = (side: Side) => (side === 'jimee' ? 1 : -1);
const opposingBaseX = (side: Side) => (side === 'jimee' ? ENEMY_BASE_X : ROCKET_X);

/** L'unité adverse vivante la plus proche devant `u` (un léger chevauchement est toléré). */
function nearestFoe(state: BattleState, u: Unit): { foe: Unit; distance: number } | null {
  const dir = direction(u.side);
  let best: Unit | null = null;
  let bestD = Infinity;
  for (const o of state.units) {
    if (o.side === u.side || o.hp <= 0) continue;
    const d = (o.x - u.x) * dir;
    if (d >= -5 && d < bestD) {
      best = o;
      bestD = d;
    }
  }
  return best ? { foe: best, distance: bestD } : null;
}

function act(state: BattleState, u: Unit, dt: number): void {
  u.cooldown = Math.max(0, u.cooldown - dt);
  const dir = direction(u.side);
  const near = nearestFoe(state, u);
  const baseX = opposingBaseX(u.side);
  const baseDistance = (baseX - u.x) * dir;

  let target: Unit | 'base' | null = null;
  if (near && near.distance <= u.range) target = near.foe;
  else if (baseDistance <= u.range) target = 'base';

  u.engaged = target !== null;
  if (target === null) {
    // Avance sans dépasser la portée de la prochaine cible.
    let limit = baseDistance - u.range;
    if (near) limit = Math.min(limit, near.distance - u.range);
    const speed = u.slowTimer > 0 ? u.speed * u.slowFactor : u.speed;
    u.x += dir * Math.min(speed * dt, Math.max(0, limit));
    return;
  }
  if (u.cooldown > 0) return;
  u.cooldown = u.attackInterval;

  const targetX = target === 'base' ? baseX : target.x;
  const damage = u.damage * auraMultiplier(state, u);
  if (u.ranged) {
    const ability = u.side === 'jimee' ? jimeeById(u.defId).ability : undefined;
    const projectile: Projectile = {
      fromX: u.x,
      toX: targetX,
      t: 0,
      side: u.side,
      damage,
      targetId: target === 'base' ? null : target.id,
    };
    if (ability?.kind === 'splash') projectile.splash = ability.radius;
    if (ability?.kind === 'slow') projectile.slow = { factor: ability.factor, duration: ability.duration };
    state.projectiles.push(projectile);
  } else if (target === 'base') {
    damageBase(state, opponent(u.side), damage);
  } else {
    dealDamage(state, target, damage);
  }
}

function moveProjectiles(state: BattleState, dt: number): void {
  for (const p of state.projectiles) {
    p.t += dt / PROJECTILE_DURATION;
    if (p.t < 1) continue;
    if (landProjectile(state, p)) continue;
    if (p.targetId === null) {
      damageBase(state, opponent(p.side), p.damage);
    } else {
      const target = state.units.find((u) => u.id === p.targetId);
      if (target) {
        dealDamage(state, target, p.damage);
        if (p.slow) applySlow(target, p.slow);
      }
    }
  }
  state.projectiles = state.projectiles.filter((p) => p.t < 1);
}

function resolveDeaths(state: BattleState): void {
  const handled = new Set<number>();
  for (;;) {
    const dying = state.units.filter((u) => u.hp <= 0 && !handled.has(u.id));
    if (dying.length === 0) break;
    for (const u of dying) {
      handled.add(u.id);
      if (u.side === 'enemy') {
        state.stats.kills += 1;
        state.stats.enemyCredits += ENEMIES[u.defId].reward;
      } else {
        state.stats.jimeesLost += 1;
      }
      state.events.push({ kind: 'death', x: u.x, side: u.side });
      onDeath(state, u);
    }
  }
  state.units = state.units.filter((u) => u.hp > 0);
}

function tickWaves(state: BattleState, dt: number): void {
  const { planet } = state.setup;
  state.waveTimer -= dt;
  if (state.waveTimer <= 0) {
    for (let i = 0; i < planet.waveSize; i++) {
      state.spawnQueue.push({ enemyId: pick(state.rng, planet.enemyPool), delay: i * WAVE_SPACING });
    }
    state.waveTimer += planet.waveInterval;
  }
  for (const q of state.spawnQueue) {
    q.delay -= dt;
    if (q.delay <= 0) spawnEnemy(state, q.enemyId);
  }
  state.spawnQueue = state.spawnQueue.filter((q) => q.delay > 0);

  if (planet.bossId && !state.bossSpawned && state.time >= BOSS_TIME) {
    state.bossSpawned = true;
    spawnEnemy(state, planet.bossId);
  }
}

/** Un pas de simulation. Sans effet une fois la partie terminée. */
export function stepBattle(state: BattleState, dt: number): void {
  if (state.outcome !== 'running') return;
  const { rocket } = state.setup;
  state.time += dt;
  state.charge = Math.min(rocket.chargeMax, state.charge + rocket.chargeRate * dt);
  state.cannonCooldown = Math.max(0, state.cannonCooldown - dt);
  for (const u of state.units) u.slowTimer = Math.max(0, u.slowTimer - dt);

  tickWaves(state, dt);
  tickTurret(state, dt);
  tickAbilities(state, dt);
  for (const u of state.units) if (u.hp > 0) act(state, u, dt);
  moveProjectiles(state, dt);
  resolveDeaths(state);

  if (state.enemyBaseHp <= 0) state.outcome = 'won';
  else if (state.rocketHp <= 0) state.outcome = 'lost';
}

/** Avance du temps écoulé depuis la dernière image, par pas fixes, en plafonnant les gros écarts. */
export function advanceBattle(state: BattleState, frameSeconds: number): void {
  state.accumulator += Math.min(Math.max(0, frameSeconds), MAX_FRAME);
  while (state.accumulator >= FIXED_DT - 1e-9) {
    stepBattle(state, FIXED_DT);
    state.accumulator -= FIXED_DT;
  }
}
