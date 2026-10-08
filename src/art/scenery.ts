import type { Planet } from '../data/types';
import { OUTLINE, ellipse, fillStroke, healthBar, roundedRect } from './shapes';

/** La fusée du capitaine, posée au sol, avec sa tourelle. */
export function drawRocket(ctx: CanvasRenderingContext2D, x: number, groundY: number, hpRatio: number): void {
  ctx.save();
  ctx.translate(x, groundY);
  // Ailerons
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 12, -10);
    ctx.lineTo(side * 24, 0);
    ctx.lineTo(side * 12, -30);
    ctx.closePath();
    fillStroke(ctx, '#e4572e');
  }
  // Corps
  roundedRect(ctx, -13, -92, 26, 92, 8);
  fillStroke(ctx, '#f4f1e8', 1.6);
  // Nez
  ctx.beginPath();
  ctx.moveTo(-13, -88);
  ctx.quadraticCurveTo(0, -125, 13, -88);
  ctx.closePath();
  fillStroke(ctx, '#e4572e', 1.6);
  // Hublot
  ellipse(ctx, 0, -62, 7, 7);
  fillStroke(ctx, '#7cc6fe', 1.4);
  // Bande « Corp »
  ctx.fillStyle = '#ff8a1f';
  ctx.fillRect(-13, -36, 26, 6);
  // Tourelle sur le flanc
  roundedRect(ctx, 10, -54, 14, 10, 3);
  fillStroke(ctx, '#8c96a6');
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(22, -51, 10, 4);
  ctx.restore();
  healthBar(ctx, x, groundY - 132, 44, hpRatio, '#2bb673');
}

/** Base ennemie : un terrier rocheux, ou une agence de Jimmy's Inc. sur les planètes boss. */
export function drawEnemyBase(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  hpRatio: number,
  planet: Planet,
): void {
  ctx.save();
  ctx.translate(x, groundY);
  if (planet.enemyPool.includes('employe')) {
    roundedRect(ctx, -32, -110, 64, 110, 4);
    fillStroke(ctx, '#4b5563', 1.6);
    ctx.fillStyle = '#c7d2fe';
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) ctx.fillRect(-24 + col * 18, -100 + row * 18, 11, 10);
    }
    roundedRect(ctx, -36, -128, 72, 16, 3);
    fillStroke(ctx, '#26a69a', 1.2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("JIMMY'S INC.", 0, -117);
  } else {
    ctx.beginPath();
    ctx.moveTo(-46, 0);
    ctx.quadraticCurveTo(-40, -80, 0, -84);
    ctx.quadraticCurveTo(40, -80, 46, 0);
    ctx.closePath();
    fillStroke(ctx, planet.palette.accent, 1.6);
    ctx.beginPath();
    ctx.ellipse(-6, 0, 16, 26, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = '#1b1b24';
    ctx.fill();
    ellipse(ctx, -12, -46, 4, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fill();
  }
  ctx.restore();
  healthBar(ctx, x, groundY - 140, 56, hpRatio, '#e4572e');
}

/** Ciel, collines lointaines (léger décalage de parallaxe) et sol de la planète, en coordonnées d'écran. */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  cameraX: number,
  width: number,
  height: number,
  groundY: number,
): void {
  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  sky.addColorStop(0, planet.palette.sky);
  sky.addColorStop(1, '#ffffff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = planet.palette.accent;
  ctx.globalAlpha = 0.28;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  const offset = cameraX * 0.3;
  for (let sx = 0; sx <= width + 40; sx += 40) {
    const wx = sx + offset;
    ctx.lineTo(sx, groundY - 40 - Math.sin(wx * 0.012) * 22 - Math.sin(wx * 0.031) * 10);
  }
  ctx.lineTo(width, groundY);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = planet.palette.ground;
  ctx.fillRect(0, groundY, width, height - groundY);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(0, groundY, width, 3);
}
