/** Poses d'animation des Jimees, calculées à partir de l'état du jeu (sans dessin). */

export interface FootPose {
  /** Décalage horizontal par rapport au centre (vers l'avant > 0). */
  x: number;
  /** Hauteur du pied au-dessus du sol. */
  lift: number;
}

export interface WalkPose {
  front: FootPose;
  back: FootPose;
  /** Hauteur du corps (au plus haut au passage, au plus bas au contact). */
  bob: number;
  /** Balancement du bras, opposé au pied avant. */
  arm: number;
}

const STRIDE = 5;
const LIFT = 3;
const BOB = 1.5;

/**
 * Cycle de marche continu : phase 0 = contact (pieds écartés au sol),
 * π/2 = passage (pied avant levé au milieu), π = contact inversé, etc.
 */
export function walkPose(phase: number): WalkPose {
  const c = Math.cos(phase);
  const s = Math.sin(phase);
  return {
    front: { x: STRIDE * c, lift: Math.max(0, s) * LIFT },
    back: { x: -STRIDE * c, lift: Math.max(0, -s) * LIFT },
    bob: Math.abs(s) * BOB,
    arm: -c,
  };
}

export const IDLE_POSE: WalkPose = {
  front: { x: 3.5, lift: 0 },
  back: { x: -3.5, lift: 0 },
  bob: 0,
  arm: 0,
};

export type ArcherPose = 'nock' | 'draw' | 'hold' | 'recoil' | 'renock';

/**
 * Étape de la séquence de tir de l'Archer, d'après le temps de recharge restant :
 * recul juste après le tir, réencochage, attente flèche encochée, puis bander et viser.
 */
export function archerPose(cooldown: number, attackInterval: number, engaged: boolean): ArcherPose {
  if (!engaged) return 'nock';
  const sinceShot = attackInterval - cooldown;
  if (sinceShot < 0.12) return 'recoil';
  if (sinceShot < 0.35) return 'renock';
  if (cooldown > 0.4) return 'nock';
  if (cooldown > 0.12) return 'draw';
  return 'hold';
}

/** 8 images d'explosion, puis la fumée résiduelle. */
export const EXPLOSION_FRAMES = 9;

/** Image d'explosion à afficher (0 à 8), ou `null` une fois terminée. */
export function explosionFrame(age: number, duration: number): number | null {
  if (age < 0 || age >= duration) return null;
  return Math.min(EXPLOSION_FRAMES - 1, Math.floor((age / duration) * EXPLOSION_FRAMES));
}
