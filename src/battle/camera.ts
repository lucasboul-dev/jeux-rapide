import { WORLD_WIDTH } from './types';

/** Délai (s) après un glisser avant que la caméra reprenne le suivi automatique. */
export const FOLLOW_RESUME_DELAY = 3;

export interface Camera {
  /** Bord gauche visible, en unités du terrain. */
  x: number;
  /** Largeur visible, en unités du terrain. */
  viewWidth: number;
  lastDragAt: number;
}

export function createCamera(viewWidth: number): Camera {
  return { x: 0, viewWidth, lastDragAt: -Infinity };
}

function clamp(cam: Camera): void {
  cam.x = Math.min(Math.max(cam.x, 0), Math.max(0, WORLD_WIDTH - cam.viewWidth));
}

/** Suit en douceur le Jimee le plus avancé (placé aux deux tiers de l'écran), sauf juste après un glisser. */
export function followCamera(cam: Camera, frontX: number, now: number): void {
  if (now - cam.lastDragAt < FOLLOW_RESUME_DELAY) return;
  const target = frontX - cam.viewWidth * 0.66;
  cam.x += (target - cam.x) * 0.08;
  clamp(cam);
}

/** Décale la vue au doigt (dx en unités du terrain). */
export function dragCamera(cam: Camera, dx: number, now: number): void {
  cam.x += dx;
  cam.lastDragAt = now;
  clamp(cam);
}

export function screenToWorld(cam: Camera, screenX: number, scale: number): number {
  return cam.x + screenX / scale;
}
