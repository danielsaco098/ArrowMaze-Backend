import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { SyncProgressUseCase } from '../application/use-cases/sync-progress.use-case';
import { GetProgressUseCase } from '../application/use-cases/get-progress.use-case';
import {
  GetLeaderboardUseCase,
  GetOverallLeaderboardUseCase,
} from '../application/use-cases/get-leaderboard.use-case';
import { ProgressController } from '../infrastructure/http/progress/progress.controller';
import { LeaderboardController } from '../infrastructure/http/progress/leaderboard.controller';

// Progress and leaderboard repositories come from the global PersistenceModule.
@Module({
  imports: [AuthModule],
  controllers: [ProgressController, LeaderboardController],
  providers: [
    SyncProgressUseCase,
    GetProgressUseCase,
    GetLeaderboardUseCase,
    GetOverallLeaderboardUseCase,
  ],
})
export class ProgressModule {}
