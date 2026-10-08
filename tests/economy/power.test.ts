import { describe, it, expect } from 'vitest';
import { modelPower, unitStats } from '../../src/economy/power';
import { jimeeById } from '../../src/data/jimees';
import type { Rarity } from '../../src/data/types';

describe('courbe de puissance', () => {
  it.each([
    ['common', 1, 100], ['common', 2, 110], ['common', 10, 190],
    ['rare', 1, 125], ['rare', 2, 144], ['rare', 10, 294],
    ['epic', 1, 150], ['epic', 2, 183], ['epic', 10, 447],
    ['legendary', 1, 180], ['legendary', 2, 243], ['legendary', 10, 747],
  ])('puissance %s niveau %i = %i', (r, lvl, p) => {
    expect(Math.round(modelPower(r as Rarity, lvl))).toBe(p);
  });

  it('commun 10 > légendaire 1, légendaire 2 > commun 10', () => {
    expect(modelPower('common', 10)).toBeGreaterThan(modelPower('legendary', 1));
    expect(modelPower('legendary', 2)).toBeGreaterThan(modelPower('common', 10));
  });

  it('unitStats ne change que vie et dégâts', () => {
    const m = jimeeById('standard');
    const s = unitStats(m, 10);
    expect(s.hp).toBeCloseTo(m.profile.hp * 1.9);
    expect(s.damage).toBeCloseTo(m.profile.damage * 1.9);
    expect(s.speed).toBe(m.profile.speed);
    expect(s.range).toBe(m.profile.range);
    expect(s.attackInterval).toBe(m.profile.attackInterval);
  });
});
