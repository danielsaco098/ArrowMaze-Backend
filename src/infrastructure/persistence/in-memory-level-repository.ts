import { Injectable } from '@nestjs/common';
import { LevelDefinition } from '../../domain/entities/level-definition';
import { LevelRepository } from '../../application/ports/level-repository';
import { BUNDLED_LEVEL_SEED } from './bundled-levels.seed';

/**
 * In-memory {@link LevelRepository}. Seeded with the same 15 multi-cell levels
 * the client bundles and modifiable via the admin upsert endpoint, so new
 * levels reach the client without an app release. A database-backed adapter
 * can replace it without touching use cases.
 */
@Injectable()
export class InMemoryLevelRepository extends LevelRepository {
  private readonly byId = new Map<number, LevelDefinition>();

  constructor() {
    super();
    for (const level of BUNDLED_LEVEL_SEED) {
      this.byId.set(level.id, level);
    }
  }

  async getAll(): Promise<LevelDefinition[]> {
    return [...this.byId.values()];
  }

  async getById(id: number): Promise<LevelDefinition | null> {
    return this.byId.get(id) ?? null;
  }

  async upsert(level: LevelDefinition): Promise<void> {
    this.byId.set(level.id, level);
  }
}
