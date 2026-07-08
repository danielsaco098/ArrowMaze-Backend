import { Injectable } from '@nestjs/common';
import { CellData, Difficulty, LevelDefinition } from '../../domain/entities/level-definition';
import { LevelRepository } from '../ports/level-repository';

export interface UpsertLevelInput {
  id: number;
  name: string;
  difficulty: Difficulty;
  rows: number;
  cols: number;
  cells: CellData[];
  /** Seconds allowed to clear the board; undefined = untimed. */
  timeLimitSeconds?: number;
}

/** Creates or replaces a level definition (admin operation). */
@Injectable()
export class UpsertLevelUseCase {
  constructor(private readonly levels: LevelRepository) {}

  async execute(input: UpsertLevelInput): Promise<LevelDefinition> {
    const level = new LevelDefinition(
      input.id,
      input.name,
      input.difficulty,
      input.rows,
      input.cols,
      input.cells,
      input.timeLimitSeconds,
    );
    await this.levels.upsert(level);
    return level;
  }
}
