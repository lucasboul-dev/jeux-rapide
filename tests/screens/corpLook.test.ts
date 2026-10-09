import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render as renderCounter } from '../../src/screens/counter';
import { render as renderResults } from '../../src/screens/results';
import { render as renderCapsules } from '../../src/screens/capsules';
import { startApp } from '../../src/screens/app';
import { SAVE_KEY, newSave } from '../../src/save/save';
import { fakeStorage } from '../save/fakeStorage';
import { installFakeFrames } from '../dom';
import { testContext } from './context';

describe('le fonctionnaire de la Corp', () => {
  it('le guichet montre le bureau, le fonctionnaire et la plaque de devise', () => {
    const root = document.createElement('div');
    renderCounter(root, testContext());
    expect(root.querySelector('.counter.paper')).not.toBeNull();
    expect(root.querySelector('svg.functionary')).not.toBeNull();
    expect(root.querySelector('.nameplate')!.textContent).toContain('Notre administration aussi');
    expect(root.querySelector('.awning')).toBeNull();
  });

  it('le bilan d’une victoire est tamponné VALIDÉ', () => {
    const root = document.createElement('div');
    renderResults(root, testContext(), { result: { outcome: 'won', planetId: 1, enemyCredits: 10, jimeesLost: 2 } });
    expect(root.querySelector('.stamp')!.textContent).toBe('VALIDÉ');
    expect(root.querySelector('svg.functionary-desk')).not.toBeNull();
  });

  it('le bilan d’une défaite est tamponné REFUSÉ', () => {
    const root = document.createElement('div');
    renderResults(root, testContext(), { result: { outcome: 'lost', planetId: 1, enemyCredits: 0, jimeesLost: 3 } });
    expect(root.querySelector('.stamp')!.textContent).toBe('REFUSÉ');
  });

  it('l’affiche de deuil devient un avis officiel, avec le nombre de Jimees perdus', () => {
    const root = document.createElement('div');
    renderResults(root, testContext(), { result: { outcome: 'lost', planetId: 1, enemyCredits: 0, jimeesLost: 3 } });
    const notice = root.querySelector('.poster')!;
    expect(notice.textContent).toContain('Avis officiel');
    expect(notice.textContent).toContain('3 Jimees');
  });

  it('un tirage au distributeur rend un bon de commande tamponné', () => {
    const root = document.createElement('div');
    const ctx = testContext({ ...newSave(), credits: 100 });
    renderCapsules(root, ctx);
    expect(root.querySelector('.capsules.paper')).not.toBeNull();
    root.querySelector<HTMLButtonElement>('.crank')!.click();
    expect(root.querySelector('.draw-result .stamp')!.textContent).toBe('LIVRÉ');
  });

  it('les cristaux ont leur icône', () => {
    const root = document.createElement('div');
    renderCounter(root, testContext({ ...newSave(), crystals: 2 }));
    expect(root.querySelector('.wallet-crystals svg.crystal-icon')).not.toBeNull();
  });
});

describe('sauvegarde illisible', () => {
  let root: HTMLElement;
  beforeEach(() => {
    installFakeFrames();
    root = document.createElement('div');
    document.body.appendChild(root);
  });
  afterEach(() => {
    root.remove();
    vi.unstubAllGlobals();
  });

  it('le fonctionnaire apparaît en gros plan, perplexe devant le dossier', () => {
    const storage = fakeStorage();
    storage.setItem(SAVE_KEY, '{oups');
    startApp(root, storage);
    expect(root.querySelector('svg.functionary-closeup')).not.toBeNull();
  });
});
