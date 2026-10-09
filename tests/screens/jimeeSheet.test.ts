import { describe, it, expect } from 'vitest';
import { sheetStats, abilityText, openJimeeSheet } from '../../src/screens/jimeeSheet';
import { jimeeById } from '../../src/data/jimees';

const row = (rows: ReturnType<typeof sheetStats>, label: string) => rows.find((r) => r.label === label)!;

describe('fiche de Jimee', () => {
  it('vie et dégâts suivent le niveau, avec la valeur du niveau suivant', () => {
    const rows = sheetStats(jimeeById('standard'), 3);
    expect(row(rows, 'Vie')).toMatchObject({ value: '72', next: '78' });
    expect(row(rows, 'Dégâts')).toMatchObject({ value: '12', next: '13' });
  });

  it('vitesse, portée, cadence et coût sont affichés sans évolution', () => {
    const rows = sheetStats(jimeeById('lanceur'), 1);
    expect(row(rows, 'Vitesse')).toMatchObject({ value: '36', next: null });
    expect(row(rows, 'Portée').value).toBe('Distance · 140');
    expect(row(rows, 'Cadence').value).toBe('1 coup / 1,4 s');
    expect(row(rows, 'Coût').value).toBe('3 de chargement');
  });

  it('au niveau 10, pas de niveau suivant', () => {
    expect(row(sheetStats(jimeeById('standard'), 10), 'Vie').next).toBeNull();
  });

  it('les capacités sont expliquées avec leurs chiffres au niveau actuel', () => {
    expect(abilityText(jimeeById('standard'), 1)).toBeNull();
    expect(abilityText(jimeeById('mecano'), 1)).toBe('Toutes les 3 s, répare la fusée de 56 PV.');
    expect(abilityText(jimeeById('ralentisseur'), 1)).toBe('Ralentit les ennemis touchés de 60 % pendant 2,5 s.');
    expect(abilityText(jimeeById('contremaitre'), 1)).toBe('Lui et les Jimees dans un rayon de 90 font +40 % de dégâts.');
  });

  it('un modèle pas encore obtenu montre seulement sa rareté', () => {
    const host = document.createElement('div');
    openJimeeSheet(host, jimeeById('prototype'), undefined);
    expect(host.textContent).toContain('???');
    expect(host.textContent).toContain('Légendaire');
    expect(host.textContent).not.toContain('Prototype');
  });

  it('le bouton Fermer retire la fiche', () => {
    const host = document.createElement('div');
    openJimeeSheet(host, jimeeById('standard'), 1);
    expect(host.querySelector('.jimee-sheet')).not.toBeNull();
    host.querySelector<HTMLButtonElement>('.sheet-close')!.click();
    expect(host.querySelector('.jimee-sheet')).toBeNull();
  });
});

describe('coût trop élevé pour la fusée', () => {
  it('prévient quand la jauge est trop petite, avec le niveau de capacité nécessaire', () => {
    const host = document.createElement('div');
    openJimeeSheet(host, jimeeById('blinde'), 1, undefined, 10);
    const warning = host.querySelector('.sheet-warning')!;
    expect(warning.textContent).toContain('14');
    expect(warning.textContent).toContain('10');
    expect(warning.textContent).toContain('niveau 3');
  });

  it('pas d’avertissement quand la jauge suffit', () => {
    const host = document.createElement('div');
    openJimeeSheet(host, jimeeById('blinde'), 1, undefined, 14);
    expect(host.querySelector('.sheet-warning')).toBeNull();
  });
});
