import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LeaderboardEntry,
  OverallLeaderboardEntry,
} from '../../../domain/entities/leaderboard-entry';
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

  async topOverall(limit: number): Promise<OverallLeaderboardEntry[]> {
    // Aggregate in SQL: sum of each player's best score across all levels.
    const rows: Array<{ userId: string; username: string; total: string; levels: string }> =
      await this.repo
        .createQueryBuilder('entry')
        .select('entry.userId', 'userId')
        .addSelect('entry.username', 'username')
        .addSelect('SUM(entry.score)', 'total')
        .addSelect('COUNT(*)', 'levels')
        .groupBy('entry.userId')
        .addGroupBy('entry.username')
        .orderBy('total', 'DESC')
        .addOrderBy('username', 'ASC')
        .limit(limit)
        .getRawMany();
    return rows.map(
      (row) =>
        new OverallLeaderboardEntry(
          row.userId,
          row.username,
          Number(row.total),
          Number(row.levels),
        ),
    );
  }
}
