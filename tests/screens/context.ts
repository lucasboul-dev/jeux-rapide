import type { AppContext } from '../../src/screens/app';
import { newSave, type SaveData } from '../../src/save/save';
import { createRng } from '../../src/economy/rng';

/** Contexte d'écran minimal pour tester un écran seul. */
export function testContext(save: SaveData = newSave()): AppContext & { visits: string[] } {
  const visits: string[] = [];
  return {
    save,
    storageOk: true,
    persist: () => {},
    go: (screen) => void visits.push(screen),
    rng: createRng(1),
    visits,
  };
}
