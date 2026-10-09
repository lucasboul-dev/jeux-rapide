import { describe, it, expect } from 'vitest';
import { walletBar } from '../../src/screens/ui';
import { newSave } from '../../src/save/save';

describe('portefeuille', () => {
  it.each([
    [0, '0 cristal'],
    [1, '1 cristal'],
    [2, '2 cristaux'],
  ])('%i cristal(aux) → « %s »', (n, text) => {
    expect(walletBar({ ...newSave(), crystals: n }).querySelector('.wallet-crystals')!.textContent!.trim()).toBe(text);
  });
});
