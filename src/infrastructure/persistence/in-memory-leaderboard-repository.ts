import { Injectable } from '@nestjs/common';
import { LeaderboardEntry, OverallLeaderboardEntry } from '../../domain/entities/leaderboard-entry';
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

  async topOverall(limit: number): Promise<OverallLeaderboardEntry[]> {
    // Sum each player's best score across every level they appear in.
    const byUser = new Map<string, { username: string; totalScore: number; levelsPlayed: number }>();
    for (const entries of this.byLevel.values()) {
      for (const entry of entries.values()) {
        const acc = byUser.get(entry.userId) ?? {
          username: entry.username,
          totalScore: 0,
          levelsPlayed: 0,
        };
        acc.totalScore += entry.score;
        acc.levelsPlayed += 1;
        byUser.set(entry.userId, acc);
      }
    }
    return [...byUser.entries()]
      .map(
        ([userId, acc]) =>
          new OverallLeaderboardEntry(userId, acc.username, acc.totalScore, acc.levelsPlayed),
      )
      .sort((a, b) => b.totalScore - a.totalScore || a.username.localeCompare(b.username))
      .slice(0, limit);
  }
}
