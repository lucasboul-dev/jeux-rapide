import { describe, it, expect } from 'vitest';
import { unitBars } from '../../src/battle/render';
import { createBattle, spawnJimee, dealDamage } from '../../src/battle/sim';
import { jimeeById } from '../../src/data/jimees';
import { setup } from './helpers';

describe('barres au-dessus des unités', () => {
  it('le Blindé arrive avec une vie pleine et un bouclier plein', () => {
    const s = createBattle(setup());
    const b = spawnJimee(s, { model: jimeeById('blinde'), level: 1 });
    expect(unitBars(b)).toEqual([
      { kind: 'hp', ratio: 1 },
      { kind: 'shield', ratio: 1 },
    ]);
  });

  it('le bouclier se vide avant la vie', () => {
    const s = createBattle(setup());
    const b = spawnJimee(s, { model: jimeeById('blinde'), level: 1 });
    dealDamage(s, b, b.maxShield / 2);
    expect(unitBars(b)).toEqual([
      { kind: 'hp', ratio: 1 },
      { kind: 'shield', ratio: 0.5 },
    ]);
  });

  it('un Jimee sans bouclier en pleine forme n’a pas de barre', () => {
    const s = createBattle(setup());
    const u = spawnJimee(s, { model: jimeeById('standard'), level: 1 });
    expect(unitBars(u)).toEqual([]);
    dealDamage(s, u, u.maxHp / 4);
    expect(unitBars(u)).toEqual([{ kind: 'hp', ratio: 0.75 }]);
  });
});
