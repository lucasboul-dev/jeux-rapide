import { drawJimee } from '../art/jimee';
import { ECONOMY } from '../data/economy';
import { RARITY_LABELS, type JimeeModel } from '../data/types';
import { unitStats } from '../economy/power';
import { button, el } from './ui';

export interface SheetRow {
  label: string;
  value: string;
  /** Valeur au niveau suivant, ou `null` si elle ne change pas (ou niveau max). */
  next: string | null;
}

const fr = (n: number, digits = 1) => n.toLocaleString('fr-FR', { maximumFractionDigits: digits });
const whole = (n: number) => fr(Math.round(n), 0);

/** Statistiques affichées sur la fiche d'un modèle au niveau donné. */
export function sheetStats(model: JimeeModel, level: number): SheetRow[] {
  const now = unitStats(model, level);
  const next = level < ECONOMY.maxLevel ? unitStats(model, level + 1) : null;
  return [
    { label: 'Vie', value: whole(now.hp), next: next ? whole(next.hp) : null },
    { label: 'Dégâts', value: whole(now.damage), next: next ? whole(next.damage) : null },
    { label: 'Vitesse', value: fr(now.speed), next: null },
    { label: 'Portée', value: `${model.ranged ? 'Distance' : 'Corps à corps'} · ${fr(now.range)}`, next: null },
    { label: 'Cadence', value: `1 coup / ${fr(now.attackInterval)} s`, next: null },
    { label: 'Coût', value: `${model.cost} de chargement`, next: null },
  ];
}

/** Explication de la capacité spéciale, avec ses chiffres au niveau donné ; `null` s'il n'y en a pas. */
export function abilityText(model: JimeeModel, level: number): string | null {
  const a = model.ability;
  if (!a) return null;
  const s = unitStats(model, level);
  switch (a.kind) {
    case 'explodeOnDeath':
      return `Explose à sa mort : ${whole(a.damageFactor * s.damage)} dégâts dans un rayon de ${fr(a.radius)}.`;
    case 'heal':
      return `Toutes les ${fr(a.interval)} s, soigne de ${whole(a.amountFactor * s.hp)} PV les Jimees dans un rayon de ${fr(a.radius)}.`;
    case 'shield':
      return `Arrive avec un bouclier de ${whole(a.amountFactor * s.hp)} qui absorbe les coups avant la vie.`;
    case 'splash':
      return `Ses tirs touchent tous les ennemis dans un rayon de ${fr(a.radius)}.`;
    case 'repairRocket':
      return `Toutes les ${fr(a.interval)} s, répare la fusée de ${whole(a.amountFactor * s.hp)} PV.`;
    case 'slow':
      return `Ralentit les ennemis touchés de ${whole((1 - a.factor) * 100)} % pendant ${fr(a.duration)} s.`;
    case 'aura':
      return `Lui et les Jimees dans un rayon de ${fr(a.radius)} font +${whole(a.damageBonus * 100)} % de dégâts.`;
  }
}

/** Étiquette courte de la capacité spéciale, pour les listes ; `null` s'il n'y en a pas. */
export function abilityTag(model: JimeeModel): string | null {
  const a = model.ability;
  if (!a) return null;
  switch (a.kind) {
    case 'explodeOnDeath':
      return 'Explose à sa mort';
    case 'heal':
      return 'Soigne les alliés';
    case 'shield':
      return 'Bouclier';
    case 'splash':
      return 'Tir de zone';
    case 'repairRocket':
      return 'Répare la fusée';
    case 'slow':
      return 'Ralentit';
    case 'aura':
      return `Aura +${Math.round(a.damageBonus * 100)} % dégâts`;
  }
}

export interface SheetAction {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

/**
 * Ouvre la fiche d'un modèle par-dessus `host`. `level` absent = modèle pas encore obtenu.
 * Renvoie une fonction qui ferme la fiche.
 */
/** Niveau de « capacité de chargement » de la fusée nécessaire pour payer `cost`. */
export function requiredCapacityLevel(cost: number): number {
  const { chargeMax, chargeMaxPerLevel } = ECONOMY.rocket;
  return cost <= chargeMax ? 1 : Math.ceil((cost - chargeMax) / chargeMaxPerLevel) + 1;
}

/** Texte d'avertissement si la jauge de la fusée est trop petite pour ce modèle, sinon `null`. */
export function capacityWarning(model: JimeeModel, chargeMax: number | undefined): string | null {
  if (chargeMax === undefined || model.cost <= chargeMax) return null;
  return `Coût ${model.cost}, mais votre fusée ne contient que ${chargeMax} points : il faut la capacité de chargement au niveau ${requiredCapacityLevel(model.cost)}.`;
}

export function openJimeeSheet(
  host: HTMLElement,
  model: JimeeModel,
  level: number | undefined,
  action?: SheetAction,
  chargeMax?: number,
): () => void {
  host.querySelector('.sheet-overlay')?.remove();
  const overlay = el('div', 'sheet-overlay');
  const sheet = el('div', `jimee-sheet rarity-${model.rarity}`);
  sheet.setAttribute('role', 'dialog');
  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  const owned = level !== undefined;
  const head = el('div', 'sheet-head');
  const portrait = el('canvas', 'sheet-portrait');
  portrait.width = 120;
  portrait.height = 120;
  const c2d = portrait.getContext('2d');
  if (c2d) {
    c2d.scale(2.2, 2.2);
    if (owned) drawJimee(c2d, 26, 50, model, { facing: 1, walkPhase: 0, scale: 1 });
    else drawJimee(c2d, 26, 50, { belt: '#5c6380', accessory: 'none' }, { facing: 1, walkPhase: 0, scale: 1 });
  }
  const title = el('div', 'sheet-title');
  title.append(
    el('strong', '', owned ? model.name : '???'),
    el('span', `sheet-rarity rarity-${model.rarity}`, RARITY_LABELS[model.rarity]),
  );
  if (owned) title.append(el('span', 'sheet-level', `Niveau ${level} / ${ECONOMY.maxLevel}`));
  head.append(portrait, title);
  sheet.append(head);

  if (owned) {
    sheet.append(el('p', 'sheet-description', model.description));
    const table = el('dl', 'sheet-stats');
    for (const r of sheetStats(model, level)) {
      const dt = el('dt', '', r.label);
      const dd = el('dd', '', r.value);
      if (r.next !== null) dd.append(el('span', 'sheet-next', ` → ${r.next}`));
      table.append(dt, dd);
    }
    sheet.append(table);
    const warning = capacityWarning(model, chargeMax);
    if (warning) sheet.append(el('p', 'sheet-warning', warning));
    if (level < ECONOMY.maxLevel) {
      sheet.append(el('p', 'sheet-hint', 'Les flèches montrent le niveau suivant, obtenu en tirant un doublon au distributeur.'));
    }
    const ability = abilityText(model, level);
    if (ability) {
      const box = el('div', 'sheet-ability');
      box.append(el('strong', '', 'Capacité spéciale'), el('p', '', ability));
      sheet.append(box);
    }
  } else {
    sheet.append(el('p', 'sheet-description', 'Modèle pas encore obtenu. Tentez votre chance au distributeur.'));
  }

  const actions = el('div', 'sheet-actions');
  if (action) {
    const b = button(action.label, 'sheet-action primary', () => {
      close();
      action.onClick();
    });
    b.disabled = Boolean(action.disabled);
    actions.append(b);
  }
  actions.append(button('Fermer', 'sheet-close', close));
  sheet.append(actions);

  overlay.append(sheet);
  host.append(overlay);
  return close;
}
