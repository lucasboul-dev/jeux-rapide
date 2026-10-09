import type { JimeeModel } from '../data/types';
import { OUTLINE, ellipse, fillStroke, roundedRect } from './shapes';

const BODY = '#f4f1e8';

export interface JimeeDrawOptions {
  /** 1 = regarde à droite, -1 = à gauche. */
  facing: 1 | -1;
  /** Phase de marche en radians (0 = immobile). */
  walkPhase: number;
  scale: number;
}

/**
 * Un Jimee, d'après la description de l'univers : tête ovale un peu penchée,
 * grands yeux noirs, corps rectangle blanc, pieds ovales, ceinture de couleur.
 * (x, y) = point au sol, au centre des pieds.
 */
export function drawJimee(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  model: Pick<JimeeModel, 'belt' | 'accessory'>,
  opts: JimeeDrawOptions,
): void {
  const step = Math.sin(opts.walkPhase);
  const bob = Math.abs(step) * 1.2;
  ctx.save();
  ctx.translate(x, y - bob);
  ctx.scale(opts.facing * opts.scale, opts.scale);

  // Pieds ovales, qui alternent en marchant.
  const feet = model.accessory === 'sneakers' ? '#e4572e' : BODY;
  ellipse(ctx, -4 + step * 2.5, -2, 4.5, 2.4);
  fillStroke(ctx, feet);
  ellipse(ctx, 5 - step * 2.5, -2, 4.5, 2.4);
  fillStroke(ctx, feet);

  // Corps rectangle blanc et ceinture.
  roundedRect(ctx, -8, -22, 16, 18, 3);
  fillStroke(ctx, BODY);
  ctx.fillStyle = model.belt;
  ctx.fillRect(-8, -11, 16, 3.2);
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 0.8;
  ctx.strokeRect(-8, -11, 16, 3.2);

  drawBodyAccessory(ctx, model.accessory);

  // Tête ovale, penchée.
  ctx.save();
  ctx.translate(1, -31);
  ctx.rotate(-0.22);
  ellipse(ctx, 0, 0, 9.5, 8.2);
  fillStroke(ctx, BODY);
  ellipse(ctx, 1.2, 0.2, 2.1, 3.3);
  ctx.fillStyle = '#111';
  ctx.fill();
  ellipse(ctx, 6.2, 0.2, 2.1, 3.3);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ellipse(ctx, 1.8, -1.2, 0.7, 0.9);
  ctx.fill();
  ellipse(ctx, 6.8, -1.2, 0.7, 0.9);
  ctx.fill();
  drawHeadAccessory(ctx, model.accessory);
  ctx.restore();

  ctx.restore();
}

function drawBodyAccessory(ctx: CanvasRenderingContext2D, accessory: JimeeModel['accessory']): void {
  switch (accessory) {
    case 'bolt': // boulon tenu devant lui
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        ctx.lineTo(11 + Math.cos(a) * 3, -15 + Math.sin(a) * 3);
      }
      ctx.closePath();
      fillStroke(ctx, '#9aa3b2', 0.8);
      break;
    case 'cross': // croix de soin
      ctx.fillStyle = '#e4572e';
      ctx.fillRect(-1.5, -20, 3, 7);
      ctx.fillRect(-3.5, -18, 7, 3);
      break;
    case 'plate': // plastron
      roundedRect(ctx, -6.5, -21, 13, 9, 2);
      fillStroke(ctx, '#8c96a6', 0.8);
      break;
    case 'badge': // badge de stagiaire épinglé
      ctx.fillStyle = '#fff';
      ctx.fillRect(-6, -20, 7, 5);
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 0.7;
      ctx.strokeRect(-6, -20, 7, 5);
      ctx.fillStyle = '#3fa7d6';
      ctx.fillRect(-5, -19, 5, 1.2);
      break;
    case 'shield': // grand bouclier tenu devant lui
      ctx.beginPath();
      ctx.moveTo(8, -24);
      ctx.lineTo(17, -21);
      ctx.lineTo(17, -11);
      ctx.quadraticCurveTo(17, -3, 12.5, -1);
      ctx.quadraticCurveTo(8, -3, 8, -11);
      ctx.closePath();
      fillStroke(ctx, '#5d6b7a', 1);
      ctx.fillStyle = '#c9cede';
      ctx.fillRect(11.5, -19, 2, 12);
      break;
    case 'satchel': // sacoche de boulons en bandoulière
      ctx.strokeStyle = '#6b4226';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-6, -22);
      ctx.lineTo(6, -9);
      ctx.stroke();
      roundedRect(ctx, 3, -11, 8, 7, 1.5);
      fillStroke(ctx, '#8b5a2b', 0.8);
      break;
    case 'wrench': // clé à molette
      ctx.save();
      ctx.translate(12, -14);
      ctx.rotate(-0.6);
      ctx.fillStyle = '#9aa3b2';
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 0.8;
      ctx.fillRect(-1.2, -1, 2.4, 11);
      ctx.strokeRect(-1.2, -1, 2.4, 11);
      ellipse(ctx, 0, -2.5, 3.4, 3.4);
      fillStroke(ctx, '#9aa3b2', 0.8);
      ctx.fillStyle = '#f4f1e8';
      ctx.fillRect(-1, -6.5, 2, 4);
      ctx.restore();
      break;
    case 'hourglass': // sablier accroché à la ceinture
      ctx.beginPath();
      ctx.moveTo(4, -12);
      ctx.lineTo(10, -12);
      ctx.lineTo(7, -7.5);
      ctx.lineTo(10, -3);
      ctx.lineTo(4, -3);
      ctx.lineTo(7, -7.5);
      ctx.closePath();
      fillStroke(ctx, '#b2ebf2', 0.8);
      ctx.fillStyle = '#e8b923';
      ctx.fillRect(5.5, -5, 3, 1.6);
      break;
    case 'megaphone': // porte-voix
      ctx.beginPath();
      ctx.moveTo(8, -18);
      ctx.lineTo(19, -23);
      ctx.lineTo(19, -10);
      ctx.lineTo(8, -14);
      ctx.closePath();
      fillStroke(ctx, '#d4a017', 1);
      ctx.fillStyle = OUTLINE;
      ctx.fillRect(9, -14, 2, 5);
      break;
    default:
      break;
  }
}

function drawHeadAccessory(ctx: CanvasRenderingContext2D, accessory: JimeeModel['accessory']): void {
  switch (accessory) {
    case 'helmet': // casque de chantier
      ctx.beginPath();
      ctx.ellipse(0, -3, 10, 7, 0, Math.PI, 0);
      ctx.closePath();
      fillStroke(ctx, '#7d5ba6', 0.9);
      break;
    case 'fuse': // mèche allumée
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-2, -8);
      ctx.quadraticCurveTo(-4, -13, -1, -15);
      ctx.stroke();
      ellipse(ctx, -1, -16, 2, 2);
      ctx.fillStyle = '#ffcc00';
      ctx.fill();
      break;
    case 'antenna': // antenne de prototype
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(0, -15);
      ctx.stroke();
      ellipse(ctx, 0, -16.5, 2.4, 2.4);
      fillStroke(ctx, '#ffcc00', 0.8);
      break;
    default:
      break;
  }
}
