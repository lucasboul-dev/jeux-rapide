import { describe, it, expect } from 'vitest';
import { createCamera, dragCamera, followCamera, screenToWorld } from '../../src/battle/camera';

describe('caméra', () => {
  it('borne à gauche et à droite', () => {
    const c = createCamera(400);
    dragCamera(c, -999, 0);
    expect(c.x).toBe(0);
    dragCamera(c, 9999, 0);
    expect(c.x).toBe(800);
  });

  it('pas de suivi moins de 3 s après un glisser', () => {
    const c = createCamera(400);
    dragCamera(c, 100, 10);
    const x = c.x;
    followCamera(c, 900, 12.9);
    expect(c.x).toBe(x);
  });

  it('reprend le suivi après 3 s', () => {
    const c = createCamera(400);
    dragCamera(c, 100, 10);
    const x = c.x;
    followCamera(c, 900, 13);
    expect(c.x).toBeGreaterThan(x);
  });

  it('le suivi reste borné au terrain', () => {
    const c = createCamera(400);
    for (let i = 0; i < 500; i++) followCamera(c, 5000, 100 + i);
    expect(c.x).toBe(800);
  });

  it('screenToWorld tient compte du décalage et de l’échelle', () => {
    const c = createCamera(400);
    c.x = 200;
    expect(screenToWorld(c, 100, 1)).toBe(300);
    expect(screenToWorld(c, 100, 2)).toBe(250);
  });
});
