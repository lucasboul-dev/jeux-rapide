import type { SaveData } from '../save/save';

/** Crée un élément avec sa classe et, au besoin, son texte. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text = '',
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function button(text: string, className: string, onClick: () => void): HTMLButtonElement {
  const b = el('button', className, text);
  b.addEventListener('click', onClick);
  return b;
}

/** Soldes du capitaine, toujours visibles en chiffres. */
export function walletBar(save: SaveData): HTMLElement {
  const bar = el('div', 'wallet');
  bar.append(
    el('span', 'wallet-credits', `${save.credits.toLocaleString('fr-FR')} crédits`),
    el('span', 'wallet-crystals', `${save.crystals} cristal${save.crystals > 1 ? 'x' : ''}`),
  );
  return bar;
}

/** Barre de titre avec bouton retour. */
export function topBar(title: string, onBack: () => void, save?: SaveData): HTMLElement {
  const bar = el('header', 'top-bar');
  const back = button('‹', 'back icon-button', onBack);
  back.setAttribute('aria-label', 'Retour');
  bar.append(back, el('h1', 'top-title', title));
  if (save) bar.append(walletBar(save));
  return bar;
}

/** Bulle de dialogue du représentant. */
export function speech(text: string): HTMLElement {
  return el('p', 'speech', text);
}
