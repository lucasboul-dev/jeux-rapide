import { describe, it, expect } from 'vitest';
import { upgradeRows, render } from '../../src/screens/rocket';
import { newSave } from '../../src/save/save';
import { testContext } from './context';

describe('fusée', () => {
  it('niveau 10 : MAX, sans coût', () => {
    const row = upgradeRows({
      ...newSave(),
      credits: 9999,
      rocket: { chargeRate: 10, chargeMax: 1, turret: 1, cannon: 1 },
    }).find((r) => r.key === 'chargeRate')!;
    expect(row).toMatchObject({ cost: null, affordable: false, next: null, level: 10 });
  });

  it('amélioration non abordable', () => {
    expect(upgradeRows({ ...newSave(), credits: 79 }).every((r) => !r.affordable)).toBe(true);
  });

  it('valeur actuelle et suivante', () => {
    const row = upgradeRows(newSave()).find((r) => r.key === 'chargeMax')!;
    expect(row).toMatchObject({ level: 1, cost: 80, current: 10, next: 12 });
  });

  it('libellés français', () => {
    expect(upgradeRows(newSave()).map((r) => r.label)).toEqual([
      'Vitesse de chargement',
      'Capacité de chargement',
      'Tourelle',
      'Canon',
    ]);
  });

  it('acheter une amélioration débite et monte le niveau', () => {
    const root = document.createElement('div');
    const ctx = testContext({ ...newSave(), credits: 100 });
    render(root, ctx);
    root.querySelector<HTMLButtonElement>('[data-upgrade="turret"]')!.click();
    expect(ctx.save.credits).toBe(20);
    expect(ctx.save.rocket.turret).toBe(2);
  });

  it('niveau max affiché « MAX » et bouton désactivé', () => {
    const root = document.createElement('div');
    render(root, testContext({ ...newSave(), credits: 9999, rocket: { chargeRate: 1, chargeMax: 1, turret: 1, cannon: 10 } }));
    const b = root.querySelector<HTMLButtonElement>('[data-upgrade="cannon"]')!;
    expect(b.disabled).toBe(true);
    expect(b.textContent).toContain('MAX');
  });
});
