import type { BattleSetup } from '../battle/types';
import { JIMEES, jimeeById } from '../data/jimees';
import { planetById } from '../data/planets';
import { RARITY_LABELS } from '../data/types';
import { rocketStats } from '../economy/rocket';
import type { SaveData } from '../save/save';
import type { AppContext } from './app';
import { drawJimee } from '../art/jimee';
import { unitStats } from '../economy/power';
import { abilityTag, capacityWarning, openJimeeSheet } from './jimeeSheet';
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

  const chargeMax = rocketStats(save.rocket).chargeMax;
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

  // Collection : statistiques visibles directement, avec des barres pour comparer.
  type SortKey = 'cost' | 'hp' | 'dps' | 'rarity';
  const sort: SortKey = (params?.sort as SortKey | undefined) ?? 'cost';
  const owned = JIMEES.filter((m) => save.collection[m.id]).map((model) => {
    const level = save.collection[model.id];
    const stats = unitStats(model, level);
    return { model, level, stats, dps: stats.damage / stats.attackInterval };
  });
  const rarityRank = { common: 0, rare: 1, epic: 2, legendary: 3 } as const;
  const sorters: Record<SortKey, (a: (typeof owned)[number], b: (typeof owned)[number]) => number> = {
    cost: (a, b) => a.model.cost - b.model.cost,
    hp: (a, b) => b.stats.hp - a.stats.hp,
    dps: (a, b) => b.dps - a.dps,
    rarity: (a, b) => rarityRank[b.model.rarity] - rarityRank[a.model.rarity],
  };
  owned.sort((a, b) => sorters[sort](a, b) || a.model.cost - b.model.cost);
  const maxHp = Math.max(...owned.map((o) => o.stats.hp));
  const maxDps = Math.max(...owned.map((o) => o.dps));

  const head = el('div', 'collection-head');
  head.append(el('h2', 'section-title', 'Collection'));
  const sortBar = el('div', 'sort-bar');
  sortBar.append(el('span', 'sort-label', 'Trier :'));
  for (const [key, label] of [['cost', 'Coût'], ['hp', 'Vie'], ['dps', 'Dégâts/s'], ['rarity', 'Rareté']] as const) {
    const b = button(label, key === sort ? 'selected' : '', () => render(root, ctx, { ...params, sort: key }));
    b.dataset.sort = key;
    sortBar.append(b);
  }
  head.append(sortBar);
  screen.append(head);

  const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
  const stat = (cls: string, icon: string, label: string, value: string, ratio?: number) => {
    const box = el('span', `stat ${cls}`);
    box.append(el('span', 'stat-label', `${icon} ${label}`), el('span', 'stat-value', value));
    if (ratio !== undefined) {
      const bar = el('span', 'stat-bar');
      const fill = el('span', 'stat-bar-fill');
      fill.style.width = `${Math.round(ratio * 100)}%`;
      bar.append(fill);
      box.append(bar);
    }
    return box;
  };

  const list = el('div', 'collection');
  for (const { model, level, stats, dps } of owned) {
    const inTeam = save.team.includes(model.id);
    const b = el('button', `collection-item jimee-card rarity-${model.rarity}${inTeam ? ' selected' : ''}`);
    b.dataset.model = model.id;

    const portrait = el('canvas', 'card-portrait');
    portrait.width = 72;
    portrait.height = 84;
    const c2d = portrait.getContext('2d');
    if (c2d) {
      c2d.scale(1.4, 1.4);
      drawJimee(c2d, 24, 56, model, { facing: 1, walkPhase: 0, scale: 0.95, walking: false });
    }

    const title = el('span', 'card-title');
    title.append(el('strong', '', model.name), el('span', 'slot-cost', `⚡ ${model.cost}`));
    const sub = el('span', 'card-sub', `${RARITY_LABELS[model.rarity]} · Niv. ${level}${inTeam ? ' · Dans l’équipe' : ''}`);
    const tags = el('span', 'card-tags');
    const tag = abilityTag(model);
    if (tag) tags.append(el('span', 'ability-tag', tag));
    if (capacityWarning(model, chargeMax)) tags.append(el('span', 'capacity-warning', 'Capacité insuffisante : améliorez la fusée'));

    const stats4 = el('span', 'card-stats');
    stats4.append(
      stat('stat-hp', '❤', 'Vie', String(Math.round(stats.hp)), stats.hp / maxHp),
      stat('stat-dps', '⚔', 'Dégâts/s', fmt(dps), dps / maxDps),
      stat('stat-range', '🎯', 'Portée', model.ranged ? fmt(stats.range) : 'Mêlée'),
      stat('stat-speed', '👟', 'Vitesse', fmt(stats.speed)),
    );

    const body = el('span', 'card-body');
    body.append(title, sub);
    if (tags.childElementCount) body.append(tags);
    body.append(stats4);
    b.append(portrait, body);

    b.addEventListener('click', () => {
      const free = save.team.indexOf(null);
      const action = inTeam
        ? { label: 'Retirer de l’équipe', onClick: () => update(save.team.map((s) => (s === model.id ? null : s))) }
        : free === -1
          ? { label: 'Équipe complète', disabled: true, onClick: () => {} }
          : { label: 'Mettre dans l’équipe', onClick: () => update(save.team.map((s, j) => (j === free ? model.id : s))) };
      openJimeeSheet(screen, model, level, action, chargeMax);
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
