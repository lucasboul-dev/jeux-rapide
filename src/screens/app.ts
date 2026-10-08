import { representativeSvg } from '../art/representative';
import { mountBattle } from '../battle/battleScreen';
import { createRng, randomSeed, type Rng } from '../economy/rng';
import { loadGame, resetGame, saveGame, type SaveData } from '../save/save';
import * as capsules from './capsules';
import * as counter from './counter';
import * as map from './map';
import * as prepare from './prepare';
import * as results from './results';
import * as rocket from './rocket';
import { button, el, speech } from './ui';

export type ScreenName = 'counter' | 'map' | 'prepare' | 'battle' | 'results' | 'capsules' | 'rocket';

export interface AppContext {
  save: SaveData;
  storageOk: boolean;
  /** Écrit la sauvegarde courante (sans effet si le stockage est indisponible). */
  persist(): void;
  go(screen: ScreenName, params?: Record<string, unknown>): void;
  rng: Rng;
}

type ScreenRender = (root: HTMLElement, ctx: AppContext, params?: Record<string, unknown>) => void;

/** Écrans de menu ; la bataille est gérée à part (boucle d'animation à arrêter). */
const SCREENS: Partial<Record<ScreenName, ScreenRender>> = {
  counter: counter.render,
  map: map.render,
  prepare: prepare.render,
  results: results.render,
  capsules: capsules.render,
  rocket: rocket.render,
};

/** Démarre le jeu dans `root` à partir du stockage du téléphone (ou `null` s'il est indisponible). */
export function startApp(root: HTMLElement, storage: Storage | null): AppContext {
  const loaded = loadGame(storage);
  const host = el('div', 'screen-host');
  const parts: HTMLElement[] = [];
  if (loaded.status === 'unavailable') {
    parts.push(el('div', 'banner warning', 'Progression non sauvegardée : le stockage de ce navigateur est bloqué.'));
  }
  parts.push(host);
  root.replaceChildren(...parts);

  let cleanup: (() => void) | null = null;

  const ctx: AppContext = {
    save: loaded.status === 'corrupt' ? resetPreview() : loaded.data,
    storageOk: loaded.status !== 'unavailable',
    rng: createRng(randomSeed()),
    persist() {
      saveGame(storage, ctx.save);
    },
    go(screen, params) {
      cleanup?.();
      cleanup = null;
      host.scrollTop = 0;
      globalThis.scrollTo?.(0, 0);
      if (screen === 'battle') {
        const planetId = Number(params?.planetId ?? 1);
        const setup = prepare.teamSetup(ctx.save, planetId, randomSeed());
        if (!setup) {
          ctx.go('prepare', { planetId });
          return;
        }
        cleanup = mountBattle(host, setup, (result) => ctx.go('results', { result }));
        return;
      }
      const render = SCREENS[screen] ?? SCREENS.counter!;
      render(host, ctx, params);
    },
  };

  if (loaded.status === 'corrupt') {
    showCorrupt(host, () => {
      ctx.save = resetGame(storage);
      ctx.go('counter');
    });
  } else {
    if (loaded.status === 'new') ctx.persist();
    ctx.go('counter');
  }
  return ctx;
}

/** Valeur d'attente tant que le joueur n'a pas choisi de repartir de zéro (rien n'est écrit). */
function resetPreview(): SaveData {
  return resetGame(null);
}

function showCorrupt(host: HTMLElement, onReset: () => void): void {
  const screen = el('div', 'screen corrupt');
  const rep = el('div', 'results-rep');
  rep.innerHTML = representativeSvg();
  rep.append(
    speech(
      'Votre dossier de capitaine est illisible. Simple formalité : nous pouvons vous en ouvrir un nouveau, gratuitement (pour cette fois).',
    ),
  );
  screen.append(
    el('h1', 'results-title', 'Sauvegarde illisible'),
    rep,
    el('p', 'hint', 'Repartir de zéro efface la progression enregistrée sur ce téléphone.'),
    button('Repartir de zéro', 'reset danger', onReset),
  );
  host.replaceChildren(screen);
}
