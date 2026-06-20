import { LevelDefinition } from '../../domain/entities/level-definition';

/** Port for level-definition persistence (DI token + abstraction). */
export abstract class LevelRepository {
  abstract getAll(): Promise<LevelDefinition[]>;
  abstract getById(id: number): Promise<LevelDefinition | null>;
  abstract upsert(level: LevelDefinition): Promise<void>;
}
