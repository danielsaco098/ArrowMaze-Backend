import { LeaderboardEntry, OverallLeaderboardEntry } from '../../domain/entities/leaderboard-entry';
import { LeaderboardRepository } from '../ports/leaderboard-repository';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const clampLimit = (limit: number): number => Math.min(Math.max(1, limit), MAX_LIMIT);

/** Returns the top scores for a level. */
export class GetLeaderboardUseCase {
  constructor(private readonly leaderboard: LeaderboardRepository) {}

  execute(levelId: number, limit = DEFAULT_LIMIT): Promise<LeaderboardEntry[]> {
    return this.leaderboard.topForLevel(levelId, clampLimit(limit));
  }
}

/** Returns the overall ranking: each player's best scores summed across levels. */
export class GetOverallLeaderboardUseCase {
  constructor(private readonly leaderboard: LeaderboardRepository) {}

  execute(limit = DEFAULT_LIMIT): Promise<OverallLeaderboardEntry[]> {
    return this.leaderboard.topOverall(clampLimit(limit));
  }
}
