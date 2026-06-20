import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { SyncProgressUseCase } from '../application/use-cases/sync-progress.use-case';
import { GetProgressUseCase } from '../application/use-cases/get-progress.use-case';
import { GetLeaderboardUseCase } from '../application/use-cases/get-leaderboard.use-case';
import { ProgressRepository } from '../application/ports/progress-repository';
import { LeaderboardRepository } from '../application/ports/leaderboard-repository';
import { ProgressController } from '../infrastructure/http/progress/progress.controller';
import { LeaderboardController } from '../infrastructure/http/progress/leaderboard.controller';
import { InMemoryProgressRepository } from '../infrastructure/persistence/in-memory-progress-repository';
import { InMemoryLeaderboardRepository } from '../infrastructure/persistence/in-memory-leaderboard-repository';

@Module({
  imports: [AuthModule],
  controllers: [ProgressController, LeaderboardController],
  providers: [
    SyncProgressUseCase,
    GetProgressUseCase,
    GetLeaderboardUseCase,
    { provide: ProgressRepository, useClass: InMemoryProgressRepository },
    { provide: LeaderboardRepository, useClass: InMemoryLeaderboardRepository },
  ],
})
export class ProgressModule {}
