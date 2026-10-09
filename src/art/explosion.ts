import { INK, PAPER } from './jimee';

/**
 * Explosion façon planche : nuage blanc cerné d'encre qui gonfle (images 0 à 5),
 * se disloque en points (6 et 7), puis laisse un petit nuage de fumée (8).
 * (x, y) = centre au sol, `radius` = rayon de la zone touchée.
 */
export function drawExplosion(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, frame: number): void {
  ctx.save();
  ctx.translate(x, y - radius * 0.45);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;

  if (frame === 8) {
    cloud(ctx, radius * 0.32, 6, 0.4);
    ctx.restore();
    return;
  }

  const growth = [0.3, 0.45, 0.62, 0.78, 0.9, 1, 1, 1][frame];
  const r = radius * 0.62 * growth;
  if (frame <= 5) {
    cloud(ctx, r, 9, frame * 0.7);
    // Petits débris projetés autour.
    if (frame >= 4) {
      ctx.fillStyle = INK;
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 * i) / 6 + 0.4;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * r * 1.35, Math.sin(a) * r * 1.2, 1.6, 2.4, a, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    // Le nuage se disloque : contour en tirets, puis seulement des points.
    ctx.setLineDash(frame === 6 ? [7, 6] : [1.5, 8]);
    cloud(ctx, r, 9, 3.5, false);
    ctx.setLineDash([]);
  }
  ctx.restore();
}

/** Nuage festonné blanc à contour épais. */
function cloud(ctx: CanvasRenderingContext2D, r: number, bumps: number, twist: number, filled = true): void {
  ctx.beginPath();
  for (let i = 0; i < bumps; i++) {
    const a0 = (Math.PI * 2 * i) / bumps + twist;
    const a1 = (Math.PI * 2 * (i + 1)) / bumps + twist;
    const am = (a0 + a1) / 2;
    const bulge = r * (1.32 + 0.1 * Math.sin(i * 1.7));
    if (i === 0) ctx.moveTo(Math.cos(a0) * r, Math.sin(a0) * r);
    ctx.quadraticCurveTo(Math.cos(am) * bulge, Math.sin(am) * bulge, Math.cos(a1) * r, Math.sin(a1) * r);
  }
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = PAPER;
    ctx.fill();
  }
  ctx.lineWidth = 2.4;
  ctx.stroke();
  if (!filled) return;
  // Volutes intérieures.
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(-r * 0.25, -r * 0.1, r * 0.35, Math.PI * 0.9, Math.PI * 1.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(r * 0.3, r * 0.2, r * 0.3, Math.PI * 1.6, Math.PI * 2.3);
  ctx.stroke();
}
