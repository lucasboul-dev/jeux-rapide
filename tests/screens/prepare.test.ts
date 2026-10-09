import { describe, it, expect } from 'vitest';
import { teamSetup, render } from '../../src/screens/prepare';
import { newSave } from '../../src/save/save';
import { testContext } from './context';

describe('préparation', () => {
  it('équipe vide → pas de bataille', () => {
    expect(teamSetup({ ...newSave(), team: [null, null, null, null] }, 1, 1)).toBeNull();
  });

  it("l'équipe porte les niveaux de la collection", () => {
    const s = teamSetup({ ...newSave(), collection: { standard: 4, lanceur: 1 } }, 1, 1)!;
    expect(s.team[0]).toMatchObject({ model: { id: 'standard' }, level: 4 });
    expect(s.team[2]).toBeNull();
    expect(s.planet.id).toBe(1);
  });

  it('le bouton Décoller est désactivé quand l’équipe est vide', () => {
    const root = document.createElement('div');
    const ctx = testContext({ ...newSave(), team: [null, null, null, null] });
    render(root, ctx, { planetId: 1 });
    expect(root.querySelector<HTMLButtonElement>('.launch')!.disabled).toBe(true);
  });

  it('taper un modèle ouvre sa fiche sans changer l’équipe', () => {
    const root = document.createElement('div');
    const ctx = testContext({ ...newSave(), team: [null, 'lanceur', null, null] });
    render(root, ctx, { planetId: 1 });
    root.querySelector<HTMLButtonElement>('[data-model="standard"]')!.click();
    expect(root.querySelector('.jimee-sheet')!.textContent).toContain('Vie');
    expect(ctx.save.team).toEqual([null, 'lanceur', null, null]);
  });

  it('« Mettre dans l’équipe » place le modèle dans le premier emplacement libre', () => {
    const root = document.createElement('div');
    const ctx = testContext({ ...newSave(), team: [null, 'lanceur', null, null] });
    render(root, ctx, { planetId: 1 });
    root.querySelector<HTMLButtonElement>('[data-model="standard"]')!.click();
    root.querySelector<HTMLButtonElement>('.sheet-action')!.click();
    expect(ctx.save.team).toEqual(['standard', 'lanceur', null, null]);
    expect(root.querySelector('.jimee-sheet')).toBeNull();
  });

  it('un modèle déjà dans l’équipe peut en être retiré depuis sa fiche', () => {
    const root = document.createElement('div');
    const ctx = testContext();
    render(root, ctx, { planetId: 1 });
    root.querySelector<HTMLButtonElement>('[data-model="lanceur"]')!.click();
    const action = root.querySelector<HTMLButtonElement>('.sheet-action')!;
    expect(action.textContent).toBe('Retirer de l’équipe');
    action.click();
    expect(ctx.save.team).toEqual(['standard', null, null, null]);
  });

  it('équipe complète : le bouton d’ajout est désactivé', () => {
    const root = document.createElement('div');
    const ctx = testContext({
      ...newSave(),
      collection: { standard: 1, lanceur: 1, stagiaire: 1, bouclier: 1, costaud: 1 },
      team: ['standard', 'lanceur', 'stagiaire', 'bouclier'],
    });
    render(root, ctx, { planetId: 1 });
    root.querySelector<HTMLButtonElement>('[data-model="costaud"]')!.click();
    const action = root.querySelector<HTMLButtonElement>('.sheet-action')!;
    expect(action.disabled).toBe(true);
    expect(action.textContent).toBe('Équipe complète');
  });

  it('taper un emplacement le vide', () => {
    const root = document.createElement('div');
    const ctx = testContext();
    render(root, ctx, { planetId: 1 });
    root.querySelector<HTMLButtonElement>('[data-team-slot="0"]')!.click();
    expect(ctx.save.team).toEqual([null, 'lanceur', null, null]);
  });
});

describe('légendaire trop cher pour la fusée', () => {
  it('la collection signale qu’il faut améliorer la capacité', () => {
    const root = document.createElement('div');
    const ctx = testContext({ ...newSave(), collection: { standard: 1, lanceur: 1, blinde: 1 } });
    render(root, ctx, { planetId: 1 });
    expect(root.querySelector('[data-model="blinde"]')!.textContent).toContain('Capacité insuffisante');
    expect(root.querySelector('[data-model="standard"]')!.textContent).not.toContain('Capacité insuffisante');
  });
});

import { unitStats } from '../../src/economy/power';
import { jimeeById } from '../../src/data/jimees';
import { abilityTag } from '../../src/screens/jimeeSheet';

describe('statistiques visibles dans la liste', () => {
  const save = () => ({ ...newSave(), collection: { standard: 3, lanceur: 1, costaud: 2, mecano: 1 } });

  it('chaque Jimee affiche vie, dégâts/s, portée et vitesse sans ouvrir sa fiche', () => {
    const root = document.createElement('div');
    render(root, testContext(save()), { planetId: 1 });
    const item = root.querySelector('[data-model="costaud"]')!;
    const s = unitStats(jimeeById('costaud'), 2);
    expect(item.querySelector('.stat-hp .stat-value')!.textContent).toBe(String(Math.round(s.hp)));
    expect(item.querySelector('.stat-dps .stat-value')!.textContent).toBe((s.damage / s.attackInterval).toLocaleString('fr-FR', { maximumFractionDigits: 1 }));
    expect(item.querySelector('.stat-range .stat-value')!.textContent).toBe('Mêlée');
    expect(root.querySelector('[data-model="lanceur"] .stat-range .stat-value')!.textContent).toBe('140');
    expect(root.querySelector('.jimee-sheet')).toBeNull();
  });

  it('les barres sont proportionnelles au meilleur Jimee de la liste', () => {
    const root = document.createElement('div');
    render(root, testContext(save()), { planetId: 1 });
    const width = (id: string) => (root.querySelector(`[data-model="${id}"] .stat-hp .stat-bar-fill`) as HTMLElement).style.width;
    expect(width('costaud')).toBe('100%');
    expect(parseFloat(width('standard'))).toBeLessThan(100);
  });

  it('la capacité spéciale apparaît en étiquette', () => {
    const root = document.createElement('div');
    render(root, testContext(save()), { planetId: 1 });
    expect(root.querySelector('[data-model="mecano"] .ability-tag')!.textContent).toBe(abilityTag(jimeeById('mecano')));
    expect(root.querySelector('[data-model="standard"] .ability-tag')).toBeNull();
  });

  it('on peut trier par dégâts/s', () => {
    const root = document.createElement('div');
    render(root, testContext(save()), { planetId: 1 });
    root.querySelector<HTMLButtonElement>('[data-sort="dps"]')!.click();
    const ids = [...root.querySelectorAll<HTMLElement>('.collection [data-model]')].map((e) => e.dataset.model!);
    const dps = (id: string) => {
      const s = unitStats(jimeeById(id), save().collection[id as keyof ReturnType<typeof save>['collection']]);
      return s.damage / s.attackInterval;
    };
    expect(ids.map(dps)).toEqual([...ids.map(dps)].sort((a, b) => b - a));
    expect(root.querySelector('[data-sort="dps"]')!.classList.contains('selected')).toBe(true);
  });
});
