import { Injectable } from '@nestjs/common';
import { ProgressRecord } from '../../domain/entities/progress-record';
import { ProgressRepository } from '../ports/progress-repository';

/** Returns the authenticated player's stored progress. */
@Injectable()
export class GetProgressUseCase {
  constructor(private readonly progress: ProgressRepository) {}

  execute(userId: string): Promise<ProgressRecord[]> {
    return this.progress.getByUser(userId);
  }
}
