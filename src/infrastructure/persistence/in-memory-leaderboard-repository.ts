import { Injectable } from '@nestjs/common';
import { LeaderboardEntry } from '../../domain/entities/leaderboard-entry';
import { LeaderboardRepository } from '../../application/ports/leaderboard-repository';

/** In-memory {@link LeaderboardRepository}: one best entry per (level, user). */
@Injectable()
export class InMemoryLeaderboardRepository extends LeaderboardRepository {
  private readonly byLevel = new Map<number, Map<string, LeaderboardEntry>>();

  async record(entry: LeaderboardEntry): Promise<void> {
    const entries = this.byLevel.get(entry.levelId) ?? new Map<string, LeaderboardEntry>();
    const current = entries.get(entry.userId);
    if (!current || entry.score > current.score) {
      entries.set(entry.userId, entry);
      this.byLevel.set(entry.levelId, entries);
    }
  }

  async topForLevel(levelId: number, limit: number): Promise<LeaderboardEntry[]> {
    const entries = [...(this.byLevel.get(levelId)?.values() ?? [])];
    return entries
      .sort((a, b) => b.score - a.score || a.achievedAt.getTime() - b.achievedAt.getTime())
      .slice(0, limit);
  }
}
