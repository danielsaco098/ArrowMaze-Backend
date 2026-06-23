import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { GetLevelsUseCase } from '../application/use-cases/get-levels.use-case';
import { GetLevelUseCase } from '../application/use-cases/get-level.use-case';
import { UpsertLevelUseCase } from '../application/use-cases/upsert-level.use-case';
import { LevelsController } from '../infrastructure/http/levels/levels.controller';
import { AdminGuard } from '../infrastructure/security/admin.guard';

// The level repository comes from the global PersistenceModule.
@Module({
  imports: [AuthModule],
  controllers: [LevelsController],
  providers: [GetLevelsUseCase, GetLevelUseCase, UpsertLevelUseCase, AdminGuard],
})
export class LevelsModule {}
