import { drawEnemy } from '../art/enemies';
import { drawJimee } from '../art/jimee';
import { drawBackground, drawEnemyBase, drawRocket } from '../art/scenery';
import { healthBar } from '../art/shapes';
import { ENEMIES } from '../data/enemies';
import { jimeeById } from '../data/jimees';
import type { Camera } from './camera';
import { ENEMY_BASE_X, ROCKET_X, type BattleEvent, type BattleState, type Unit } from './types';

/** Hauteur de la scène (ciel + sol), en unités du terrain. */
export const VIEW_HEIGHT = 260;
export const GROUND_Y = 215;
/** Largeur visible visée : environ un tiers du terrain, comme le veut la spec. */
export const TARGET_VIEW_WIDTH = 400;

interface Effect {
  event: BattleEvent;
  born: number;
}

const LIFETIME: Record<BattleEvent['kind'], number> = {
  hit: 0.15,
  death: 0.45,
  explosion: 0.4,
  heal: 0.7,
  cannon: 0.55,
};

/** Effets visuels en cours, par bataille (les événements de la simulation sont consommés à chaque image). */
const effects = new WeakMap<BattleState, Effect[]>();

/**
 * Échelle écran / terrain : on montre environ TARGET_VIEW_WIDTH unités de large,
 * sans dépasser la hauteur de la scène sur un écran très large.
 */
export function renderScale(width: number, height: number): number {
  return Math.min(height / VIEW_HEIGHT, width / TARGET_VIEW_WIDTH);
}

function laneOffset(u: Unit): number {
  return (u.id % 4) * 4;
}

function drawUnit(ctx: CanvasRenderingContext2D, state: BattleState, u: Unit): void {
  const y = GROUND_Y + laneOffset(u);
  const walkPhase = u.engaged ? 0 : state.time * u.speed * 0.22 + u.id;
  let top: number;
  if (u.side === 'jimee') {
    drawJimee(ctx, u.x, y, jimeeById(u.defId), { facing: 1, walkPhase, scale: 1 });
    top = y - 48;
  } else {
    drawEnemy(ctx, u.x, y, ENEMIES[u.defId], state.setup.planet.palette, { facing: -1, walkPhase });
    top = y - (u.isBoss ? 78 : 44);
  }
  if (u.hp < u.maxHp) healthBar(ctx, u.x, top, u.isBoss ? 40 : 22, u.hp / u.maxHp, u.side === 'jimee' ? '#2bb673' : '#e4572e');
  if (u.shield > 0) healthBar(ctx, u.x, top - 5, 22, u.shield / u.maxHp, '#3fa7d6');
}

function drawProjectiles(ctx: CanvasRenderingContext2D, state: BattleState): void {
  for (const p of state.projectiles) {
    const x = p.fromX + (p.toX - p.fromX) * p.t;
    const y = GROUND_Y - 24 - Math.sin(Math.PI * p.t) * 30;
    ctx.beginPath();
    ctx.arc(x, y, p.splash ? 4 : 2.6, 0, Math.PI * 2);
    ctx.fillStyle = p.side === 'jimee' ? (p.splash ? '#ffcc00' : '#9aa3b2') : state.setup.planet.palette.creature;
    ctx.fill();
  }
}

function drawEffects(ctx: CanvasRenderingContext2D, state: BattleState): void {
  const list = effects.get(state) ?? [];
  for (const event of state.events) list.push({ event, born: state.time });
  state.events.length = 0;
  const alive = list.filter((e) => state.time - e.born < LIFETIME[e.event.kind]);
  effects.set(state, alive);

  for (const { event, born } of alive) {
    const k = (state.time - born) / LIFETIME[event.kind];
    ctx.globalAlpha = 1 - k;
    switch (event.kind) {
      case 'hit':
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(event.x, GROUND_Y - 20, 3 + k * 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'death':
        ctx.fillStyle = '#d1d5db';
        ctx.beginPath();
        ctx.arc(event.x, GROUND_Y - 14, 6 + k * 14, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'explosion':
        ctx.fillStyle = '#ff8a1f';
        ctx.beginPath();
        ctx.arc(event.x, GROUND_Y - 12, event.radius * (0.3 + 0.7 * k), 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'heal':
        ctx.fillStyle = '#2bb673';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', event.x, GROUND_Y - 50 - k * 18);
        break;
      case 'cannon':
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(event.x - 4, 0, 8, GROUND_Y);
        ctx.fillStyle = '#ff8a1f';
        ctx.beginPath();
        ctx.arc(event.x, GROUND_Y - 10, event.radius * (0.4 + 0.6 * k), 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }
  ctx.globalAlpha = 1;
}

/** Dessine une image de la bataille. `size` en pixels CSS du canvas. */
export function renderBattle(
  ctx: CanvasRenderingContext2D,
  state: BattleState,
  cam: Camera,
  size: { width: number; height: number },
): void {
  const scale = renderScale(size.width, size.height);
  ctx.save();
  ctx.clearRect(0, 0, size.width, size.height);
  ctx.fillStyle = state.setup.planet.palette.sky;
  ctx.fillRect(0, 0, size.width, size.height);
  ctx.scale(scale, scale);
  // La scène est posée en bas du canvas ; l'espace restant au-dessus est du ciel.
  ctx.translate(0, Math.max(0, size.height / scale - VIEW_HEIGHT));
  drawBackground(ctx, state.setup.planet, cam.x, size.width / scale, VIEW_HEIGHT, GROUND_Y);
  ctx.translate(-cam.x, 0);
  drawRocket(ctx, ROCKET_X, GROUND_Y, state.rocketHp / state.setup.rocket.hp);
  drawEnemyBase(ctx, ENEMY_BASE_X, GROUND_Y, state.enemyBaseHp / state.enemyBaseMaxHp, state.setup.planet);
  const ordered = [...state.units].sort((a, b) => laneOffset(a) - laneOffset(b));
  for (const u of ordered) drawUnit(ctx, state, u);
  drawProjectiles(ctx, state);
  drawEffects(ctx, state);
  ctx.restore();
}
