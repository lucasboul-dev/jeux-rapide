import { describe, it, expect } from 'vitest';
import { createBattle, spawnEnemy, spawnJimee, stepBattle, fireCannon, dealDamage } from '../../src/battle/sim';
import { ROCKET_X, FIXED_DT, type BattleState, type Unit } from '../../src/battle/types';
import { jimeeById } from '../../src/data/jimees';
import { setup, advanceSeconds } from './helpers';

/** Ennemi immobile, inoffensif et très résistant, pour mesurer les dégâts reçus. */
function dummy(s: BattleState, x: number): Unit {
  const e = spawnEnemy(s, 'blob', x);
  e.speed = 0;
  e.damage = 0;
  e.hp = e.maxHp = 10_000;
  return e;
}

function jimee(s: BattleState, id: string, x: number): Unit {
  const u = spawnJimee(s, { model: jimeeById(id), level: 1 });
  u.x = x;
  return u;
}

describe('capacités', () => {
  it('le bouclier du Blindé absorbe avant les pv', () => {
    const s = createBattle(setup());
    const b = jimee(s, 'blinde', 300);
    expect(b.shield).toBeCloseTo(b.maxHp);
    dealDamage(s, b, 50);
    expect(b.hp).toBeCloseTo(b.maxHp);
    expect(b.shield).toBeCloseTo(b.maxHp - 50);
  });

  it('un coup plus fort que le bouclier entame les pv du reste', () => {
    const s = createBattle(setup());
    const b = jimee(s, 'blinde', 300);
    b.shield = 20;
    dealDamage(s, b, 50);
    expect(b.shield).toBe(0);
    expect(b.hp).toBeCloseTo(b.maxHp - 30);
  });

  it('le Kamikaze explose à sa mort', () => {
    const s = createBattle(setup());
    const k = jimee(s, 'kamikaze', 300);
    const near1 = dummy(s, 320);
    const near2 = dummy(s, 350);
    const far = dummy(s, 450);
    k.hp = 0;
    stepBattle(s, FIXED_DT);
    const blast = 6 * k.damage;
    expect(near1.hp).toBeCloseTo(10_000 - blast);
    expect(near2.hp).toBeCloseTo(10_000 - blast);
    expect(far.hp).toBe(10_000);
    expect(s.events.some((e) => e.kind === 'explosion')).toBe(true);
  });

  it("l'Infirmier soigne les Jimees proches sans dépasser le max", () => {
    const s = createBattle(setup());
    const nurse = jimee(s, 'infirmier', 200);
    nurse.speed = 0;
    const hurt = jimee(s, 'standard', 250);
    hurt.speed = 0;
    hurt.hp = hurt.maxHp - 30;
    const almost = jimee(s, 'standard', 260);
    almost.speed = 0;
    almost.hp = almost.maxHp - 1;
    const heal = 0.15 * nurse.maxHp;
    advanceSeconds(s, 1.9);
    expect(hurt.hp).toBeCloseTo(hurt.maxHp - 30);
    advanceSeconds(s, 0.2);
    expect(hurt.hp).toBeCloseTo(hurt.maxHp - 30 + heal);
    expect(almost.hp).toBeCloseTo(almost.maxHp);
  });

  it('le Prototype touche une zone', () => {
    const s = createBattle(setup());
    const p = jimee(s, 'prototype', 300);
    p.speed = 0;
    const a = dummy(s, 420);
    const b = dummy(s, 440);
    const out = dummy(s, 520);
    advanceSeconds(s, 0.5);
    expect(a.hp).toBeCloseTo(10_000 - p.damage);
    expect(b.hp).toBeCloseTo(10_000 - p.damage);
    expect(out.hp).toBe(10_000);
  });
});

describe('tourelle', () => {
  it('tire sur un ennemi proche', () => {
    const s = createBattle(setup());
    const e = dummy(s, ROCKET_X + 100);
    advanceSeconds(s, 0.05);
    expect(e.hp).toBeCloseTo(10_000 - s.setup.rocket.turretDamage);
    advanceSeconds(s, s.setup.rocket.turretInterval);
    expect(e.hp).toBeCloseTo(10_000 - 2 * s.setup.rocket.turretDamage);
  });

  it('ignore un ennemi hors de portée', () => {
    const s = createBattle(setup());
    const e = dummy(s, ROCKET_X + 300);
    advanceSeconds(s, 2);
    expect(e.hp).toBe(10_000);
  });
});

describe('canon', () => {
  it('frappe une zone, se recharge, refuse pendant la recharge', () => {
    const s = createBattle(setup());
    const a = dummy(s, 600);
    const b = dummy(s, 640);
    const out = dummy(s, 800);
    const dmg = s.setup.rocket.cannonDamage;
    expect(fireCannon(s, 610)).toBe(true);
    expect(a.hp).toBeCloseTo(10_000 - dmg);
    expect(b.hp).toBeCloseTo(10_000 - dmg);
    expect(out.hp).toBe(10_000);
    expect(fireCannon(s, 610)).toBe(false);
    advanceSeconds(s, 29.9);
    expect(fireCannon(s, 610)).toBe(false);
    advanceSeconds(s, 0.2);
    expect(fireCannon(s, 610)).toBe(true);
  });

  it('refusé une fois la partie terminée', () => {
    const s = createBattle(setup());
    s.outcome = 'won';
    expect(fireCannon(s, 600)).toBe(false);
  });
});
