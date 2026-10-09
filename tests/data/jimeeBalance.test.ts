import { describe, it, expect } from 'vitest';
import { JIMEES, jimeeById } from '../../src/data/jimees';
import { ECONOMY } from '../../src/data/economy';
import { unitStats } from '../../src/economy/power';
import type { JimeeModel, Rarity } from '../../src/data/types';
import { ENEMIES } from '../../src/data/enemies';
import { planetById } from '../../src/data/planets';

/**
 * Force de combat par point de chargement, au niveau 1 :
 * (vie par point) × (dégâts/s par point). Le bouclier compte comme de la vie.
 */
function scorePerPoint(m: JimeeModel): number {
  const s = unitStats(m, 1);
  const shield = m.ability?.kind === 'shield' ? m.ability.amountFactor * s.hp : 0;
  // Un tir de zone touche en moyenne plusieurs ennemis : environ 1 + rayon / 40.
  const targets = m.ability?.kind === 'splash' ? 1 + m.ability.radius / 40 : 1;
  return ((s.hp + shield) / m.cost) * ((s.damage * targets) / s.attackInterval / m.cost);
}

const SUPPORTS = ['mecano', 'infirmier', 'ralentisseur'];
const fighters = JIMEES.filter((m) => !SUPPORTS.includes(m.id));
const mean = (r: Rarity) => {
  const list = fighters.filter((m) => m.rarity === r).map(scorePerPoint);
  return list.reduce((a, b) => a + b, 0) / list.length;
};

describe('équilibre des Jimees', () => {
  it('la rentabilité moyenne augmente avec la rareté', () => {
    expect(mean('rare')).toBeGreaterThan(mean('common') * 1.1);
    expect(mean('epic')).toBeGreaterThan(mean('rare'));
    expect(mean('legendary')).toBeGreaterThan(mean('epic') * 1.1);
  });

  it('aucun commun ni rare ne rivalise avec le plus faible des légendaires', () => {
    const weakestLegendary = Math.min(...fighters.filter((m) => m.rarity === 'legendary').map(scorePerPoint));
    for (const m of fighters.filter((x) => x.rarity === 'common' || x.rarity === 'rare')) {
      expect(scorePerPoint(m), m.name).toBeLessThan(weakestLegendary);
    }
  });

  it('le Stagiaire est le moins rentable : c’est de la chair à canon', () => {
    const stagiaire = scorePerPoint(jimeeById('stagiaire'));
    for (const m of fighters.filter((x) => x.id !== 'stagiaire')) expect(scorePerPoint(m), m.name).toBeGreaterThan(stagiaire);
  });

  it('un légendaire coûte plus que la jauge de départ : il faut améliorer la fusée', () => {
    for (const m of JIMEES.filter((x) => x.rarity === 'legendary')) {
      expect(m.cost, m.name).toBeGreaterThan(ECONOMY.rocket.chargeMax);
    }
    for (const m of JIMEES.filter((x) => x.rarity !== 'legendary')) {
      expect(m.cost, m.name).toBeLessThanOrEqual(ECONOMY.rocket.chargeMax);
    }
  });

  it('aucun Jimee de niveau 1 ne tue d’un seul coup un ennemi de base de la planète 5', () => {
    const p5 = planetById(5);
    const weakest = Math.min(...['blob', 'cracheur'].map((id) => ENEMIES[id].stats.hp * p5.statMultiplier));
    for (const m of JIMEES) {
      expect(unitStats(m, 1).damage, m.name).toBeLessThan(weakest * 0.75);
    }
  });
});
