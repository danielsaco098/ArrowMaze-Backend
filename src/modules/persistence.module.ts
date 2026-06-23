import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserRepository } from '../application/ports/user-repository';
import { ProgressRepository } from '../application/ports/progress-repository';
import { LeaderboardRepository } from '../application/ports/leaderboard-repository';
import { LevelRepository } from '../application/ports/level-repository';

import { InMemoryUserRepository } from '../infrastructure/persistence/in-memory-user-repository';
import { InMemoryProgressRepository } from '../infrastructure/persistence/in-memory-progress-repository';
import { InMemoryLeaderboardRepository } from '../infrastructure/persistence/in-memory-leaderboard-repository';
import { InMemoryLevelRepository } from '../infrastructure/persistence/in-memory-level-repository';

import { TypeOrmUserRepository } from '../infrastructure/persistence/typeorm/typeorm-user-repository';
import { TypeOrmProgressRepository } from '../infrastructure/persistence/typeorm/typeorm-progress-repository';
import { TypeOrmLeaderboardRepository } from '../infrastructure/persistence/typeorm/typeorm-leaderboard-repository';

import { UserOrmEntity } from '../infrastructure/persistence/orm/user.orm-entity';
import { ProgressOrmEntity } from '../infrastructure/persistence/orm/progress.orm-entity';
import { LeaderboardOrmEntity } from '../infrastructure/persistence/orm/leaderboard.orm-entity';

const ORM_ENTITIES = [UserOrmEntity, ProgressOrmEntity, LeaderboardOrmEntity];

const REPOSITORY_TOKENS = [
  UserRepository,
  ProgressRepository,
  LeaderboardRepository,
  LevelRepository,
];

/**
 * Selects the persistence implementation at startup and wires every repository
 * port to a concrete adapter. When a `DATABASE_URL` is configured it uses the
 * Postgres (TypeORM) adapters; otherwise — and always under tests — it falls
 * back to the dependency-free in-memory adapters, so unit/e2e tests need no
 * database. Levels are static game content and stay in-memory either way.
 *
 * Declared global so feature modules get the repositories by injecting the port
 * (Dependency Inversion) without re-declaring providers.
 */
@Module({})
export class PersistenceModule {
  static forRoot(): DynamicModule {
    return usePostgres() ? postgresModule() : inMemoryModule();
  }
}

/** Use a real database only when a URL is set and we are not running tests. */
function usePostgres(): boolean {
  return Boolean(process.env.DATABASE_URL) && process.env.NODE_ENV !== 'test';
}

function postgresModule(): DynamicModule {
  const providers: Provider[] = [
    { provide: UserRepository, useClass: TypeOrmUserRepository },
    { provide: ProgressRepository, useClass: TypeOrmProgressRepository },
    { provide: LeaderboardRepository, useClass: TypeOrmLeaderboardRepository },
    { provide: LevelRepository, useClass: InMemoryLevelRepository },
  ];
  return {
    module: PersistenceModule,
    global: true,
    imports: [
      TypeOrmModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          type: 'postgres' as const,
          url: config.get<string>('database.url'),
          entities: ORM_ENTITIES,
          synchronize: config.get<boolean>('database.synchronize') ?? true,
          ssl: config.get<boolean>('database.ssl') ? { rejectUnauthorized: false } : false,
        }),
      }),
      TypeOrmModule.forFeature(ORM_ENTITIES),
    ],
    providers,
    exports: REPOSITORY_TOKENS,
  };
}

function inMemoryModule(): DynamicModule {
  const providers: Provider[] = [
    { provide: UserRepository, useClass: InMemoryUserRepository },
    { provide: ProgressRepository, useClass: InMemoryProgressRepository },
    { provide: LeaderboardRepository, useClass: InMemoryLeaderboardRepository },
    { provide: LevelRepository, useClass: InMemoryLevelRepository },
  ];
  return {
    module: PersistenceModule,
    global: true,
    providers,
    exports: REPOSITORY_TOKENS,
  };
}
