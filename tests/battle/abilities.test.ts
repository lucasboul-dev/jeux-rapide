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
    const factor = (jimeeById('blinde').ability as { amountFactor: number }).amountFactor;
    expect(b.shield).toBeCloseTo(factor * b.maxHp);
    dealDamage(s, b, 50);
    expect(b.hp).toBeCloseTo(b.maxHp);
    expect(b.shield).toBeCloseTo(factor * b.maxHp - 50);
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
    const blast = (jimeeById('kamikaze').ability as { damageFactor: number }).damageFactor * k.damage;
    expect(near1.hp).toBeCloseTo(10_000 - blast);
    expect(near2.hp).toBeCloseTo(10_000 - blast);
    expect(far.hp).toBe(10_000);
    expect(s.events.some((e) => e.kind === 'explosion')).toBe(true);
  });

  it("l'Infirmier soigne les Jimees proches sans dépasser le max", () => {
    const s = createBattle(setup());
    const nurse = jimee(s, 'infirmier', 200);
    nurse.speed = 0;
    const heal = (jimeeById('infirmier').ability as { amountFactor: number }).amountFactor * nurse.maxHp;
    const hurt = jimee(s, 'costaud', 250);
    hurt.speed = 0;
    hurt.hp = hurt.maxHp - heal - 10;
    const almost = jimee(s, 'standard', 260);
    almost.speed = 0;
    almost.hp = almost.maxHp - 1;
    advanceSeconds(s, 1.9);
    expect(hurt.hp).toBeCloseTo(hurt.maxHp - heal - 10);
    advanceSeconds(s, 0.2);
    expect(hurt.hp).toBeCloseTo(hurt.maxHp - 10);
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

describe('capacités des nouveaux modèles', () => {
  it('le Mécano répare la fusée régulièrement, sans dépasser le maximum', () => {
    const s = createBattle(setup());
    const m = jimee(s, 'mecano', 200);
    m.speed = 0;
    s.rocketHp = s.setup.rocket.hp - 100;
    const ability = jimeeById('mecano').ability as { amountFactor: number; interval: number };
    const repair = ability.amountFactor * m.maxHp;
    advanceSeconds(s, ability.interval - 0.1);
    expect(s.rocketHp).toBeCloseTo(s.setup.rocket.hp - 100);
    advanceSeconds(s, 0.2);
    expect(s.rocketHp).toBeCloseTo(Math.min(s.setup.rocket.hp, s.setup.rocket.hp - 100 + repair));
    advanceSeconds(s, 60);
    expect(s.rocketHp).toBe(s.setup.rocket.hp);
  });

  it('le Ralentisseur ralentit les ennemis touchés, puis l’effet s’arrête', () => {
    const s = createBattle(setup());
    const r = jimee(s, 'ralentisseur', 300);
    r.speed = 0;
    r.damage = 0;
    const e = spawnEnemy(s, 'blob', 400);
    e.hp = e.maxHp = 10_000;
    e.damage = 0;
    const ability = jimeeById('ralentisseur').ability as { factor: number; duration: number };
    advanceSeconds(s, 0.45);
    expect(e.slowTimer).toBeGreaterThan(0);
    const x0 = e.x;
    advanceSeconds(s, 0.1);
    expect(x0 - e.x).toBeCloseTo(e.speed * ability.factor * 0.1, 1);
    r.hp = 0;
    advanceSeconds(s, ability.duration + 0.2);
    const x1 = e.x;
    advanceSeconds(s, 0.1);
    expect(x1 - e.x).toBeCloseTo(e.speed * 0.1, 1);
  });

  it('le Contremaître augmente les dégâts des Jimees proches, pas des lointains', () => {
    const s = createBattle(setup());
    const boss = jimee(s, 'contremaitre', 300);
    boss.speed = 0;
    boss.damage = 0;
    const near = jimee(s, 'standard', 320);
    near.speed = 0;
    const far = jimee(s, 'standard', 700);
    far.speed = 0;
    const a = dummy(s, 335);
    const b = dummy(s, 715);
    const bonus = (jimeeById('contremaitre').ability as { damageBonus: number }).damageBonus;
    stepBattle(s, FIXED_DT);
    expect(10_000 - a.hp).toBeCloseTo(near.damage * (1 + bonus));
    expect(10_000 - b.hp).toBeCloseTo(far.damage);
  });

  it('le Contremaître se renforce aussi lui-même', () => {
    const s = createBattle(setup());
    const boss = jimee(s, 'contremaitre', 300);
    boss.speed = 0;
    const a = dummy(s, 318);
    const bonus = (jimeeById('contremaitre').ability as { damageBonus: number }).damageBonus;
    stepBattle(s, FIXED_DT);
    expect(10_000 - a.hp).toBeCloseTo(boss.damage * (1 + bonus));
  });
});
