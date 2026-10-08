import { ECONOMY } from '../data/economy';
import { JIMEES } from '../data/jimees';
import { RARITIES, type Rarity } from '../data/types';
import { pick, type Rng } from './rng';

/** Partie de la sauvegarde utile à l'économie. `SaveData` l'étend. */
export type Wallet = {
  credits: number;
  crystals: number;
  /** modelId → niveau */
  collection: Record<string, number>;
};

export type DrawOutcome =
  | { kind: 'new'; modelId: string }
  | { kind: 'levelUp'; modelId: string; level: number }
  | { kind: 'buyback'; modelId: string; credits: number };

function isValidCrystalCount(crystals: number): boolean {
  return Number.isInteger(crystals) && crystals >= 0 && crystals <= ECONOMY.maxCrystalsPerDraw;
}

/** Probabilités en points de pourcentage, selon le nombre de cristaux ajoutés (0 à 3). */
export function rarityOdds(crystals: number): Record<Rarity, number> {
  if (!isValidCrystalCount(crystals)) throw new Error(`Nombre de cristaux invalide : ${crystals}`);
  const odds = {} as Record<Rarity, number>;
  for (const r of RARITIES) odds[r] = ECONOMY.baseOdds[r] + ECONOMY.crystalShift[r] * crystals;
  return odds;
}

/** Tire la rareté d'abord, puis un modèle au hasard parmi ceux de cette rareté. */
export function drawCapsule(rng: Rng, crystals: number): { rarity: Rarity; modelId: string } {
  const odds = rarityOdds(crystals);
  const roll = rng() * 100;
  let cumulative = 0;
  let rarity: Rarity = 'legendary';
  for (const r of RARITIES) {
    cumulative += odds[r];
    if (roll < cumulative) {
      rarity = r;
      break;
    }
  }
  const model = pick(rng, JIMEES.filter((j) => j.rarity === rarity));
  return { rarity, modelId: model.id };
}

/** Ajoute un modèle tiré à la collection : nouveau, +1 niveau, ou reprise du doublon au niveau max. */
export function applyDraw<W extends Wallet>(wallet: W, modelId: string): { wallet: W; outcome: DrawOutcome } {
  const level = wallet.collection[modelId];
  if (level === undefined) {
    return {
      wallet: { ...wallet, collection: { ...wallet.collection, [modelId]: 1 } },
      outcome: { kind: 'new', modelId },
    };
  }
  if (level >= ECONOMY.maxLevel) {
    return {
      wallet: { ...wallet, credits: wallet.credits + ECONOMY.buybackCredits },
      outcome: { kind: 'buyback', modelId, credits: ECONOMY.buybackCredits },
    };
  }
  return {
    wallet: { ...wallet, collection: { ...wallet.collection, [modelId]: level + 1 } },
    outcome: { kind: 'levelUp', modelId, level: level + 1 },
  };
}

/** Vérifie qu'un tirage est possible avec ce solde et ce nombre de cristaux. */
export function canPurchaseDraw(wallet: Wallet, crystals: number): boolean {
  return isValidCrystalCount(crystals) && wallet.credits >= ECONOMY.drawCost && wallet.crystals >= crystals;
}

/** Paie le tirage, tire une capsule et l'applique. `null` si le tirage est impossible. */
export function purchaseDraw<W extends Wallet>(
  wallet: W,
  crystals: number,
  rng: Rng,
): { wallet: W; outcome: DrawOutcome } | null {
  if (!canPurchaseDraw(wallet, crystals)) return null;
  const paid = { ...wallet, credits: wallet.credits - ECONOMY.drawCost, crystals: wallet.crystals - crystals };
  return applyDraw(paid, drawCapsule(rng, crystals).modelId);
}
