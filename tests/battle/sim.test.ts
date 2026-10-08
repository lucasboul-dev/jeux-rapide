import { describe, it, expect } from 'vitest';
import { createBattle, sendJimee, spawnEnemy, advanceBattle, abandonBattle, stepBattle } from '../../src/battle/sim';
import { ROCKET_X, ENEMY_BASE_X, FIXED_DT, type BattleState } from '../../src/battle/types';
import { ENEMIES } from '../../src/data/enemies';
import { jimeeById } from '../../src/data/jimees';
import { setup, testPlanet, advanceSeconds } from './helpers';

/** Envoie le Jimee de l'emplacement donné en remplissant la jauge juste ce qu'il faut. */
function forceSend(s: BattleState, slot: number) {
  s.charge = s.setup.team[slot]!.model.cost;
  expect(sendJimee(s, slot)).toBe(true);
  return s.units[s.units.length - 1];
}

function snapshot(s: BattleState) {
  return JSON.stringify({ units: s.units, rocket: s.rocketHp, base: s.enemyBaseHp, stats: s.stats });
}

describe('chargement et envoi', () => {
  it('le chargement monte et plafonne', () => {
    const s = createBattle(setup());
    advanceSeconds(s, 20);
    expect(s.charge).toBe(10);
  });

  it('envoi refusé si chargement insuffisant', () => {
    const s = createBattle(setup());
    expect(sendJimee(s, 0)).toBe(false);
    expect(s.units).toHaveLength(0);
  });

  it('taps répétés : un seul envoi, jauge jamais négative', () => {
    const s = createBattle(setup());
    s.charge = jimeeById('standard').cost;
    expect([sendJimee(s, 0), sendJimee(s, 0), sendJimee(s, 0)]).toEqual([true, false, false]);
    expect(s.charge).toBe(0);
  });

  it('emplacement vide : refus', () => {
    const s = createBattle(setup({ team: [null, null, null, null] }));
    s.charge = 10;
    expect(sendJimee(s, 0)).toBe(false);
  });

  it('un Jimee apparaît devant la fusée avec ses statistiques de niveau', () => {
    const s = createBattle(setup({ team: [{ model: jimeeById('standard'), level: 10 }, null, null, null] }));
    const u = forceSend(s, 0);
    expect(u.x).toBe(ROCKET_X + 20);
    expect(u.maxHp).toBeCloseTo(jimeeById('standard').profile.hp * 1.9);
  });
});

describe('combat', () => {
  it("un Jimee avance puis s'arrête à portée d'un ennemi", () => {
    const s = createBattle(setup());
    const blob = spawnEnemy(s, 'blob', 500);
    blob.speed = 0;
    blob.hp = blob.maxHp = 10_000;
    const j = forceSend(s, 0);
    advanceSeconds(s, 12);
    expect(j.x).toBeGreaterThan(500 - j.range - 1);
    expect(j.x).toBeLessThanOrEqual(500 - j.range + 0.01);
  });

  it('corps à corps : un coup au contact, puis un coup par attackInterval', () => {
    const s = createBattle(setup());
    const blob = spawnEnemy(s, 'blob', 315);
    blob.speed = 0;
    blob.damage = 0;
    blob.hp = blob.maxHp = 10_000;
    const j = forceSend(s, 0);
    j.x = 300;
    stepBattle(s, FIXED_DT);
    expect(blob.hp).toBeCloseTo(10_000 - j.damage);
    advanceSeconds(s, j.attackInterval + 0.05);
    expect(blob.hp).toBeCloseTo(10_000 - 2 * j.damage);
  });

  it("tir à distance : dégâts à l'arrivée du projectile", () => {
    const s = createBattle(setup());
    const blob = spawnEnemy(s, 'blob', 400);
    blob.speed = 0;
    blob.damage = 0;
    blob.hp = blob.maxHp = 10_000;
    const j = forceSend(s, 1);
    j.x = 300;
    advanceSeconds(s, 0.3);
    expect(blob.hp).toBe(10_000);
    advanceSeconds(s, 0.2);
    expect(blob.hp).toBeCloseTo(10_000 - j.damage);
  });

  it("mort d'un ennemi : kills et crédits", () => {
    const s = createBattle(setup());
    const blob = spawnEnemy(s, 'blob', 315);
    blob.hp = 1;
    blob.speed = 0;
    forceSend(s, 0).x = 300;
    advanceSeconds(s, 0.1);
    expect(s.stats.kills).toBe(1);
    expect(s.stats.enemyCredits).toBe(ENEMIES.blob.reward);
    expect(s.units.some((u) => u.side === 'enemy')).toBe(false);
  });

  it("mort d'un Jimee : jimeesLost", () => {
    const s = createBattle(setup());
    const j = forceSend(s, 0);
    j.x = 300;
    j.hp = 1;
    j.damage = 0;
    const shell = spawnEnemy(s, 'carapace', 310);
    shell.speed = 0;
    advanceSeconds(s, 0.1);
    expect(s.stats.jimeesLost).toBe(1);
  });
});

describe('fin de partie', () => {
  it('victoire quand la base ennemie tombe', () => {
    const s = createBattle(setup());
    s.enemyBaseHp = 1;
    forceSend(s, 0).x = ENEMY_BASE_X - 15;
    advanceSeconds(s, 1);
    expect(s.outcome).toBe('won');
  });

  it('défaite quand la fusée tombe', () => {
    const s = createBattle(setup());
    s.rocketHp = 1;
    spawnEnemy(s, 'blob', ROCKET_X + 10);
    advanceSeconds(s, 1);
    expect(s.outcome).toBe('lost');
  });

  it('abandon → défaite', () => {
    const s = createBattle(setup());
    abandonBattle(s);
    expect(s.outcome).toBe('lost');
  });

  it('rien ne bouge après la fin', () => {
    const s = createBattle(setup());
    s.enemyBaseHp = 1;
    forceSend(s, 0).x = ENEMY_BASE_X - 15;
    spawnEnemy(s, 'blob', 700);
    advanceSeconds(s, 1);
    expect(s.outcome).toBe('won');
    const before = snapshot(s);
    advanceSeconds(s, 5);
    expect(snapshot(s)).toBe(before);
    s.charge = 10;
    expect(sendJimee(s, 0)).toBe(false);
  });
});

describe('vagues', () => {
  it('les vagues utilisent statMultiplier sur la vie et les dégâts', () => {
    const s = createBattle(setup({ planet: testPlanet({ waveSize: 1, statMultiplier: 2 }) }));
    advanceSeconds(s, 3.1);
    const enemies = s.units.filter((u) => u.side === 'enemy');
    expect(enemies).toHaveLength(1);
    expect(enemies[0].maxHp).toBe(2 * ENEMIES.blob.stats.hp);
    expect(enemies[0].damage).toBe(2 * ENEMIES.blob.stats.damage);
    expect(enemies[0].speed).toBe(ENEMIES.blob.stats.speed);
  });

  it('une vague de 3 ennemis arrive espacée', () => {
    const s = createBattle(setup({ planet: testPlanet({ waveSize: 3 }) }));
    advanceSeconds(s, 3.1);
    expect(s.units.filter((u) => u.side === 'enemy')).toHaveLength(1);
    advanceSeconds(s, 1.2);
    expect(s.units.filter((u) => u.side === 'enemy')).toHaveLength(3);
  });

  it('le boss apparaît une seule fois après 20 s', () => {
    const s = createBattle(setup({ planet: testPlanet({ bossId: 'boss_regional' }) }));
    const bosses = () => s.units.filter((u) => u.isBoss).length;
    advanceSeconds(s, 19.9);
    expect(bosses()).toBe(0);
    advanceSeconds(s, 0.2);
    expect(bosses()).toBe(1);
    advanceSeconds(s, 40);
    expect(bosses()).toBe(1);
  });
});

describe('boucle', () => {
  it('même graine → même bataille', () => {
    const run = () => {
      const s = createBattle(setup({ planet: testPlanet({ waveSize: 3, waveInterval: 5, enemyPool: ['blob', 'cracheur', 'carapace'] }) }));
      for (let t = 0; t < 6; t++) {
        advanceSeconds(s, 5);
        sendJimee(s, t % 2);
      }
      return snapshot(s);
    };
    expect(run()).toBe(run());
  });

  it('advanceBattle plafonne un énorme écart de temps', () => {
    const s = createBattle(setup());
    advanceBattle(s, 10);
    expect(s.time).toBeCloseTo(0.25, 2);
  });

  it('advanceBattle avance au pas fixe', () => {
    const s = createBattle(setup());
    for (let i = 0; i < 60; i++) advanceBattle(s, 1 / 60);
    expect(s.time).toBeCloseTo(1, 1);
  });
});
