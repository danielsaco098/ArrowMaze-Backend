import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './shared/config/configuration';
import { HealthController } from './infrastructure/http/health.controller';
import { AuthModule } from './modules/auth.module';
import { LevelsModule } from './modules/levels.module';
import { ProgressModule } from './modules/progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    AuthModule,
    LevelsModule,
    ProgressModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
