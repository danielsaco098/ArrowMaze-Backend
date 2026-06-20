import { Injectable } from '@nestjs/common';
import { LevelDefinition } from '../../domain/entities/level-definition';
import { LevelNotFoundError } from '../../domain/errors/level-errors';
import { LevelRepository } from '../ports/level-repository';

/** Returns a single level definition or throws {@link LevelNotFoundError}. */
@Injectable()
export class GetLevelUseCase {
  constructor(private readonly levels: LevelRepository) {}

  async execute(id: number): Promise<LevelDefinition> {
    const level = await this.levels.getById(id);
    if (!level) {
      throw new LevelNotFoundError(id);
    }
    return level;
  }
}
