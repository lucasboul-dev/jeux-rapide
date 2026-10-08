import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { startApp } from '../../src/screens/app';
import { SAVE_KEY, newSave, loadGame } from '../../src/save/save';
import { fakeStorage } from '../save/fakeStorage';
import { installFakeFrames } from '../dom';

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

describe('démarrage', () => {
  it("sauvegarde illisible : rien n'est effacé avant confirmation", () => {
    const storage = fakeStorage();
    storage.setItem(SAVE_KEY, '{oups');
    startApp(root, storage);
    expect(root.textContent).toContain('Repartir de zéro');
    expect(storage.getItem(SAVE_KEY)).toBe('{oups');
    root.querySelector<HTMLButtonElement>('.reset')!.click();
    expect(loadGame(storage)).toEqual({ status: 'ok', data: newSave() });
    expect(root.querySelector('.counter')).not.toBeNull();
  });

  it("stockage indisponible : bandeau d'avertissement", () => {
    startApp(root, null);
    expect(root.textContent).toContain('Progression non sauvegardée');
  });

  it('partie neuve : guichet affiché, crédits à zéro', () => {
    startApp(root, fakeStorage());
    expect(root.querySelector('.counter')).not.toBeNull();
    expect(root.querySelector('.wallet')!.textContent).toContain('0');
  });

  it('la navigation guichet → carte → préparation fonctionne', () => {
    startApp(root, fakeStorage());
    root.querySelector<HTMLButtonElement>('[data-go="map"]')!.click();
    expect(root.querySelector('.map')).not.toBeNull();
    root.querySelector<HTMLButtonElement>('[data-planet="1"]')!.click();
    expect(root.querySelector('.prepare')).not.toBeNull();
  });

  it('les planètes non débloquées sont verrouillées', () => {
    startApp(root, fakeStorage());
    root.querySelector<HTMLButtonElement>('[data-go="map"]')!.click();
    expect(root.querySelector<HTMLButtonElement>('[data-planet="1"]')!.disabled).toBe(false);
    expect(root.querySelector<HTMLButtonElement>('[data-planet="2"]')!.disabled).toBe(true);
  });
});

describe('écrans du guichet', () => {
  it('le guichet mène au distributeur et à la fusée', () => {
    startApp(root, fakeStorage());
    root.querySelector<HTMLButtonElement>('[data-go="capsules"]')!.click();
    expect(root.querySelector('.capsules')).not.toBeNull();
    root.querySelector<HTMLButtonElement>('.back')!.click();
    root.querySelector<HTMLButtonElement>('[data-go="rocket"]')!.click();
    expect(root.querySelector('.rocket')).not.toBeNull();
  });
});
