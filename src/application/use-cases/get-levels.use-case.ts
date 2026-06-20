import { Injectable } from '@nestjs/common';
import { LevelDefinition } from '../../domain/entities/level-definition';
import { LevelRepository } from '../ports/level-repository';

/** Returns all level definitions, ordered by id. */
@Injectable()
export class GetLevelsUseCase {
  constructor(private readonly levels: LevelRepository) {}

  async execute(): Promise<LevelDefinition[]> {
    const all = await this.levels.getAll();
    return [...all].sort((a, b) => a.id - b.id);
  }
}
