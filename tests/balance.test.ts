import { describe, it, expect } from 'vitest';
import { createBattle, fireCannon, sendJimee, stepBattle } from '../src/battle/sim';
import { FIXED_DT } from '../src/battle/types';
import { jimeeById } from '../src/data/jimees';
import { planetById } from '../src/data/planets';
import { rocketStats } from '../src/economy/rocket';

const MAX_SECONDS = 300;
const SEEDS = [1, 2, 3, 4, 5, 6];

/**
 * Joueur automatique simple : une équipe de communs (Standard + Lanceur) au niveau donné,
 * fusée au même niveau ; il envoie dès que possible en alternant, et tire le canon sur l'ennemi le plus avancé.
 */
function play(planetId: number, level: number, seed: number): 'won' | 'lost' {
  const lvl = Math.min(level, 10);
  const s = createBattle({
    planet: planetById(planetId),
    team: [{ model: jimeeById('standard'), level: lvl }, { model: jimeeById('lanceur'), level: lvl }, null, null],
    rocket: rocketStats({ chargeRate: lvl, chargeMax: lvl, turret: lvl, cannon: lvl }),
    seed,
  });
  let next = 0;
  const steps = MAX_SECONDS / FIXED_DT;
  for (let i = 0; i < steps && s.outcome === 'running'; i++) {
    if (sendJimee(s, next)) next = 1 - next;
    if (s.cannonCooldown === 0) {
      const front = s.units.filter((u) => u.side === 'enemy').sort((a, b) => a.x - b.x)[0];
      if (front) fireCannon(s, front.x);
    }
    stepBattle(s, FIXED_DT);
  }
  return s.outcome === 'won' ? 'won' : 'lost';
}

function winRate(planetId: number, level: number): number {
  return SEEDS.filter((seed) => play(planetId, level, seed) === 'won').length / SEEDS.length;
}

describe('courbe de difficulté (spec §5 : 5 et 10 sont les murs)', () => {
  it.each([6, 7, 8, 9])('à niveau 5, la planète %i se gagne la plupart du temps', (p) => {
    expect(winRate(p, 5)).toBeGreaterThanOrEqual(0.6);
  }, 30_000);

  it('la planète 5 reste un mur à niveau 3', () => {
    expect(winRate(5, 3)).toBeLessThanOrEqual(0.4);
  }, 30_000);

  it('la planète 10 reste un mur à niveau 5', () => {
    expect(winRate(10, 5)).toBeLessThanOrEqual(0.4);
  }, 30_000);
});
