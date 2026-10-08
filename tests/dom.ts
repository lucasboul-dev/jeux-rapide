import { vi } from 'vitest';

/** Contexte 2D factice : toutes les méthodes existent et ne font rien. */
export function fakeContext(): CanvasRenderingContext2D {
  const gradient = { addColorStop: () => {} };
  return new Proxy({} as Record<string | symbol, unknown>, {
    get: (target, prop) => {
      if (prop in target) return target[prop];
      if (prop === 'createLinearGradient') return () => gradient;
      return () => {};
    },
    set: (target, prop, value) => {
      target[prop] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
}

/** requestAnimationFrame piloté à la main. */
export function installFakeFrames() {
  let now = 0;
  let queue: FrameRequestCallback[] = [];
  let requested = 0;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    requested++;
    queue.push(cb);
    return requested;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  HTMLCanvasElement.prototype.getContext = (() => fakeContext()) as unknown as HTMLCanvasElement['getContext'];
  return {
    /** Fait passer `seconds` secondes, à 60 images par seconde. */
    tick(seconds: number) {
      const frames = Math.round(seconds * 60);
      for (let i = 0; i < frames; i++) {
        now += 1000 / 60;
        const current = queue;
        queue = [];
        for (const cb of current) cb(now);
      }
    },
    get requested() {
      return requested;
    },
  };
}

export function setHidden(hidden: boolean): void {
  Object.defineProperty(document, 'hidden', { value: hidden, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
}
