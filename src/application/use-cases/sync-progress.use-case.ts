import { ProgressRecord } from '../../domain/entities/progress-record';
import { LeaderboardEntry } from '../../domain/entities/leaderboard-entry';
import { ProgressRepository } from '../ports/progress-repository';
import { LeaderboardRepository } from '../ports/leaderboard-repository';

export interface LevelResult {
  levelId: number;
  score: number;
}

export interface SyncProgressInput {
  userId: string;
  username: string;
  results: LevelResult[];
}

/**
 * Syncs a player's level results: for each result that beats their stored best,
 * it updates the saved progress and the global leaderboard. Returns the player's
 * full, updated progress. Depends only on the repository ports.
 */
export class SyncProgressUseCase {
  constructor(
    private readonly progress: ProgressRepository,
    private readonly leaderboard: LeaderboardRepository,
  ) {}

  async execute(input: SyncProgressInput): Promise<ProgressRecord[]> {
    for (const result of input.results) {
      const previousBest = await this.progress.getBest(input.userId, result.levelId);
      if (previousBest === null || result.score > previousBest) {
        await this.progress.saveBest(input.userId, result.levelId, result.score);
        await this.leaderboard.record(
          new LeaderboardEntry(
            result.levelId,
            input.userId,
            input.username,
            result.score,
            new Date(),
          ),
        );
      }
    }
    return this.progress.getByUser(input.userId);
  }
}
