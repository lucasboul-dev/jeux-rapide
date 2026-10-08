import { describe, it, expect } from 'vitest';
import { renderScale, TARGET_VIEW_WIDTH } from '../../src/battle/render';
import { WORLD_WIDTH } from '../../src/battle/types';

describe('échelle du rendu', () => {
  it('un téléphone en portrait voit environ un tiers du terrain', () => {
    const width = 390;
    const height = 439; // 52 % d'un écran de 844 px
    const visible = width / renderScale(width, height);
    expect(visible).toBeCloseTo(TARGET_VIEW_WIDTH, 0);
    expect(WORLD_WIDTH / visible).toBeGreaterThan(2.5);
    expect(WORLD_WIDTH / visible).toBeLessThan(3.5);
  });

  it('sur un écran très large, la hauteur limite l’échelle', () => {
    const scale = renderScale(2000, 260);
    expect(scale).toBeCloseTo(1);
  });
});
