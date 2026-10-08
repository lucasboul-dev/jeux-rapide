import { describe, it, expect } from 'vitest';
import { loadGame, saveGame, migrate, newSave, resetGame, SAVE_KEY } from '../../src/save/save';
import { fakeStorage, throwingStorage } from './fakeStorage';

describe('sauvegarde', () => {
  it('partie neuve conforme à la spec', () => {
    expect(newSave()).toEqual({
      version: 1,
      highestUnlocked: 1,
      conquered: [],
      credits: 0,
      crystals: 0,
      collection: { standard: 1, lanceur: 1 },
      team: ['standard', 'lanceur', null, null],
      rocket: { chargeRate: 1, chargeMax: 1, turret: 1, cannon: 1 },
    });
  });

  it('aucune sauvegarde → partie neuve', () => {
    expect(loadGame(fakeStorage())).toEqual({ status: 'new', data: newSave() });
  });

  it('aller-retour', () => {
    const s = fakeStorage();
    const d = { ...newSave(), credits: 321 };
    expect(saveGame(s, d)).toBe(true);
    expect(loadGame(s)).toEqual({ status: 'ok', data: d });
  });

  it('JSON illisible → corrupt, contenu non effacé', () => {
    const s = fakeStorage();
    s.setItem(SAVE_KEY, '{oups');
    expect(loadGame(s)).toEqual({ status: 'corrupt', raw: '{oups' });
    expect(s.getItem(SAVE_KEY)).toBe('{oups');
  });

  it('champs manquants → corrupt', () => {
    const s = fakeStorage();
    s.setItem(SAVE_KEY, JSON.stringify({ version: 1 }));
    expect(loadGame(s).status).toBe('corrupt');
  });

  it('modèle inconnu dans la collection → corrupt', () => {
    const s = fakeStorage();
    s.setItem(SAVE_KEY, JSON.stringify({ ...newSave(), collection: { fantome: 1 } }));
    expect(loadGame(s).status).toBe('corrupt');
  });

  it('stockage absent → unavailable avec partie neuve', () => {
    expect(loadGame(null)).toEqual({ status: 'unavailable', data: newSave() });
  });

  it('stockage qui lève une exception → unavailable, pas de crash', () => {
    expect(loadGame(throwingStorage()).status).toBe('unavailable');
  });

  it("saveGame renvoie false si l'écriture échoue", () => {
    expect(saveGame(throwingStorage(), newSave())).toBe(false);
    expect(saveGame(null, newSave())).toBe(false);
  });

  it('version inconnue → erreur de migration', () => {
    expect(() => migrate({ ...newSave(), version: 99 })).toThrow();
  });

  it('resetGame écrit une partie neuve', () => {
    const s = fakeStorage();
    s.setItem(SAVE_KEY, '{oups');
    expect(resetGame(s)).toEqual(newSave());
    expect(loadGame(s)).toEqual({ status: 'ok', data: newSave() });
  });
});
