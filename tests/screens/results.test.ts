import { describe, it, expect } from 'vitest';
import { settleBattle } from '../../src/screens/results';
import { newSave } from '../../src/save/save';

describe('bilan', () => {
  it('première conquête : gains complets et planète suivante débloquée', () => {
    const r = settleBattle(newSave(), { outcome: 'won', planetId: 1, enemyCredits: 30, jimeesLost: 2 }, () => 0.5);
    expect(r).toMatchObject({
      credits: 80,
      crystal: false,
      firstConquest: true,
      save: { highestUnlocked: 2, conquered: [1], credits: 80 },
    });
  });

  it('farm : gains réduits', () => {
    const r = settleBattle(
      { ...newSave(), conquered: [1], highestUnlocked: 2 },
      { outcome: 'won', planetId: 1, enemyCredits: 30, jimeesLost: 0 },
      () => 0.5,
    );
    expect(r.credits).toBe(32);
    expect(r.firstConquest).toBe(false);
  });

  it('victoire chanceuse : un cristal', () => {
    const r = settleBattle(newSave(), { outcome: 'won', planetId: 1, enemyCredits: 0, jimeesLost: 0 }, () => 0);
    expect(r.crystal).toBe(true);
    expect(r.save.crystals).toBe(1);
  });

  it('défaite : pas de cristal même avec un tirage chanceux', () => {
    const r = settleBattle(newSave(), { outcome: 'lost', planetId: 1, enemyCredits: 10, jimeesLost: 5 }, () => 0);
    expect(r.crystal).toBe(false);
    expect(r.credits).toBe(10);
  });
});
