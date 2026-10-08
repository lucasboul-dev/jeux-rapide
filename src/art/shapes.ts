/** Petites aides de dessin partagées (indépendantes de roundRect pour rester compatibles partout). */

export const OUTLINE = '#1d2340';

export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rotation = 0,
): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
}

export function fillStroke(ctx: CanvasRenderingContext2D, fill: string, lineWidth = 1.2): void {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
}

/** Barre de vie posée au-dessus d'un élément. */
export function healthBar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  width: number,
  ratio: number,
  color: string,
): void {
  const r = Math.max(0, Math.min(1, ratio));
  ctx.fillStyle = 'rgba(29,35,64,0.55)';
  ctx.fillRect(cx - width / 2, y, width, 4);
  ctx.fillStyle = color;
  ctx.fillRect(cx - width / 2, y, width * r, 4);
}
