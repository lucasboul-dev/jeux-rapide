import { representativeSvg } from '../art/representative';
import type { BattleResult } from '../battle/battleScreen';
import { CORP_LINES } from '../data/corpLines';
import { ECONOMY } from '../data/economy';
import { planetById } from '../data/planets';
import { applyBattleResult, battleCredits, rollCrystal } from '../economy/progress';
import { pick, type Rng } from '../economy/rng';
import type { SaveData } from '../save/save';
import type { AppContext } from './app';
import { button, el, speech } from './ui';

/** Calcule les gains d'une bataille et les applique à la sauvegarde. */
export function settleBattle(
  save: SaveData,
  r: BattleResult,
  rng: Rng,
): { save: SaveData; credits: number; crystal: boolean; firstConquest: boolean } {
  const firstConquest = !save.conquered.includes(r.planetId);
  const credits = battleCredits({ outcome: r.outcome, planetId: r.planetId, enemyCredits: r.enemyCredits, firstConquest });
  const crystal = r.outcome === 'won' && rollCrystal(rng);
  return {
    save: applyBattleResult(save, { outcome: r.outcome, planetId: r.planetId, credits, crystal }),
    credits,
    crystal,
    firstConquest,
  };
}

/** Bilan de fin de bataille. */
export function render(root: HTMLElement, ctx: AppContext, params?: Record<string, unknown>): void {
  const result = params?.result as BattleResult | undefined;
  if (!result) {
    ctx.go('counter');
    return;
  }
  const settled = settleBattle(ctx.save, result, ctx.rng);
  ctx.save = settled.save;
  ctx.persist();

  const won = result.outcome === 'won';
  const planet = planetById(result.planetId);
  const screen = el('div', `screen results ${won ? 'won' : 'lost'}`);
  screen.append(el('h1', 'results-title', won ? 'Planète conquise !' : 'Mission ratée'));
  screen.append(el('p', 'results-planet', `Planète ${planet.id} — ${planet.name}`));

  const gains = el('ul', 'gains');
  gains.append(el('li', 'gain-credits', `+${settled.credits} crédits`));
  if (!settled.firstConquest) {
    gains.append(el('li', 'gain-note', `Planète déjà conquise : gains ×${Math.round(ECONOMY.replayFactor * 100)} %`));
  }
  if (!won) gains.append(el('li', 'gain-note', 'Défaite : seuls les ennemis vaincus rapportent des crédits.'));
  if (settled.crystal) gains.append(el('li', 'gain-crystal', '+1 cristal'));
  gains.append(el('li', 'gain-lost', `${result.jimeesLost} Jimee${result.jimeesLost > 1 ? 's' : ''} perdu${result.jimeesLost > 1 ? 's' : ''}`));
  screen.append(gains);

  const poster = el('div', 'poster');
  poster.append(
    el('span', 'poster-kicker', 'Jimee’s Corp présente'),
    el('strong', 'poster-title', pick(ctx.rng, CORP_LINES.mourningPosterTitles)),
    el('span', 'poster-count', `En mémoire de ${result.jimeesLost} Jimee${result.jimeesLost > 1 ? 's' : ''}`),
  );
  screen.append(poster);

  const rep = el('div', 'results-rep');
  rep.innerHTML = representativeSvg();
  rep.append(speech(pick(ctx.rng, won ? CORP_LINES.victory : CORP_LINES.defeat)));
  screen.append(rep);

  const actions = el('div', 'results-actions');
  actions.append(
    button('Rejouer', 'primary', () => ctx.go('prepare', { planetId: result.planetId })),
    button('Guichet', '', () => ctx.go('counter')),
  );
  if (won && result.planetId < ctx.save.highestUnlocked) {
    actions.prepend(button('Planète suivante', 'primary', () => ctx.go('prepare', { planetId: result.planetId + 1 })));
  }
  screen.append(actions);
  root.replaceChildren(screen);
}
