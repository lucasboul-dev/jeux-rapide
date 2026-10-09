import { describe, it, expect } from 'vitest';
import { JIMEES, jimeeById } from '../../src/data/jimees';
import { ENEMIES } from '../../src/data/enemies';
import { PLANETS } from '../../src/data/planets';
import { CORP_LINES } from '../../src/data/corpLines';

describe('contenu', () => {
  it('14 modèles : 4 communs, 4 rares, 3 épiques, 3 légendaires, ids uniques', () => {
    expect(JIMEES).toHaveLength(14);
    const count = (r: string) => JIMEES.filter((j) => j.rarity === r).length;
    expect([count('common'), count('rare'), count('epic'), count('legendary')]).toEqual([4, 4, 3, 3]);
    expect(new Set(JIMEES.map((j) => j.id)).size).toBe(14);
  });

  it('les nouveaux modèles ont la rareté et le rôle prévus', () => {
    expect(jimeeById('stagiaire')).toMatchObject({ rarity: 'common', cost: 1 });
    expect(jimeeById('bouclier').rarity).toBe('common');
    expect(jimeeById('grenadier')).toMatchObject({ rarity: 'rare', ranged: true, ability: { kind: 'splash' } });
    expect(jimeeById('mecano')).toMatchObject({ rarity: 'rare', ability: { kind: 'repairRocket' } });
    expect(jimeeById('ralentisseur')).toMatchObject({ rarity: 'epic', ranged: true, ability: { kind: 'slow' } });
    expect(jimeeById('contremaitre')).toMatchObject({ rarity: 'legendary', ability: { kind: 'aura' } });
  });

  it('chaque modèle a un accessoire et une ceinture qui lui sont propres', () => {
    expect(new Set(JIMEES.map((j) => j.belt)).size).toBe(JIMEES.length);
    const withAccessory = JIMEES.filter((j) => j.accessory !== 'none');
    expect(new Set(withAccessory.map((j) => j.accessory)).size).toBe(withAccessory.length);
  });

  it('les modèles de départ sont standard et lanceur, communs', () => {
    expect(['standard', 'lanceur'].map((id) => jimeeById(id).rarity)).toEqual(['common', 'common']);
  });

  it('jimeeById lève une erreur sur un id inconnu', () => {
    expect(() => jimeeById('inconnu')).toThrow();
  });

  it('les capacités sont celles de la spec', () => {
    expect(jimeeById('kamikaze').ability?.kind).toBe('explodeOnDeath');
    expect(jimeeById('infirmier').ability?.kind).toBe('heal');
    expect(jimeeById('blinde').ability?.kind).toBe('shield');
    expect(jimeeById('prototype').ability?.kind).toBe('splash');
  });

  it('10 planètes numérotées 1 à 10, boss sur 5 et 10 uniquement', () => {
    expect(PLANETS.map((p) => p.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(PLANETS.filter((p) => p.bossId).map((p) => p.id)).toEqual([5, 10]);
  });

  it("Jimmy's Inc. seulement sur les planètes boss", () => {
    for (const p of PLANETS) expect(p.enemyPool.includes('employe')).toBe(p.id === 5 || p.id === 10);
  });

  it('chaque ennemi référencé existe', () => {
    for (const p of PLANETS) {
      for (const id of [...p.enemyPool, ...(p.bossId ? [p.bossId] : [])]) expect(ENEMIES[id]).toBeDefined();
    }
  });

  it('au moins 5 répliques par situation, sans chiffre', () => {
    for (const list of Object.values(CORP_LINES)) {
      expect(list.length).toBeGreaterThanOrEqual(5);
      for (const line of list) expect(line).not.toMatch(/\d/);
    }
  });
});
