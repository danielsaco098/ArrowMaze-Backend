import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { GetLevelsUseCase } from '../application/use-cases/get-levels.use-case';
import { GetLevelUseCase } from '../application/use-cases/get-level.use-case';
import { UpsertLevelUseCase } from '../application/use-cases/upsert-level.use-case';
import { LevelRepository } from '../application/ports/level-repository';
import { LevelsController } from '../infrastructure/http/levels/levels.controller';
import { AdminGuard } from '../infrastructure/security/admin.guard';

// The level repository comes from the global PersistenceModule. Use cases are
// pure classes (no framework decorators), built via factories injecting the port.
@Module({
  imports: [AuthModule],
  controllers: [LevelsController],
  providers: [
    AdminGuard,
    {
      provide: GetLevelsUseCase,
      useFactory: (levels: LevelRepository) => new GetLevelsUseCase(levels),
      inject: [LevelRepository],
    },
    {
      provide: GetLevelUseCase,
      useFactory: (levels: LevelRepository) => new GetLevelUseCase(levels),
      inject: [LevelRepository],
    },
    {
      provide: UpsertLevelUseCase,
      useFactory: (levels: LevelRepository) => new UpsertLevelUseCase(levels),
      inject: [LevelRepository],
    },
  ],
})
export class LevelsModule {}
