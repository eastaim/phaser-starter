import type { LeaderboardEntry, ScoreService } from './ScoreService';

/** A game id is a slug: lowercase letters, digits and hyphens. */
const GAME_ID_PATTERN = /^[a-z0-9-]+$/;

/**
 * Browser-local implementation: personal best only, no global ranking.
 *
 * The storage key is derived from the game id rather than hardcoded. Every game
 * deployed to the same GitHub Pages origin shares one localStorage, so a key
 * baked into the template would make two template-derived games silently
 * overwrite each other's best score. `<gameId>.best` is also the convention the
 * games portal reads.
 *
 * Every storage access is guarded — private browsing, disabled site data, and
 * embedded contexts can all make localStorage throw rather than return null.
 * A storage failure must never break the game, so reads fall back to 0.
 */
export class LocalScoreService implements ScoreService {
  private readonly bestKey: string;

  /**
   * @param gameId Stable slug for this game, matching the repository name and
   * the portal's entry id (e.g. `mergedrop`). It must be unique across every
   * game served from the same origin.
   */
  constructor(gameId: string) {
    if (!GAME_ID_PATTERN.test(gameId)) {
      throw new Error(
        `Invalid game id ${JSON.stringify(gameId)}: expected a slug like "my-game" ` +
          '(lowercase letters, digits and hyphens).',
      );
    }
    this.bestKey = `${gameId}.best`;
  }

  async getBest(): Promise<number> {
    try {
      const raw = localStorage.getItem(this.bestKey);
      const value = Number(raw);
      return Number.isFinite(value) && value > 0 ? value : 0;
    } catch {
      return 0;
    }
  }

  async submit(score: number): Promise<boolean> {
    const best = await this.getBest();
    if (score <= best) return false;
    try {
      localStorage.setItem(this.bestKey, String(score));
    } catch {
      // Storage unavailable — the run still counted for this session.
    }
    return true;
  }

  async getLeaderboard(): Promise<readonly LeaderboardEntry[]> {
    return [];
  }
}
