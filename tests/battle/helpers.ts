import type { Planet } from '../../src/data/types';
import { jimeeById } from '../../src/data/jimees';
import { rocketStats } from '../../src/economy/rocket';
import { FIXED_DT, type BattleSetup, type BattleState } from '../../src/battle/types';
import { stepBattle } from '../../src/battle/sim';

/** Planète de test : aucune vague par défaut (waveSize 0), pour contrôler chaque apparition. */
export function testPlanet(over: Partial<Planet> = {}): Planet {
  return {
    id: 1,
    name: 'Banc d’essai',
    biome: 'test',
    palette: { sky: '#fff', ground: '#888', accent: '#444', creature: '#0a0' },
    baseHp: 400,
    enemyPool: ['blob'],
    waveInterval: 9999,
    waveSize: 0,
    statMultiplier: 1,
    ...over,
  };
}

export function setup(over: Partial<BattleSetup> = {}): BattleSetup {
  return {
    planet: testPlanet(),
    team: [
      { model: jimeeById('standard'), level: 1 },
      { model: jimeeById('lanceur'), level: 1 },
      null,
      null,
    ],
    rocket: rocketStats({ chargeRate: 1, chargeMax: 1, turret: 1, cannon: 1 }),
    seed: 1,
    ...over,
  };
}

export function advanceSeconds(state: BattleState, seconds: number): void {
  const steps = Math.round(seconds / FIXED_DT);
  for (let i = 0; i < steps; i++) stepBattle(state, FIXED_DT);
}
