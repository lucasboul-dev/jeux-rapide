import type { EnemyDef, Planet } from '../data/types';
import { OUTLINE, ellipse, fillStroke, roundedRect } from './shapes';

export interface EnemyDrawOptions {
  facing: 1 | -1;
  walkPhase: number;
}

/** Créatures locales (couleur selon la planète) et employés de Jimmy's Inc. (x, y) = point au sol. */
export function drawEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  def: Pick<EnemyDef, 'look'>,
  palette: Planet['palette'],
  opts: EnemyDrawOptions,
): void {
  const step = Math.sin(opts.walkPhase);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(opts.facing, 1);
  switch (def.look) {
    case 'blob':
      drawBlob(ctx, palette.creature, step);
      break;
    case 'spitter':
      drawSpitter(ctx, palette.creature, step);
      break;
    case 'shell':
      drawShell(ctx, palette.creature, palette.accent, step);
      break;
    case 'employee':
      drawEmployee(ctx, step, 1);
      break;
    case 'boss':
      drawEmployee(ctx, step, 1.8);
      break;
  }
  ctx.restore();
}

function eye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ellipse(ctx, x, y, r, r);
  fillStroke(ctx, '#fff', 0.8);
  ellipse(ctx, x + r * 0.35, y, r * 0.5, r * 0.5);
  ctx.fillStyle = '#111';
  ctx.fill();
}

/** Blob : goutte molle qui sautille. */
function drawBlob(ctx: CanvasRenderingContext2D, color: string, step: number): void {
  const squash = 1 + Math.abs(step) * 0.12;
  ctx.beginPath();
  ctx.moveTo(-11 * squash, 0);
  ctx.quadraticCurveTo(-12 * squash, -18 / squash, 0, -19 / squash);
  ctx.quadraticCurveTo(12 * squash, -18 / squash, 11 * squash, 0);
  ctx.closePath();
  fillStroke(ctx, color);
  eye(ctx, 3, -11 / squash, 3.4);
}

/** Cracheur : corps rond monté sur deux pattes, avec une trompe. */
function drawSpitter(ctx: CanvasRenderingContext2D, color: string, step: number): void {
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4, -8);
  ctx.lineTo(-5 + step * 3, 0);
  ctx.moveTo(4, -8);
  ctx.lineTo(5 - step * 3, 0);
  ctx.stroke();
  ellipse(ctx, 0, -16, 10, 9);
  fillStroke(ctx, color);
  roundedRect(ctx, 7, -18, 9, 5, 2);
  fillStroke(ctx, color);
  eye(ctx, 1, -19, 2.6);
  eye(ctx, -5, -19, 2.2);
}

/** Carapace : grosse coque bombée sur de petites pattes. */
function drawShell(ctx: CanvasRenderingContext2D, color: string, shellColor: string, step: number): void {
  for (const px of [-9, -2, 5]) {
    ellipse(ctx, px + step * 1.5, -2, 3, 2.2);
    fillStroke(ctx, color, 0.8);
  }
  ctx.beginPath();
  ctx.ellipse(-2, -4, 15, 15, 0, Math.PI, 0);
  ctx.closePath();
  fillStroke(ctx, shellColor, 1.4);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.5;
  for (const a of [-0.6, 0, 0.6]) {
    ctx.beginPath();
    ctx.moveTo(-2, -4);
    ctx.lineTo(-2 + Math.sin(a) * 12, -4 - Math.cos(a) * 12);
    ctx.stroke();
  }
  ellipse(ctx, 14, -7, 5, 4.5);
  fillStroke(ctx, color);
  eye(ctx, 15, -8, 1.8);
}

/** Employé de Jimmy's Inc. : costume gris et casquette « plus chère » à visière dorée. */
function drawEmployee(ctx: CanvasRenderingContext2D, step: number, size: number): void {
  ctx.scale(size, size);
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-3, -10);
  ctx.lineTo(-3 + step * 3, 0);
  ctx.moveTo(3, -10);
  ctx.lineTo(3 - step * 3, 0);
  ctx.stroke();
  roundedRect(ctx, -7, -24, 14, 15, 3);
  fillStroke(ctx, '#6b7280');
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(-2.5, -24);
  ctx.lineTo(0, -19);
  ctx.lineTo(2.5, -24);
  ctx.fill();
  ctx.fillStyle = size > 1 ? '#7a1f3d' : '#26a69a';
  ctx.fillRect(-1, -22, 2, 8);
  ellipse(ctx, 0, -30, 6.5, 6.5);
  fillStroke(ctx, '#f0c9a0');
  ellipse(ctx, 3, -30, 1.1, 1.5);
  ctx.fillStyle = '#111';
  ctx.fill();
  // Casquette avec visière dorée.
  ctx.beginPath();
  ctx.ellipse(0, -33, 7, 5, 0, Math.PI, 0);
  ctx.closePath();
  fillStroke(ctx, '#26a69a', 0.9);
  ctx.fillStyle = '#e8b923';
  ctx.fillRect(2, -34, 7.5, 2);
  if (size > 1) {
    roundedRect(ctx, 7, -15, 7, 6, 1);
    fillStroke(ctx, '#5a3e2b', 0.7);
  }
}
