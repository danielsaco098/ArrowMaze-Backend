import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { SyncProgressUseCase } from '../application/use-cases/sync-progress.use-case';
import { GetProgressUseCase } from '../application/use-cases/get-progress.use-case';
import {
  GetLeaderboardUseCase,
  GetOverallLeaderboardUseCase,
} from '../application/use-cases/get-leaderboard.use-case';
import { ProgressRepository } from '../application/ports/progress-repository';
import { LeaderboardRepository } from '../application/ports/leaderboard-repository';
import { ProgressController } from '../infrastructure/http/progress/progress.controller';
import { LeaderboardController } from '../infrastructure/http/progress/leaderboard.controller';

// Progress and leaderboard repositories come from the global PersistenceModule.
// Use cases are pure classes (no framework decorators), built via factories.
@Module({
  imports: [AuthModule],
  controllers: [ProgressController, LeaderboardController],
  providers: [
    {
      provide: SyncProgressUseCase,
      useFactory: (progress: ProgressRepository, leaderboard: LeaderboardRepository) =>
        new SyncProgressUseCase(progress, leaderboard),
      inject: [ProgressRepository, LeaderboardRepository],
    },
    {
      provide: GetProgressUseCase,
      useFactory: (progress: ProgressRepository) => new GetProgressUseCase(progress),
      inject: [ProgressRepository],
    },
    {
      provide: GetLeaderboardUseCase,
      useFactory: (leaderboard: LeaderboardRepository) => new GetLeaderboardUseCase(leaderboard),
      inject: [LeaderboardRepository],
    },
    {
      provide: GetOverallLeaderboardUseCase,
      useFactory: (leaderboard: LeaderboardRepository) =>
        new GetOverallLeaderboardUseCase(leaderboard),
      inject: [LeaderboardRepository],
    },
  ],
})
export class ProgressModule {}
