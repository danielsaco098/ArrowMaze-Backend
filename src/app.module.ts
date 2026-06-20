import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './shared/config/configuration';
import { HealthController } from './infrastructure/http/health.controller';
import { AuthModule } from './modules/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
