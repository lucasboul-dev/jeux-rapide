import type { BattleSetup } from '../battle/types';
import { JIMEES, jimeeById } from '../data/jimees';
import { planetById } from '../data/planets';
import { RARITY_LABELS } from '../data/types';
import { rocketStats } from '../economy/rocket';
import type { SaveData } from '../save/save';
import type { AppContext } from './app';
import { openJimeeSheet } from './jimeeSheet';
import { button, el, topBar } from './ui';

/** Prépare la bataille à partir de la sauvegarde. `null` si aucun emplacement n'est rempli. */
export function teamSetup(save: SaveData, planetId: number, seed: number): BattleSetup | null {
  const team = save.team.map((id) => {
    const level = id ? save.collection[id] : undefined;
    return id && level ? { model: jimeeById(id), level } : null;
  });
  if (team.every((slot) => slot === null)) return null;
  return { planet: planetById(planetId), team, rocket: rocketStats(save.rocket), seed };
}

/** Composition de l'équipe avant de décoller. */
export function render(root: HTMLElement, ctx: AppContext, params?: Record<string, unknown>): void {
  const planetId = Number(params?.planetId ?? 1);
  const planet = planetById(planetId);
  const save = ctx.save;

  const update = (team: (string | null)[]) => {
    ctx.save = { ...ctx.save, team };
    ctx.persist();
    render(root, ctx, params);
  };

  const screen = el('div', 'screen prepare');
  screen.append(topBar(`Planète ${planet.id} — ${planet.name}`, () => ctx.go('map')));

  screen.append(el('h2', 'section-title', 'Votre équipe'));
  const slots = el('div', 'team-slots');
  save.team.forEach((id, i) => {
    const b = el('button', `team-slot${id ? '' : ' empty'}`);
    b.dataset.teamSlot = String(i);
    if (id) {
      const model = jimeeById(id);
      const dot = el('span', 'belt-dot');
      dot.style.background = model.belt;
      b.append(dot, el('span', 'slot-name', model.name), el('small', '', `Niv. ${save.collection[id]}`));
      b.setAttribute('aria-label', `Retirer ${model.name}`);
      b.addEventListener('click', () => update(save.team.map((s, j) => (j === i ? null : s))));
    } else {
      b.append(el('span', 'slot-empty', 'Vide'));
    }
    slots.append(b);
  });
  screen.append(slots);

  screen.append(el('h2', 'section-title', 'Collection'));
  const list = el('div', 'collection');
  for (const model of JIMEES) {
    const level = save.collection[model.id];
    if (!level) continue;
    const inTeam = save.team.includes(model.id);
    const b = el('button', `collection-item rarity-${model.rarity}${inTeam ? ' selected' : ''}`);
    b.dataset.model = model.id;
    const dot = el('span', 'belt-dot');
    dot.style.background = model.belt;
    const text = el('span', 'collection-text');
    text.append(el('strong', '', model.name), el('small', '', `${RARITY_LABELS[model.rarity]} · Niv. ${level} · ${model.description}`));
    b.append(dot, text, el('span', 'slot-cost', `⚡ ${model.cost}`), el('span', 'info-dot', 'i'));
    b.addEventListener('click', () => {
      const free = save.team.indexOf(null);
      const action = inTeam
        ? { label: 'Retirer de l’équipe', onClick: () => update(save.team.map((s) => (s === model.id ? null : s))) }
        : free === -1
          ? { label: 'Équipe complète', disabled: true, onClick: () => {} }
          : { label: 'Mettre dans l’équipe', onClick: () => update(save.team.map((s, j) => (j === free ? model.id : s))) };
      openJimeeSheet(screen, model, level, action);
    });
    list.append(b);
  }
  screen.append(list);

  const launch = button('Décoller', 'launch primary', () => ctx.go('battle', { planetId }));
  launch.disabled = save.team.every((s) => s === null);
  const footer = el('div', 'sticky-footer');
  footer.append(launch);
  if (launch.disabled) footer.append(el('p', 'hint', 'Placez au moins un Jimee dans l’équipe.'));
  screen.append(footer);

  root.replaceChildren(screen);
}
