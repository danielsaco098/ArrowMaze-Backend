import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgressRecord } from '../../../domain/entities/progress-record';
import { ProgressRepository } from '../../../application/ports/progress-repository';
import { ProgressOrmEntity } from '../orm/progress.orm-entity';

/** Postgres-backed {@link ProgressRepository}: best score per level, per user. */
@Injectable()
export class TypeOrmProgressRepository extends ProgressRepository {
  constructor(
    @InjectRepository(ProgressOrmEntity)
    private readonly repo: Repository<ProgressOrmEntity>,
  ) {
    super();
  }

  async getByUser(userId: string): Promise<ProgressRecord[]> {
    const rows = await this.repo.find({ where: { userId }, order: { levelId: 'ASC' } });
    return rows.map((row) => ({ levelId: row.levelId, bestScore: row.bestScore }));
  }

  async getBest(userId: string, levelId: number): Promise<number | null> {
    const row = await this.repo.findOne({ where: { userId, levelId } });
    return row?.bestScore ?? null;
  }

  async saveBest(userId: string, levelId: number, score: number): Promise<void> {
    // Composite PK (userId, levelId) makes this a straight upsert.
    await this.repo.save({ userId, levelId, bestScore: score });
  }
}
