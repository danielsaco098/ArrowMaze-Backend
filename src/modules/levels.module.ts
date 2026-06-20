import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { GetLevelsUseCase } from '../application/use-cases/get-levels.use-case';
import { GetLevelUseCase } from '../application/use-cases/get-level.use-case';
import { UpsertLevelUseCase } from '../application/use-cases/upsert-level.use-case';
import { LevelRepository } from '../application/ports/level-repository';
import { LevelsController } from '../infrastructure/http/levels/levels.controller';
import { InMemoryLevelRepository } from '../infrastructure/persistence/in-memory-level-repository';
import { AdminGuard } from '../infrastructure/security/admin.guard';

@Module({
  imports: [AuthModule],
  controllers: [LevelsController],
  providers: [
    GetLevelsUseCase,
    GetLevelUseCase,
    UpsertLevelUseCase,
    AdminGuard,
    { provide: LevelRepository, useClass: InMemoryLevelRepository },
  ],
})
export class LevelsModule {}
