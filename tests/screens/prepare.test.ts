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

  it('taper un modèle le place dans le premier emplacement libre, une seule fois', () => {
    const root = document.createElement('div');
    const ctx = testContext({ ...newSave(), team: [null, 'lanceur', null, null] });
    render(root, ctx, { planetId: 1 });
    root.querySelector<HTMLButtonElement>('[data-model="standard"]')!.click();
    expect(ctx.save.team).toEqual(['standard', 'lanceur', null, null]);
    root.querySelector<HTMLButtonElement>('[data-model="standard"]')!.click();
    expect(ctx.save.team).toEqual(['standard', 'lanceur', null, null]);
  });

  it('taper un emplacement le vide', () => {
    const root = document.createElement('div');
    const ctx = testContext();
    render(root, ctx, { planetId: 1 });
    root.querySelector<HTMLButtonElement>('[data-team-slot="0"]')!.click();
    expect(ctx.save.team).toEqual([null, 'lanceur', null, null]);
  });
});
