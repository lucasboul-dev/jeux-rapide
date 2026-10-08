import { UPGRADE_KEYS, type UpgradeKey } from '../data/types';
import { ECONOMY } from '../data/economy';
import { buyUpgrade, rocketStats, upgradeCost, type RocketLevels, type RocketStats } from '../economy/rocket';
import type { SaveData } from '../save/save';
import type { AppContext } from './app';
import { el, topBar } from './ui';

const LABELS: Record<UpgradeKey, string> = {
  chargeRate: 'Vitesse de chargement',
  chargeMax: 'Capacité de chargement',
  turret: 'Tourelle',
  cannon: 'Canon',
};

const STAT: Record<UpgradeKey, (s: RocketStats) => number> = {
  chargeRate: (s) => s.chargeRate,
  chargeMax: (s) => s.chargeMax,
  turret: (s) => s.turretDamage,
  cannon: (s) => s.cannonDamage,
};

const fr = (n: number, digits = 1) => n.toLocaleString('fr-FR', { maximumFractionDigits: digits });

const FORMAT: Record<UpgradeKey, (v: number) => string> = {
  chargeRate: (v) => `${fr(v, 2)} pt/s`,
  chargeMax: (v) => `${fr(v)} pts`,
  turret: (v) => `${fr(v)} dégâts`,
  cannon: (v) => `${fr(v)} dégâts`,
};

export interface UpgradeRow {
  key: UpgradeKey;
  label: string;
  level: number;
  cost: number | null;
  affordable: boolean;
  current: number;
  next: number | null;
}

export function upgradeRows(save: SaveData): UpgradeRow[] {
  return UPGRADE_KEYS.map((key) => {
    const level = save.rocket[key];
    const cost = upgradeCost(level);
    const nextLevels: RocketLevels = { ...save.rocket, [key]: level + 1 };
    return {
      key,
      label: LABELS[key],
      level,
      cost,
      affordable: cost !== null && save.credits >= cost,
      current: STAT[key](rocketStats(save.rocket)),
      next: cost === null ? null : STAT[key](rocketStats(nextLevels)),
    };
  });
}

/** Améliorations de la fusée. */
export function render(root: HTMLElement, ctx: AppContext): void {
  const screen = el('div', 'screen rocket');
  screen.append(topBar('Fusée', () => ctx.go('counter'), ctx.save));
  screen.append(el('p', 'hint', 'Les améliorations sont permanentes et s’appliquent à toutes vos missions.'));

  const stats = rocketStats(ctx.save.rocket);
  const list = el('div', 'upgrades');
  for (const row of upgradeRows(ctx.save)) {
    const card = el('div', 'upgrade');
    const head = el('div', 'upgrade-head');
    head.append(el('strong', '', row.label), el('span', 'upgrade-level', `Niv. ${row.level} / ${ECONOMY.maxUpgradeLevel}`));
    let detail = row.next === null ? FORMAT[row.key](row.current) : `${FORMAT[row.key](row.current)} → ${FORMAT[row.key](row.next)}`;
    if (row.key === 'cannon') {
      const nextCooldown =
        row.next === null ? null : rocketStats({ ...ctx.save.rocket, cannon: row.level + 1 }).cannonCooldown;
      detail += ` · recharge ${fr(stats.cannonCooldown)} s${nextCooldown === null ? '' : ` → ${fr(nextCooldown)} s`}`;
    }
    const b = el('button', row.cost === null ? 'maxed' : 'primary');
    b.dataset.upgrade = row.key;
    b.textContent = row.cost === null ? 'MAX' : `Améliorer — ${row.cost.toLocaleString('fr-FR')} crédits`;
    b.disabled = !row.affordable;
    b.addEventListener('click', () => {
      const next = buyUpgrade(ctx.save, row.key);
      if (!next) return;
      ctx.save = next;
      ctx.persist();
      render(root, ctx);
    });
    card.append(head, el('span', 'upgrade-detail', detail), b);
    list.append(card);
  }
  screen.append(list);
  root.replaceChildren(screen);
}
