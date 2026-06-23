import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderboardEntry } from '../../../domain/entities/leaderboard-entry';
import { LeaderboardRepository } from '../../../application/ports/leaderboard-repository';
import { LeaderboardOrmEntity } from '../orm/leaderboard.orm-entity';

/** Postgres-backed {@link LeaderboardRepository}: one best entry per (level, user). */
@Injectable()
export class TypeOrmLeaderboardRepository extends LeaderboardRepository {
  constructor(
    @InjectRepository(LeaderboardOrmEntity)
    private readonly repo: Repository<LeaderboardOrmEntity>,
  ) {
    super();
  }

  async record(entry: LeaderboardEntry): Promise<void> {
    const current = await this.repo.findOne({
      where: { levelId: entry.levelId, userId: entry.userId },
    });
    // Keep only the player's best score for the level.
    if (!current || entry.score > current.score) {
      await this.repo.save({
        levelId: entry.levelId,
        userId: entry.userId,
        username: entry.username,
        score: entry.score,
        achievedAt: entry.achievedAt,
      });
    }
  }

  async topForLevel(levelId: number, limit: number): Promise<LeaderboardEntry[]> {
    const rows = await this.repo.find({
      where: { levelId },
      order: { score: 'DESC', achievedAt: 'ASC' },
      take: limit,
    });
    return rows.map(
      (row) =>
        new LeaderboardEntry(row.levelId, row.userId, row.username, row.score, row.achievedAt),
    );
  }
}
