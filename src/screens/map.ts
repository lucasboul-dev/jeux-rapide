import { ECONOMY } from '../data/economy';
import { PLANETS } from '../data/planets';
import type { AppContext } from './app';
import { el, topBar } from './ui';

const replayPercent = Math.round(ECONOMY.replayFactor * 100);

/** Carte de la galaxie : 10 planètes sur un chemin. */
export function render(root: HTMLElement, ctx: AppContext): void {
  const screen = el('div', 'screen map');
  screen.append(topBar('Carte de la galaxie', () => ctx.go('counter'), ctx.save));

  const path = el('ol', 'planet-path');
  for (const planet of PLANETS) {
    const locked = planet.id > ctx.save.highestUnlocked;
    const conquered = ctx.save.conquered.includes(planet.id);
    const item = el('li', 'planet-item');
    const b = el('button', `planet${locked ? ' locked' : ''}${conquered ? ' conquered' : ''}`);
    b.dataset.planet = String(planet.id);
    b.disabled = locked;

    const orb = el('span', 'planet-orb', String(planet.id));
    orb.style.background = `radial-gradient(circle at 35% 30%, ${planet.palette.sky}, ${planet.palette.accent})`;
    const info = el('span', 'planet-info');
    info.append(el('strong', '', planet.name), el('small', '', locked ? 'Verrouillée' : planet.biome));
    const tags = el('span', 'planet-tags');
    if (planet.bossId) tags.append(el('span', 'tag boss', 'Boss'));
    if (conquered) {
      tags.append(el('span', 'tag done', 'Conquise'));
      tags.append(el('span', 'tag reduced', `Gains ×${replayPercent} %`));
    }
    b.append(orb, info, tags);
    b.addEventListener('click', () => ctx.go('prepare', { planetId: planet.id }));
    item.append(b);
    path.append(item);
  }
  screen.append(path);
  root.replaceChildren(screen);
}
