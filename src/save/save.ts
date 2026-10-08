import { ECONOMY } from '../data/economy';
import { JIMEES } from '../data/jimees';
import { PLANETS } from '../data/planets';
import { UPGRADE_KEYS } from '../data/types';
import type { Progress } from '../economy/progress';
import type { RocketLevels } from '../economy/rocket';

export interface SaveData extends Progress {
  version: 1;
  /** Toujours 4 emplacements ; `null` = emplacement vide. */
  team: (string | null)[];
  rocket: RocketLevels;
}

export const SAVE_KEY = 'jimees-save';

export type LoadResult =
  | { status: 'ok'; data: SaveData }
  | { status: 'new'; data: SaveData }
  | { status: 'corrupt'; raw: string }
  | { status: 'unavailable'; data: SaveData };

export function newSave(): SaveData {
  return {
    version: 1,
    highestUnlocked: 1,
    conquered: [],
    credits: 0,
    crystals: 0,
    collection: { ...ECONOMY.startingCollection },
    team: ['standard', 'lanceur', null, null],
    rocket: { chargeRate: 1, chargeMax: 1, turret: 1, cannon: 1 },
  };
}

/** Renvoie le stockage du navigateur s'il fonctionne vraiment, sinon `null`. */
export function getStorage(): Storage | null {
  try {
    const storage = globalThis.localStorage;
    const probe = '__jimees_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

const KNOWN_MODELS = new Set(JIMEES.map((j) => j.id));
const PLANET_COUNT = PLANETS.length;

function fail(reason: string): never {
  throw new Error(`Sauvegarde invalide : ${reason}`);
}

const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;
const isLevel = (v: unknown, max: number) => isCount(v) && v >= 1 && v <= max;

function validateV1(o: Record<string, unknown>): SaveData {
  if (!isCount(o.credits)) fail('crédits');
  if (!isCount(o.crystals)) fail('cristaux');
  if (!isLevel(o.highestUnlocked, PLANET_COUNT)) fail('planète débloquée');
  if (!Array.isArray(o.conquered) || !o.conquered.every((p) => isLevel(p, PLANET_COUNT))) fail('planètes conquises');

  const collection = o.collection;
  if (typeof collection !== 'object' || collection === null || Array.isArray(collection)) fail('collection');
  for (const [id, level] of Object.entries(collection)) {
    if (!KNOWN_MODELS.has(id) || !isLevel(level, ECONOMY.maxLevel)) fail(`collection (${id})`);
  }

  const owned = collection as Record<string, number>;
  const team = o.team;
  if (!Array.isArray(team) || team.length !== ECONOMY.teamSlots) fail('équipe');
  for (const slot of team) {
    if (slot !== null && (typeof slot !== 'string' || !(slot in owned))) fail('équipe');
  }

  const rocket = o.rocket;
  if (typeof rocket !== 'object' || rocket === null) fail('fusée');
  for (const key of UPGRADE_KEYS) {
    if (!isLevel((rocket as Record<string, unknown>)[key], ECONOMY.maxUpgradeLevel)) fail(`fusée (${key})`);
  }

  return {
    version: 1,
    credits: o.credits as number,
    crystals: o.crystals as number,
    highestUnlocked: o.highestUnlocked as number,
    conquered: [...(o.conquered as number[])],
    collection: { ...owned },
    team: [...(team as (string | null)[])],
    rocket: { ...(rocket as RocketLevels) },
  };
}

/** Valide une sauvegarde lue et la met au format courant. Lève une erreur si elle est inutilisable. */
export function migrate(raw: unknown): SaveData {
  if (typeof raw !== 'object' || raw === null) fail('format');
  const o = raw as Record<string, unknown>;
  switch (o.version) {
    case 1:
      return validateV1(o);
    // Les futures versions ajouteront ici leur migration vers la version suivante.
    default:
      return fail(`version ${String(o.version)}`);
  }
}

export function loadGame(storage: Storage | null): LoadResult {
  if (!storage) return { status: 'unavailable', data: newSave() };
  let raw: string | null;
  try {
    raw = storage.getItem(SAVE_KEY);
  } catch {
    return { status: 'unavailable', data: newSave() };
  }
  if (raw === null) return { status: 'new', data: newSave() };
  try {
    return { status: 'ok', data: migrate(JSON.parse(raw)) };
  } catch {
    return { status: 'corrupt', raw };
  }
}

export function saveGame(storage: Storage | null, data: SaveData): boolean {
  if (!storage) return false;
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/** Repart de zéro : écrit une partie neuve (à n'appeler qu'après confirmation du joueur). */
export function resetGame(storage: Storage | null): SaveData {
  const data = newSave();
  saveGame(storage, data);
  return data;
}
