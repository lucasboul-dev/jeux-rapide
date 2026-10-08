import { describe, it, expect } from 'vitest';
import { createRng, pick } from '../../src/economy/rng';

describe('hasard reproductible', () => {
  it('même graine, même suite', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('graines différentes, suites différentes', () => {
    expect(createRng(1)()).not.toBe(createRng(2)());
  });

  it('valeurs dans [0,1[', () => {
    const r = createRng(1);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('pick choisit selon le tirage', () => {
    expect(pick(() => 0, ['a', 'b', 'c'])).toBe('a');
    expect(pick(() => 0.99, ['a', 'b', 'c'])).toBe('c');
  });
});
