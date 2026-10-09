import type { JimeeModel } from '../data/types';
import { IDLE_POSE, walkPose, type ArcherPose, type WalkPose } from './poses';
import { roundedRect } from './shapes';

/**
 * Style de la planche de chara-design : encre noire et blanc, contour épais.
 * La ceinture est la seule touche de couleur (elle distingue les modèles).
 */
export const INK = '#15151c';
export const PAPER = '#fbfaf5';
const LINE = 2;

export interface JimeeDrawOptions {
  /** 1 = regarde à droite, -1 = à gauche. */
  facing: 1 | -1;
  /** Phase du cycle de marche en radians. */
  walkPhase: number;
  scale: number;
  /** En marche (cycle animé) ou au repos. Par défaut : en marche si walkPhase ≠ 0. */
  walking?: boolean;
  /** Étape de la séquence de tir (Archer uniquement). */
  archer?: ArcherPose;
}

type Model = Pick<JimeeModel, 'belt' | 'accessory'>;

function ink(ctx: CanvasRenderingContext2D, fill: string = PAPER, width = LINE): void {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK;
  ctx.stroke();
}

function oval(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rotation = 0): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
}

/** Trait encré « épais » : contour noir avec un cœur blanc (bras, sangles). */
function limb(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.4;
  ctx.stroke();
  ctx.strokeStyle = PAPER;
  ctx.lineWidth = 1.6;
  ctx.stroke();
}

/**
 * Un Jimee : grosse tête ovale penchée vers l'avant, grands yeux noirs en amande,
 * long corps arrondi, pieds ovales, ceinture de couleur.
 * (x, y) = point au sol, au centre des pieds. Hauteur ≈ 50 unités.
 */
export function drawJimee(ctx: CanvasRenderingContext2D, x: number, y: number, model: Model, opts: JimeeDrawOptions): void {
  const walking = opts.walking ?? opts.walkPhase !== 0;
  const pose: WalkPose = walking ? walkPose(opts.walkPhase) : IDLE_POSE;
  const archer = model.accessory === 'bow' ? (opts.archer ?? 'nock') : undefined;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(opts.facing * opts.scale, opts.scale);

  drawBackAccessory(ctx, model.accessory, pose.bob);

  // Pied arrière, puis pied avant.
  oval(ctx, pose.back.x, -2.4 - pose.back.lift, 4.4, 2.4);
  ink(ctx, model.accessory === 'sneakers' ? INK : PAPER);
  oval(ctx, pose.front.x, -2.4 - pose.front.lift, 4.4, 2.4);
  ink(ctx, model.accessory === 'sneakers' ? INK : PAPER);

  ctx.save();
  ctx.translate(0, -pose.bob);

  // Corps : long rectangle arrondi.
  roundedRect(ctx, -6.5, -26, 13, 23, 5.5);
  ink(ctx);
  // Ceinture de couleur.
  ctx.save();
  roundedRect(ctx, -6.5, -26, 13, 23, 5.5);
  ctx.clip();
  ctx.fillStyle = model.belt;
  ctx.fillRect(-7, -12, 14, 3);
  ctx.restore();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-6.5, -12);
  ctx.lineTo(6.5, -12);
  ctx.moveTo(-6.5, -9);
  ctx.lineTo(6.5, -9);
  ctx.stroke();

  drawBodyAccessory(ctx, model.accessory);

  // Bras : visibles en marche (balancement), ou pour tenir un objet.
  if (archer) drawBow(ctx, archer);
  else if (holdsSomething(model.accessory)) limb(ctx, 2, -21, 7, -16);
  else if (walking) limb(ctx, 5, -22, 6 + pose.arm * 3.5, -13.5);

  drawHead(ctx, model.accessory);
  ctx.restore();
  ctx.restore();
}

function holdsSomething(accessory: Model['accessory']): boolean {
  return accessory === 'dynamite' || accessory === 'wrench' || accessory === 'megaphone' || accessory === 'shield';
}

/** Tête ovale penchée vers l'avant, grands yeux noirs en amande. */
function drawHead(ctx: CanvasRenderingContext2D, accessory: Model['accessory']): void {
  ctx.save();
  ctx.translate(3.5, -37);
  ctx.rotate(0.42);
  oval(ctx, 0, 0, 10.5, 13);
  ink(ctx, PAPER, 2.2);
  ctx.fillStyle = INK;
  oval(ctx, 0.2, 2.2, 3.3, 5.6, -0.12);
  ctx.fill();
  oval(ctx, 6.6, 1.8, 2.9, 5.2, 0.05);
  ctx.fill();
  drawHeadAccessory(ctx, accessory);
  ctx.restore();
}

/** Objets portés sur le dos, dessinés derrière le corps. */
function drawBackAccessory(ctx: CanvasRenderingContext2D, accessory: Model['accessory'], bob: number): void {
  ctx.save();
  ctx.translate(0, -bob);
  if (accessory === 'bow') {
    // Carquois en bandoulière, flèches qui dépassent.
    ctx.save();
    ctx.translate(-8, -20);
    ctx.rotate(-0.35);
    roundedRect(ctx, -2.8, -8, 5.6, 15, 1.8);
    ink(ctx, PAPER, 1.6);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.2;
    for (const dx of [-1.4, 0.4, 2]) {
      ctx.beginPath();
      ctx.moveTo(dx, -8);
      ctx.lineTo(dx, -12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dx - 1, -11);
      ctx.lineTo(dx, -13);
      ctx.lineTo(dx + 1, -11);
      ctx.stroke();
    }
    ctx.restore();
  } else if (accessory === 'dynamite') {
    // Sac à dos de bâtons de dynamite liés, avec mèche.
    for (const [i, dx] of [-12.5, -9.5, -6.5].entries()) {
      roundedRect(ctx, dx - 1.6, -25 + (i === 1 ? -1 : 0), 3.2, 15, 1.2);
      ink(ctx, PAPER, 1.5);
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-14.2, -19);
    ctx.lineTo(-4.8, -19);
    ctx.moveTo(-14.2, -14);
    ctx.lineTo(-4.8, -14);
    ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-9.5, -26);
    ctx.quadraticCurveTo(-12, -31, -9, -32.5);
    ctx.stroke();
  }
  ctx.restore();
}

/** L'arc, selon l'étape de la séquence de tir. */
function drawBow(ctx: CanvasRenderingContext2D, pose: ArcherPose): void {
  ctx.strokeStyle = INK;
  if (pose === 'nock' || pose === 'renock') {
    // Arc tenu bas, en diagonale, flèche encochée.
    limb(ctx, 1.5, -21, 7, -14);
    ctx.save();
    ctx.translate(8, -14);
    ctx.rotate(0.6);
    bowShape(ctx, 0);
    if (pose === 'nock') arrow(ctx, -1, 0, 10);
    ctx.restore();
    if (pose === 'renock') limb(ctx, -1, -21, -6, -26);
    return;
  }
  // Bras tendu vers l'avant, arc vertical.
  const pull = pose === 'draw' ? 5 : pose === 'hold' ? 7 : 0;
  limb(ctx, 2, -21, 11, -20);
  ctx.save();
  ctx.translate(12, -20);
  bowShape(ctx, pull);
  if (pose !== 'recoil') arrow(ctx, -pull, 0, 14);
  ctx.restore();
  if (pose !== 'recoil') limb(ctx, 1, -20, 12 - pull, -20);
  else limb(ctx, 0, -21, -3, -16);
}

/** Arc compact recourbé ; `pull` = corde tirée vers l'arrière. */
function bowShape(ctx: CanvasRenderingContext2D, pull: number): void {
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-1, -10);
  ctx.quadraticCurveTo(5, -8, 2.5, 0);
  ctx.quadraticCurveTo(5, 8, -1, 10);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-1, -10);
  ctx.lineTo(-1 - pull, 0);
  ctx.lineTo(-1, 10);
  ctx.stroke();
}

function arrow(ctx: CanvasRenderingContext2D, x: number, y: number, length: number): void {
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + length, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + length + 2.6, y);
  ctx.lineTo(x + length - 0.5, y - 1.8);
  ctx.lineTo(x + length - 0.5, y + 1.8);
  ctx.closePath();
  ctx.fill();
}

function drawBodyAccessory(ctx: CanvasRenderingContext2D, accessory: Model['accessory']): void {
  ctx.strokeStyle = INK;
  switch (accessory) {
    case 'dynamite': {
      // Bretelle du sac et détonateur tenu à la main.
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-5, -25);
      ctx.lineTo(1, -13);
      ctx.stroke();
      roundedRect(ctx, 6.5, -17, 6, 5, 1);
      ink(ctx, PAPER, 1.5);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(9.5, -17);
      ctx.lineTo(9.5, -20.5);
      ctx.moveTo(7.5, -20.5);
      ctx.lineTo(11.5, -20.5);
      ctx.stroke();
      break;
    }
    case 'cross':
      ctx.beginPath();
      ctx.moveTo(-1.6, -22);
      ctx.lineTo(1.6, -22);
      ctx.lineTo(1.6, -19.6);
      ctx.lineTo(4, -19.6);
      ctx.lineTo(4, -16.4);
      ctx.lineTo(1.6, -16.4);
      ctx.lineTo(1.6, -14);
      ctx.lineTo(-1.6, -14);
      ctx.lineTo(-1.6, -16.4);
      ctx.lineTo(-4, -16.4);
      ctx.lineTo(-4, -19.6);
      ctx.lineTo(-1.6, -19.6);
      ctx.closePath();
      ink(ctx, INK, 1);
      break;
    case 'plate':
      roundedRect(ctx, -5, -23, 10, 9, 2);
      ink(ctx, PAPER, 1.6);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-5, -18.5);
      ctx.lineTo(5, -18.5);
      ctx.stroke();
      break;
    case 'badge':
      ctx.lineWidth = 1;
      ctx.strokeRect(-4.5, -22, 6, 4.5);
      ctx.beginPath();
      ctx.moveTo(-3.5, -20.5);
      ctx.lineTo(0.5, -20.5);
      ctx.moveTo(-3.5, -19);
      ctx.lineTo(-0.5, -19);
      ctx.stroke();
      break;
    case 'shield':
      ctx.beginPath();
      ctx.moveTo(8, -26);
      ctx.lineTo(17, -23);
      ctx.lineTo(17, -12);
      ctx.quadraticCurveTo(17, -4, 12.5, -2);
      ctx.quadraticCurveTo(8, -4, 8, -12);
      ctx.closePath();
      ink(ctx);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(12.5, -22);
      ctx.lineTo(12.5, -5);
      ctx.moveTo(9.5, -15);
      ctx.lineTo(15.5, -15);
      ctx.stroke();
      break;
    case 'satchel':
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-5, -25);
      ctx.lineTo(5, -10);
      ctx.stroke();
      roundedRect(ctx, 3, -12, 8, 7, 1.5);
      ink(ctx, PAPER, 1.5);
      oval(ctx, 7, -8.5, 1.6, 1.6);
      ink(ctx, INK, 0.8);
      break;
    case 'wrench':
      ctx.save();
      ctx.translate(9, -16);
      ctx.rotate(-0.5);
      roundedRect(ctx, -1.2, -2, 2.4, 12, 1);
      ink(ctx, PAPER, 1.4);
      oval(ctx, 0, -3.5, 3.4, 3.4);
      ink(ctx, PAPER, 1.4);
      ctx.fillStyle = PAPER;
      ctx.fillRect(-1, -8, 2, 4.5);
      ctx.restore();
      break;
    case 'hourglass':
      ctx.beginPath();
      ctx.moveTo(4, -13);
      ctx.lineTo(10, -13);
      ctx.lineTo(7, -8.5);
      ctx.lineTo(10, -4);
      ctx.lineTo(4, -4);
      ctx.lineTo(7, -8.5);
      ctx.closePath();
      ink(ctx, PAPER, 1.3);
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.moveTo(5.5, -5);
      ctx.lineTo(8.5, -5);
      ctx.lineTo(7, -7);
      ctx.closePath();
      ctx.fill();
      break;
    case 'megaphone':
      ctx.beginPath();
      ctx.moveTo(7, -19);
      ctx.lineTo(18, -24);
      ctx.lineTo(18, -10);
      ctx.lineTo(7, -15);
      ctx.closePath();
      ink(ctx);
      ctx.lineWidth = 1;
      for (const r of [3, 5.5]) {
        ctx.beginPath();
        ctx.arc(18, -17, r, -0.6, 0.6);
        ctx.stroke();
      }
      break;
    default:
      break;
  }
}

/** Accessoires de tête (dans le repère penché de la tête). */
function drawHeadAccessory(ctx: CanvasRenderingContext2D, accessory: Model['accessory']): void {
  ctx.strokeStyle = INK;
  switch (accessory) {
    case 'helmet':
      ctx.beginPath();
      ctx.ellipse(0, -5, 11.5, 9.5, 0, Math.PI, 0);
      ctx.lineTo(13, -5);
      ctx.lineTo(-13, -5);
      ctx.closePath();
      ink(ctx, PAPER, 2);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -14.5);
      ctx.lineTo(0, -5);
      ctx.stroke();
      break;
    case 'antenna':
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-2, -12.5);
      ctx.lineTo(-3, -20);
      ctx.stroke();
      oval(ctx, -3, -21.8, 2.4, 2.4);
      ink(ctx, INK, 1);
      break;
    default:
      break;
  }
}
