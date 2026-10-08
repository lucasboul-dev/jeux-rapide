import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mountBattle, type BattleResult } from '../../src/battle/battleScreen';
import { installFakeFrames, setHidden } from '../dom';
import { setup } from './helpers';

let root: HTMLElement;
let frames: ReturnType<typeof installFakeFrames>;

beforeEach(() => {
  frames = installFakeFrames();
  root = document.createElement('div');
  document.body.appendChild(root);
});

afterEach(() => {
  setHidden(false);
  root.remove();
  vi.unstubAllGlobals();
});

const slot = (i: number) => root.querySelector<HTMLButtonElement>(`[data-slot="${i}"]`)!;
const chargeText = () => root.querySelector('.charge-text')!.textContent;

describe('écran de bataille', () => {
  it('les boutons des Jimees sont désactivés tant que le chargement est insuffisant', () => {
    mountBattle(root, setup(), () => {});
    frames.tick(0.1);
    expect(slot(0).disabled).toBe(true);
    expect(slot(1).disabled).toBe(true);
    frames.tick(3);
    expect(slot(0).disabled).toBe(false);
  });

  it('les emplacements vides restent désactivés', () => {
    mountBattle(root, setup(), () => {});
    frames.tick(12);
    expect(slot(2).disabled).toBe(true);
    expect(slot(3).disabled).toBe(true);
  });

  it('taper un bouton envoie un Jimee et consomme le chargement', () => {
    mountBattle(root, setup(), () => {});
    frames.tick(3.05);
    expect(chargeText()).toBe('3 / 10');
    slot(0).click();
    frames.tick(1 / 60);
    expect(chargeText()).toBe('1 / 10');
  });

  it('la page cachée met la bataille en pause', () => {
    mountBattle(root, setup(), () => {});
    frames.tick(1.05);
    expect(chargeText()).toBe('1 / 10');
    setHidden(true);
    frames.tick(3);
    expect(chargeText()).toBe('1 / 10');
    expect(root.querySelector('.pause-menu')!.classList.contains('hidden')).toBe(false);
  });

  it('abandon → onEnd avec outcome lost, une seule fois', () => {
    const results: BattleResult[] = [];
    mountBattle(root, setup(), (r) => results.push(r));
    frames.tick(0.5);
    root.querySelector<HTMLButtonElement>('.pause')!.click();
    root.querySelector<HTMLButtonElement>('.abandon')!.click();
    frames.tick(1);
    expect(results).toHaveLength(0);
    frames.tick(2);
    expect(results).toEqual([{ outcome: 'lost', planetId: 1, enemyCredits: 0, jimeesLost: 0 }]);
    frames.tick(2);
    expect(results).toHaveLength(1);
  });

  it('le nettoyage arrête la boucle', () => {
    const cleanup = mountBattle(root, setup(), () => {});
    frames.tick(0.5);
    cleanup();
    frames.tick(1 / 60);
    const before = frames.requested;
    frames.tick(1);
    expect(frames.requested).toBe(before);
    expect(root.children).toHaveLength(0);
  });
});
