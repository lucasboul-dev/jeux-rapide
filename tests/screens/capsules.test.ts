import { describe, it, expect } from 'vitest';
import { drawButtonState, render } from '../../src/screens/capsules';
import { newSave } from '../../src/save/save';
import { testContext } from './context';

describe('distributeur', () => {
  it('bouton désactivé sous 100 crédits', () => {
    expect(drawButtonState({ ...newSave(), credits: 99 }, 0).enabled).toBe(false);
  });

  it('bouton désactivé si cristaux demandés > possédés', () => {
    expect(drawButtonState({ ...newSave(), credits: 500, crystals: 1 }, 2).enabled).toBe(false);
  });

  it('probabilités affichées pour 2 cristaux', () => {
    expect(drawButtonState({ ...newSave(), credits: 500, crystals: 2 }, 2).odds).toEqual({
      common: 36,
      rare: 40,
      epic: 18,
      legendary: 6,
    });
  });

  it('affiche le prix et les probabilités avant le tirage', () => {
    const root = document.createElement('div');
    render(root, testContext({ ...newSave(), credits: 100 }));
    expect(root.textContent).toContain('100 crédits');
    expect(root.textContent).toContain('60 %');
    expect(root.textContent).toContain('2 %');
  });

  it('les cristaux non possédés ne sont pas sélectionnables', () => {
    const root = document.createElement('div');
    render(root, testContext({ ...newSave(), credits: 100, crystals: 1 }));
    expect(root.querySelector<HTMLButtonElement>('[data-crystals="1"]')!.disabled).toBe(false);
    expect(root.querySelector<HTMLButtonElement>('[data-crystals="2"]')!.disabled).toBe(true);
  });

  it('choisir un cristal met à jour les probabilités affichées', () => {
    const root = document.createElement('div');
    render(root, testContext({ ...newSave(), credits: 100, crystals: 1 }));
    root.querySelector<HTMLButtonElement>('[data-crystals="1"]')!.click();
    expect(root.querySelector('.odds')!.textContent).toContain('48 %');
  });

  it('tourner la manivelle paie, tire et affiche le résultat', () => {
    const root = document.createElement('div');
    const ctx = testContext({ ...newSave(), credits: 150 });
    render(root, ctx);
    root.querySelector<HTMLButtonElement>('.crank')!.click();
    expect([50, 75]).toContain(ctx.save.credits);
    expect(root.querySelector('.draw-result')).not.toBeNull();
    expect(root.querySelector<HTMLButtonElement>('.crank')!.disabled).toBe(true);
  });
});
