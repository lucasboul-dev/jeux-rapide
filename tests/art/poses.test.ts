import { describe, it, expect } from 'vitest';
import { walkPose, archerPose, explosionFrame, EXPLOSION_FRAMES } from '../../src/art/poses';

describe('cycle de marche', () => {
  it('contact : les deux pieds au sol, écartés', () => {
    const p = walkPose(0);
    expect(p.front.lift).toBe(0);
    expect(p.back.lift).toBe(0);
    expect(p.front.x).toBeGreaterThan(3);
    expect(p.back.x).toBeLessThan(-3);
  });

  it('passage : un pied levé au milieu, le corps au plus haut', () => {
    const p = walkPose(Math.PI / 2);
    expect(p.front.lift).toBeGreaterThan(2);
    expect(Math.abs(p.front.x)).toBeLessThan(0.5);
    expect(p.back.lift).toBe(0);
    expect(p.bob).toBeGreaterThan(walkPose(0).bob);
  });

  it('jamais les deux pieds en l’air en même temps', () => {
    for (let i = 0; i < 200; i++) {
      const p = walkPose((i / 200) * Math.PI * 4);
      expect(Math.min(p.front.lift, p.back.lift)).toBe(0);
    }
  });

  it('le bras se balance à l’opposé du pied avant', () => {
    expect(Math.sign(walkPose(0).arm)).toBe(-Math.sign(walkPose(0).front.x));
  });
});

describe('séquence de tir de l’Archer', () => {
  it('en marche : flèche encochée, arc baissé', () => {
    expect(archerPose(0, 1.4, false)).toBe('nock');
  });

  it('juste après le tir : recul, puis réencochage', () => {
    expect(archerPose(1.35, 1.4, true)).toBe('recoil');
    expect(archerPose(1.2, 1.4, true)).toBe('renock');
  });

  it('avant le tir suivant : bander, puis viser', () => {
    expect(archerPose(0.7, 1.4, true)).toBe('nock');
    expect(archerPose(0.3, 1.4, true)).toBe('draw');
    expect(archerPose(0.05, 1.4, true)).toBe('hold');
  });
});

describe('explosion', () => {
  it('8 images puis une fumée résiduelle', () => {
    expect(EXPLOSION_FRAMES).toBe(9);
    expect(explosionFrame(0, 0.6)).toBe(0);
    expect(explosionFrame(0.599, 0.6)).toBe(8);
    expect(explosionFrame(0.3, 0.6)).toBe(4);
  });

  it('terminée après sa durée', () => {
    expect(explosionFrame(0.6, 0.6)).toBeNull();
  });
});
