export function fakeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
  };
}

export function throwingStorage(): Storage {
  const fail = () => {
    throw new Error('stockage bloqué');
  };
  return { length: 0, clear: fail, key: fail, getItem: fail, setItem: fail, removeItem: fail } as unknown as Storage;
}
