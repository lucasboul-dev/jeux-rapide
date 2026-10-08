import { describe, it, expect } from 'vitest';
import { upgradeCost, rocketStats, buyUpgrade } from '../../src/economy/rocket';

const levels1 = { chargeRate: 1, chargeMax: 1, turret: 1, cannon: 1 };
const wallet = { crystals: 0, collection: {} as Record<string, number> };

describe('améliorations de la fusée', () => {
  it.each([[1, 80], [2, 120], [3, 180], [4, 270], [5, 410], [9, 2050], [10, null]])(
    'coût du niveau %i',
    (l, c) => {
      expect(upgradeCost(l)).toBe(c);
    },
  );

  it('statistiques de la fusée', () => {
    const s = rocketStats({ chargeRate: 3, chargeMax: 2, turret: 1, cannon: 5 });
    expect(s.hp).toBe(600);
    expect(s.chargeRate).toBeCloseTo(1.3);
    expect(s.chargeMax).toBe(12);
    expect(s.turretDamage).toBe(12);
    expect(s.cannonDamage).toBeCloseTo(128);
    expect(s.cannonCooldown).toBe(24);
  });

  it('achat refusé au niveau max', () => {
    expect(buyUpgrade({ ...wallet, credits: 9999, rocket: { ...levels1, chargeRate: 10 } }, 'chargeRate')).toBeNull();
  });

  it('achat refusé sans crédits', () => {
    expect(buyUpgrade({ ...wallet, credits: 79, rocket: levels1 }, 'turret')).toBeNull();
  });

  it('achat débite et monte le niveau', () => {
    expect(buyUpgrade({ ...wallet, credits: 100, rocket: levels1 }, 'turret')).toMatchObject({
      credits: 20,
      rocket: { turret: 2 },
    });
  });
});
