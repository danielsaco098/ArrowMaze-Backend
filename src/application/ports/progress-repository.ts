import { ProgressRecord } from '../../domain/entities/progress-record';

/** Port for per-user progress persistence (DI token + abstraction). */
export abstract class ProgressRepository {
  abstract getByUser(userId: string): Promise<ProgressRecord[]>;
  abstract getBest(userId: string, levelId: number): Promise<number | null>;
  abstract saveBest(userId: string, levelId: number, score: number): Promise<void>;
}
