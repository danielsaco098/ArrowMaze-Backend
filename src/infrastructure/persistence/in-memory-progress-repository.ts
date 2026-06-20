import { Injectable } from '@nestjs/common';
import { ProgressRecord } from '../../domain/entities/progress-record';
import { ProgressRepository } from '../../application/ports/progress-repository';

/** In-memory {@link ProgressRepository}: best score per level, per user. */
@Injectable()
export class InMemoryProgressRepository extends ProgressRepository {
  private readonly byUser = new Map<string, Map<number, number>>();

  async getByUser(userId: string): Promise<ProgressRecord[]> {
    const levels = this.byUser.get(userId);
    if (!levels) {
      return [];
    }
    return [...levels.entries()]
      .map(([levelId, bestScore]) => ({ levelId, bestScore }))
      .sort((a, b) => a.levelId - b.levelId);
  }

  async getBest(userId: string, levelId: number): Promise<number | null> {
    return this.byUser.get(userId)?.get(levelId) ?? null;
  }

  async saveBest(userId: string, levelId: number, score: number): Promise<void> {
    const levels = this.byUser.get(userId) ?? new Map<number, number>();
    levels.set(levelId, score);
    this.byUser.set(userId, levels);
  }
}
