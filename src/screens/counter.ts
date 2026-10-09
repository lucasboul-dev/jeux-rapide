import { functionaryStanding } from '../art/representative';
import { CORP_LINES } from '../data/corpLines';
import { pick } from '../economy/rng';
import type { AppContext } from './app';
import { button, el, speech, walletBar } from './ui';

/** Le guichet de la Corp : écran d'accueil. */
export function render(root: HTMLElement, ctx: AppContext): void {
  const screen = el('div', 'screen counter paper');

  const booth = el('div', 'booth');
  booth.append(el('div', 'booth-sign', 'JIMEE’S CORP — Guichet des capitaines · Service des Jimees'));
  const scene = el('div', 'booth-scene');
  scene.innerHTML = functionaryStanding();
  scene.append(speech(pick(ctx.rng, CORP_LINES.counter)));
  const desk = el('div', 'desk');
  desk.append(
    el('div', 'holo-form', ''),
    el('div', 'nameplate', 'L’univers est en expansion. Notre administration aussi.'),
  );
  booth.append(scene, desk);

  const menu = el('nav', 'counter-menu');
  const go = (screen: 'map' | 'capsules' | 'rocket') => () => ctx.go(screen);
  const missions = button('Partir en mission', 'primary', go('map'));
  missions.dataset.go = 'map';
  const capsules = button('Distributeur de capsules', '', go('capsules'));
  capsules.dataset.go = 'capsules';
  const rocket = button('Améliorer la fusée', '', go('rocket'));
  rocket.dataset.go = 'rocket';
  menu.append(missions, capsules, rocket);

  screen.append(walletBar(ctx.save), booth, menu);
  root.replaceChildren(screen);
}
