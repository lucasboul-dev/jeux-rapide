import { createCamera, dragCamera, followCamera, screenToWorld } from './camera';
import { renderBattle, renderScale } from './render';
import { abandonBattle, advanceBattle, createBattle, fireCannon, sendJimee } from './sim';
import type { BattleSetup } from './types';

export interface BattleResult {
  outcome: 'won' | 'lost';
  planetId: number;
  enemyCredits: number;
  jimeesLost: number;
}

/** Délai (s) entre la fin de la bataille et l'appel à `onEnd`, pour voir la base tomber. */
const END_DELAY = 1.5;
/** En dessous de ce déplacement (px), un appui sur le terrain est un tap, pas un glisser. */
const TAP_SLOP = 6;
const FALLBACK_SIZE = { width: 390, height: 260 };

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

/**
 * Monte l'écran de bataille dans `root`. Renvoie une fonction de nettoyage
 * (arrête la boucle, retire les écouteurs et vide `root`).
 */
export function mountBattle(root: HTMLElement, setup: BattleSetup, onEnd: (r: BattleResult) => void): () => void {
  const state = createBattle(setup);

  // --- Structure ---------------------------------------------------------
  const screen = el('div', 'battle');
  const field = el('div', 'battle-field');
  const canvas = el('canvas', 'battle-canvas');
  const pauseButton = el('button', 'pause icon-button', 'Ⅱ');
  pauseButton.setAttribute('aria-label', 'Pause');
  const planetLabel = el('div', 'battle-planet', `Planète ${setup.planet.id} — ${setup.planet.name}`);
  field.append(canvas, planetLabel, pauseButton);

  const hud = el('div', 'battle-hud');
  const charge = el('div', 'charge');
  const chargeFill = el('div', 'charge-fill');
  const chargeText = el('span', 'charge-text');
  charge.append(chargeFill, chargeText);

  const slots = el('div', 'slots');
  const slotButtons = setup.team.map((teamSlot, i) => {
    const b = el('button', 'slot');
    b.dataset.slot = String(i);
    if (teamSlot) {
      const dot = el('span', 'belt-dot');
      dot.style.background = teamSlot.model.belt;
      b.append(dot, el('span', 'slot-name', teamSlot.model.name), el('span', 'slot-cost', `⚡ ${teamSlot.model.cost}`));
      b.setAttribute('aria-label', `Envoyer ${teamSlot.model.name}, coût ${teamSlot.model.cost}`);
    } else {
      b.append(el('span', 'slot-empty', 'Vide'));
    }
    b.addEventListener('click', () => sendJimee(state, i));
    slots.append(b);
    return b;
  });

  const cannonButton = el('button', 'cannon');
  cannonButton.addEventListener('click', () => {
    if (state.cannonCooldown > 0 || state.outcome !== 'running') return;
    setArmed(!armed);
  });
  hud.append(charge, slots, cannonButton);

  const pauseMenu = el('div', 'pause-menu hidden');
  const resumeButton = el('button', 'resume primary', 'Reprendre');
  const abandonButton = el('button', 'abandon danger', 'Abandonner');
  pauseMenu.append(el('p', 'pause-title', 'Pause'), resumeButton, abandonButton);

  screen.append(field, hud, pauseMenu);
  root.replaceChildren(screen);

  // --- État de l'écran ---------------------------------------------------
  let paused = false;
  let armed = false;
  let stopped = false;
  let ended = false;
  let endTimer = 0;
  let last: number | null = null;
  let clock = 0;
  const ctx = canvas.getContext('2d');
  const cam = createCamera(FALLBACK_SIZE.width / renderScale(FALLBACK_SIZE.height));

  function setArmed(value: boolean): void {
    armed = value;
    cannonButton.classList.toggle('armed', armed);
    canvas.classList.toggle('targeting', armed);
  }

  function setPaused(value: boolean): void {
    paused = value;
    pauseMenu.classList.toggle('hidden', !paused);
    last = null;
  }

  pauseButton.addEventListener('click', () => setPaused(true));
  resumeButton.addEventListener('click', () => setPaused(false));
  abandonButton.addEventListener('click', () => {
    abandonBattle(state);
    setPaused(false);
  });

  const onVisibility = () => {
    if (document.hidden && state.outcome === 'running') setPaused(true);
  };
  document.addEventListener('visibilitychange', onVisibility);

  // --- Glisser et viser ----------------------------------------------------
  let pointerStart: { x: number; lastX: number; moved: boolean } | null = null;
  canvas.addEventListener('pointerdown', (e) => {
    pointerStart = { x: e.clientX, lastX: e.clientX, moved: false };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!pointerStart) return;
    const dx = e.clientX - pointerStart.lastX;
    pointerStart.lastX = e.clientX;
    if (Math.abs(e.clientX - pointerStart.x) > TAP_SLOP) pointerStart.moved = true;
    if (pointerStart.moved) dragCamera(cam, -dx / renderScale(size().height), clock);
  });
  canvas.addEventListener('pointerup', (e) => {
    const wasTap = pointerStart && !pointerStart.moved;
    pointerStart = null;
    if (!wasTap || !armed) return;
    const rect = canvas.getBoundingClientRect();
    const worldX = screenToWorld(cam, e.clientX - rect.left, renderScale(size().height));
    if (fireCannon(state, worldX)) setArmed(false);
  });

  // --- Boucle ------------------------------------------------------------
  function size(): { width: number; height: number } {
    return {
      width: canvas.clientWidth || FALLBACK_SIZE.width,
      height: canvas.clientHeight || FALLBACK_SIZE.height,
    };
  }

  function resizeCanvas(): void {
    const { width, height } = size();
    const dpr = globalThis.devicePixelRatio || 1;
    if (canvas.width !== Math.round(width * dpr)) canvas.width = Math.round(width * dpr);
    if (canvas.height !== Math.round(height * dpr)) canvas.height = Math.round(height * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    cam.viewWidth = width / renderScale(height);
  }

  function updateHud(): void {
    const { chargeMax } = setup.rocket;
    chargeFill.style.width = `${(state.charge / chargeMax) * 100}%`;
    chargeText.textContent = `${Math.floor(state.charge)} / ${chargeMax}`;
    setup.team.forEach((teamSlot, i) => {
      slotButtons[i].disabled = !teamSlot || state.outcome !== 'running' || state.charge < teamSlot.model.cost;
    });
    const cooldown = Math.ceil(state.cannonCooldown);
    cannonButton.disabled = state.outcome !== 'running' || state.cannonCooldown > 0;
    cannonButton.textContent = armed
      ? 'Canon : touchez le terrain'
      : cooldown > 0
        ? `Canon (${cooldown} s)`
        : 'Canon prêt';
  }

  function frame(ts: number): void {
    if (stopped) return;
    const dt = last === null ? 0 : Math.min((ts - last) / 1000, 0.25);
    last = ts;
    if (!paused) {
      clock += dt;
      advanceBattle(state, dt);
      if (state.outcome !== 'running') {
        if (armed) setArmed(false);
        endTimer += dt;
        if (!ended && endTimer >= END_DELAY) {
          ended = true;
          stopped = true;
          onEnd({
            outcome: state.outcome,
            planetId: setup.planet.id,
            enemyCredits: state.stats.enemyCredits,
            jimeesLost: state.stats.jimeesLost,
          });
          return;
        }
      }
    }
    const front = state.units.reduce((max, u) => (u.side === 'jimee' ? Math.max(max, u.x) : max), 0);
    followCamera(cam, front, clock);
    resizeCanvas();
    if (ctx) renderBattle(ctx, state, cam, size());
    updateHud();
    requestAnimationFrame(frame);
  }

  updateHud();
  requestAnimationFrame(frame);

  return () => {
    stopped = true;
    document.removeEventListener('visibilitychange', onVisibility);
    root.replaceChildren();
  };
}
