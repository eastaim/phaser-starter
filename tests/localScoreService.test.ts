import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LocalScoreService } from '../src/services/LocalScoreService';

/** Minimal localStorage stand-in; vitest runs in node, which has no DOM. */
function fakeStorage() {
  const store = new Map<string, string>();
  return {
    store,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  };
}

let storage: ReturnType<typeof fakeStorage>;

beforeEach(() => {
  storage = fakeStorage();
  vi.stubGlobal('localStorage', storage);
});

afterEach(() => vi.unstubAllGlobals());

describe('storage key', () => {
  it('derives `<gameId>.best` from the injected id', async () => {
    await new LocalScoreService('my-game').submit(42);
    expect([...storage.store.entries()]).toEqual([['my-game.best', '42']]);
  });

  it('keeps two games on the same origin apart', async () => {
    await new LocalScoreService('alpha').submit(10);
    await new LocalScoreService('beta').submit(20);

    expect(await new LocalScoreService('alpha').getBest()).toBe(10);
    expect(await new LocalScoreService('beta').getBest()).toBe(20);
  });

  it('rejects an id that is not a slug', () => {
    for (const bad of ['', 'My Game', 'game.best', 'Game']) {
      expect(() => new LocalScoreService(bad)).toThrow(/Invalid game id/);
    }
  });
});

describe('submit', () => {
  it('only stores a score that beats the best', async () => {
    const service = new LocalScoreService('my-game');

    expect(await service.submit(10)).toBe(true);
    expect(await service.submit(5)).toBe(false);
    expect(await service.getBest()).toBe(10);
  });
});

describe('unavailable storage', () => {
  it('falls back to 0 instead of throwing', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('site data disabled');
      },
      setItem: () => {
        throw new Error('site data disabled');
      },
    });
    const service = new LocalScoreService('my-game');

    expect(await service.getBest()).toBe(0);
    expect(await service.submit(10)).toBe(true);
  });
});
