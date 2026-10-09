import { drawJimee } from '../art/jimee';
import { CORP_LINES } from '../data/corpLines';
import { ECONOMY } from '../data/economy';
import { JIMEES, jimeeById } from '../data/jimees';
import { RARITIES, RARITY_LABELS, type Rarity } from '../data/types';
import { canPurchaseDraw, purchaseDraw, rarityOdds, type DrawOutcome } from '../economy/capsules';
import { pick } from '../economy/rng';
import { rocketStats } from '../economy/rocket';
import type { SaveData } from '../save/save';
import type { AppContext } from './app';
import { openJimeeSheet } from './jimeeSheet';
import { button, el, speech, topBar } from './ui';

/** État du bouton de tirage et probabilités à afficher pour ce nombre de cristaux. */
export function drawButtonState(save: SaveData, crystals: number): { enabled: boolean; odds: Record<Rarity, number> } {
  return { enabled: canPurchaseDraw(save, crystals), odds: rarityOdds(crystals) };
}

interface ViewState {
  crystals: number;
  last?: DrawOutcome;
  line?: string;
}

/** Distributeur de capsules à manivelle. */
export function render(root: HTMLElement, ctx: AppContext, params?: Record<string, unknown>): void {
  const view: ViewState = (params?.view as ViewState | undefined) ?? { crystals: 0 };
  view.crystals = Math.min(view.crystals, ctx.save.crystals, ECONOMY.maxCrystalsPerDraw);
  const rerender = () => render(root, ctx, { view });
  const { enabled, odds } = drawButtonState(ctx.save, view.crystals);

  const screen = el('div', 'screen capsules');
  screen.append(topBar('Distributeur de capsules', () => ctx.go('counter'), ctx.save));

  screen.append(machine(view.last));

  if (view.last) screen.append(resultPanel(view.last, view.line ?? ''));

  // Cristaux
  const crystalBox = el('div', 'crystal-picker');
  crystalBox.append(el('span', 'crystal-label', 'Cristaux ajoutés'));
  const choices = el('div', 'crystal-choices');
  for (let n = 0; n <= ECONOMY.maxCrystalsPerDraw; n++) {
    const b = button(String(n), n === view.crystals ? 'selected' : '', () => {
      view.crystals = n;
      view.last = undefined;
      rerender();
    });
    b.dataset.crystals = String(n);
    b.disabled = n > ctx.save.crystals;
    choices.append(b);
  }
  crystalBox.append(choices);
  screen.append(crystalBox);

  // Probabilités, affichées avant le tirage
  const table = el('div', 'odds');
  for (const r of RARITIES) {
    const row = el('div', `odds-row rarity-${r}`);
    row.append(el('span', '', RARITY_LABELS[r]), el('strong', '', `${odds[r]} %`));
    table.append(row);
  }
  screen.append(table);

  const footer = el('div', 'sticky-footer');
  const crank = button(`Tourner la manivelle — ${ECONOMY.drawCost} crédits`, 'crank primary', () => {
    const result = purchaseDraw(ctx.save, view.crystals, ctx.rng);
    if (!result) return;
    ctx.save = result.wallet;
    ctx.persist();
    view.last = result.outcome;
    view.line =
      result.outcome.kind === 'new'
        ? pick(ctx.rng, CORP_LINES.newModel)
        : result.outcome.kind === 'buyback'
          ? pick(ctx.rng, CORP_LINES.buyback)
          : '';
    rerender();
  });
  crank.disabled = !enabled;
  footer.append(crank);
  if (!enabled) {
    footer.append(
      el(
        'p',
        'hint',
        ctx.save.credits < ECONOMY.drawCost
          ? `Il vous faut ${ECONOMY.drawCost} crédits par tirage.`
          : 'Pas assez de cristaux pour ce choix.',
      ),
    );
  }
  screen.append(footer);

  screen.append(el('h2', 'section-title', 'Votre collection'));
  screen.append(collection(ctx.save, screen));

  root.replaceChildren(screen);
}

function machine(last?: DrawOutcome): HTMLElement {
  const m = el('div', `machine${last ? ' opened' : ''}`);
  const dome = el('div', 'machine-dome');
  for (let i = 0; i < 9; i++) dome.append(el('span', `capsule c${i % 4}`));
  m.append(dome, el('div', 'machine-body'), el('div', 'machine-crank'));
  return m;
}

function resultPanel(outcome: DrawOutcome, line: string): HTMLElement {
  const model = jimeeById(outcome.modelId);
  const panel = el('div', `draw-result rarity-${model.rarity}`);
  const canvas = el('canvas', 'draw-portrait');
  canvas.width = 96;
  canvas.height = 96;
  const c2d = canvas.getContext('2d');
  if (c2d) {
    c2d.scale(2, 2);
    drawJimee(c2d, 24, 44, model, { facing: 1, walkPhase: 0, scale: 1 });
  }
  const text = el('div', 'draw-text');
  if (outcome.kind === 'new') text.append(el('span', 'new-badge', 'Nouveau !'));
  text.append(el('strong', '', model.name), el('small', '', RARITY_LABELS[model.rarity]));
  if (outcome.kind === 'levelUp') text.append(el('span', 'draw-detail', `Fusion : niveau ${outcome.level}`));
  if (outcome.kind === 'buyback') {
    text.append(el('span', 'draw-detail', `Déjà au niveau ${ECONOMY.maxLevel} : repris par la Corp, +${outcome.credits} crédits`));
  }
  panel.append(canvas, text);
  const wrap = el('div', 'draw-wrap');
  wrap.append(panel);
  if (line) wrap.append(speech(line));
  return wrap;
}

function collection(save: SaveData, host: HTMLElement): HTMLElement {
  const list = el('div', 'collection');
  for (const model of JIMEES) {
    const level = save.collection[model.id];
    const item = el('button', `collection-item rarity-${model.rarity}${level ? '' : ' missing'}`);
    item.dataset.model = model.id;
    item.addEventListener('click', () => openJimeeSheet(host, model, level, undefined, rocketStats(save.rocket).chargeMax));
    const dot = el('span', 'belt-dot');
    dot.style.background = level ? model.belt : 'transparent';
    const text = el('span', 'collection-text');
    text.append(
      el('strong', '', level ? model.name : '???'),
      el('small', '', `${RARITY_LABELS[model.rarity]}${level ? ` · Niv. ${level} / ${ECONOMY.maxLevel}` : ' · pas encore obtenu'}`),
    );
    item.append(dot, text, el('span', 'info-dot', 'i'));
    list.append(item);
  }
  return list;
}
