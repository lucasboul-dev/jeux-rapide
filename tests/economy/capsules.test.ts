import { describe, it, expect } from 'vitest';
import { rarityOdds, drawCapsule, applyDraw, purchaseDraw } from '../../src/economy/capsules';
import { createRng } from '../../src/economy/rng';
import { jimeeById } from '../../src/data/jimees';
import type { Rarity } from '../../src/data/types';

const w = { credits: 0, crystals: 0, collection: { standard: 1 } as Record<string, number> };

describe('probabilités', () => {
  it.each([
    [0, { common: 60, rare: 28, epic: 10, legendary: 2 }],
    [1, { common: 48, rare: 34, epic: 14, legendary: 4 }],
    [2, { common: 36, rare: 40, epic: 18, legendary: 6 }],
    [3, { common: 24, rare: 46, epic: 22, legendary: 8 }],
  ])('probabilités avec %i cristaux', (c, odds) => {
    expect(rarityOdds(c)).toEqual(odds);
  });

  it('refuse 4 cristaux et les valeurs négatives', () => {
    expect(() => rarityOdds(4)).toThrow();
    expect(() => rarityOdds(-1)).toThrow();
  });
});

describe('tirage', () => {
  it('répartition conforme sur 100 000 tirages (graine fixe)', () => {
    const rng = createRng(7);
    const n = 100_000;
    const count: Record<Rarity, number> = { common: 0, rare: 0, epic: 0, legendary: 0 };
    for (let i = 0; i < n; i++) count[drawCapsule(rng, 0).rarity]++;
    expect(count.common / n).toBeCloseTo(0.6, 2);
    expect(count.rare / n).toBeCloseTo(0.28, 2);
    expect(count.legendary / n).toBeCloseTo(0.02, 2);
  });

  it('le modèle tiré a la rareté tirée', () => {
    const rng = createRng(3);
    for (let i = 0; i < 500; i++) {
      const d = drawCapsule(rng, 3);
      expect(jimeeById(d.modelId).rarity).toBe(d.rarity);
    }
  });
});

describe('fusion', () => {
  it('nouveau modèle → niveau 1', () => {
    expect(applyDraw(w, 'costaud')).toMatchObject({
      outcome: { kind: 'new', modelId: 'costaud' },
      wallet: { collection: { costaud: 1 } },
    });
  });

  it('doublon → +1 niveau', () => {
    expect(applyDraw(w, 'standard').outcome).toEqual({ kind: 'levelUp', modelId: 'standard', level: 2 });
  });

  it('doublon au niveau 10 → 25 crédits, le modèle reste au niveau 10', () => {
    const r = applyDraw({ ...w, collection: { standard: 10 } }, 'standard');
    expect(r.outcome).toEqual({ kind: 'buyback', modelId: 'standard', credits: 25 });
    expect(r.wallet.collection.standard).toBe(10);
    expect(r.wallet.credits).toBe(25);
  });

  it("applyDraw ne modifie pas l'entrée", () => {
    const before = structuredClone(w);
    applyDraw(w, 'standard');
    expect(w).toEqual(before);
  });
});

describe('achat', () => {
  it('refusé si crédits insuffisants', () => {
    expect(purchaseDraw({ ...w, credits: 99 }, 0, createRng(1))).toBeNull();
  });

  it('refusé si cristaux insuffisants', () => {
    expect(purchaseDraw({ ...w, credits: 500, crystals: 1 }, 2, createRng(1))).toBeNull();
  });

  it('refusé avec plus de 3 cristaux', () => {
    expect(purchaseDraw({ ...w, credits: 500, crystals: 9 }, 4, createRng(1))).toBeNull();
  });

  it('débite 100 crédits et les cristaux', () => {
    const r = purchaseDraw({ ...w, credits: 150, crystals: 2 }, 2, createRng(1))!;
    expect(r.wallet.crystals).toBe(0);
    expect(r.wallet.credits).toBe(r.outcome.kind === 'buyback' ? 75 : 50);
  });

  it('garde les autres champs de la sauvegarde', () => {
    const r = purchaseDraw({ ...w, credits: 100, extra: 'x' }, 0, createRng(1))!;
    expect(r.wallet.extra).toBe('x');
  });
});
