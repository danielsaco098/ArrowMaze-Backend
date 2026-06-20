import { Injectable } from '@nestjs/common';
import { LevelDefinition } from '../../domain/entities/level-definition';
import { LevelRepository } from '../../application/ports/level-repository';

/** Sample level definitions seeded into the in-memory store. */
const SEED: LevelDefinition[] = [
  new LevelDefinition(1, 'First Steps', 'EASY', 3, 3, [
    { row: 0, col: 0, kind: 'ARROW', direction: 'RIGHT' },
    { row: 2, col: 2, kind: 'ARROW', direction: 'LEFT' },
    { row: 1, col: 1, kind: 'ARROW', direction: 'UP' },
  ]),
  new LevelDefinition(2, 'One After Another', 'EASY', 3, 3, [
    { row: 2, col: 0, kind: 'ARROW', direction: 'RIGHT' },
    { row: 0, col: 0, kind: 'ARROW', direction: 'DOWN' },
    { row: 0, col: 2, kind: 'ARROW', direction: 'DOWN' },
  ]),
  new LevelDefinition(3, 'First Wall', 'MEDIUM', 5, 5, [
    { row: 0, col: 0, kind: 'ARROW', direction: 'DOWN' },
    { row: 2, col: 0, kind: 'ARROW', direction: 'DOWN' },
    { row: 4, col: 2, kind: 'ARROW', direction: 'RIGHT' },
    { row: 2, col: 2, kind: 'ARROW', direction: 'UP' },
    { row: 3, col: 2, kind: 'WALL' },
  ]),
];

/**
 * In-memory {@link LevelRepository}. Seeded with sample levels and modifiable
 * via the admin upsert endpoint, so new levels reach the client without an app
 * release. A database-backed adapter can replace it without touching use cases.
 */
@Injectable()
export class InMemoryLevelRepository extends LevelRepository {
  private readonly byId = new Map<number, LevelDefinition>();

  constructor() {
    super();
    for (const level of SEED) {
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
