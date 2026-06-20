import { Injectable } from '@nestjs/common';
import { LeaderboardEntry } from '../../domain/entities/leaderboard-entry';
import { LeaderboardRepository } from '../ports/leaderboard-repository';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/** Returns the top scores for a level. */
@Injectable()
export class GetLeaderboardUseCase {
  constructor(private readonly leaderboard: LeaderboardRepository) {}

  execute(levelId: number, limit = DEFAULT_LIMIT): Promise<LeaderboardEntry[]> {
    const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT);
    return this.leaderboard.topForLevel(levelId, safeLimit);
  }
}
