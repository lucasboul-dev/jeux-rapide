import { describe, it, expect } from 'vitest';
import { battleCredits, rollCrystal, applyBattleResult } from '../../src/economy/progress';

const base = { credits: 0, crystals: 0, collection: {} as Record<string, number> };

describe('gains de bataille', () => {
  it('victoire en première conquête', () => {
    expect(battleCredits({ outcome: 'won', planetId: 3, enemyCredits: 40, firstConquest: true })).toBe(190);
  });

  it('victoire en farm ×0,4', () => {
    expect(battleCredits({ outcome: 'won', planetId: 3, enemyCredits: 40, firstConquest: false })).toBe(76);
  });

  it('défaite : crédits des ennemis seulement', () => {
    expect(battleCredits({ outcome: 'lost', planetId: 3, enemyCredits: 40, firstConquest: true })).toBe(40);
  });

  it('défaite en farm', () => {
    expect(battleCredits({ outcome: 'lost', planetId: 3, enemyCredits: 40, firstConquest: false })).toBe(16);
  });

  it('cristal : seuil 0,1', () => {
    expect(rollCrystal(() => 0.09)).toBe(true);
    expect(rollCrystal(() => 0.1)).toBe(false);
  });
});

describe('conquête', () => {
  it('victoire débloque la planète suivante', () => {
    const s = applyBattleResult(
      { ...base, highestUnlocked: 3, conquered: [1, 2] },
      { outcome: 'won', planetId: 3, credits: 190, crystal: true },
    );
    expect(s).toMatchObject({ credits: 190, crystals: 1, highestUnlocked: 4, conquered: [1, 2, 3] });
  });

  it('rejouer une planète conquise ne la duplique pas', () => {
    const s = applyBattleResult(
      { ...base, highestUnlocked: 4, conquered: [1, 2, 3] },
      { outcome: 'won', planetId: 2, credits: 50, crystal: false },
    );
    expect(s).toMatchObject({ highestUnlocked: 4, conquered: [1, 2, 3] });
  });

  it('la planète 10 ne débloque pas de 11e', () => {
    const s = applyBattleResult(
      { ...base, highestUnlocked: 10, conquered: [] },
      { outcome: 'won', planetId: 10, credits: 0, crystal: false },
    );
    expect(s.highestUnlocked).toBe(10);
  });

  it('défaite ne débloque rien', () => {
    const s = applyBattleResult(
      { ...base, highestUnlocked: 3, conquered: [1, 2] },
      { outcome: 'lost', planetId: 3, credits: 40, crystal: false },
    );
    expect(s).toMatchObject({ highestUnlocked: 3, conquered: [1, 2], credits: 40 });
  });
});
