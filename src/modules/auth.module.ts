import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../application/use-cases/login-user.use-case';
import { UserRepository } from '../application/ports/user-repository';
import { PasswordHasher } from '../application/ports/password-hasher';
import { TokenService } from '../application/ports/token-service';
import { IdGenerator } from '../application/ports/id-generator';
import { AuthController } from '../infrastructure/http/auth/auth.controller';
import { BcryptPasswordHasher } from '../infrastructure/security/bcrypt-password-hasher';
import { JwtTokenService } from '../infrastructure/security/jwt-token-service';
import { UuidIdGenerator } from '../infrastructure/security/uuid-id-generator';
import { JwtStrategy } from '../infrastructure/security/jwt.strategy';
import { DefaultAdminSeeder } from '../infrastructure/security/default-admin.seeder';

/**
 * Wires the auth slice: maps each application port (abstract class) to its
 * concrete Layer 4 implementation, so use cases depend only on abstractions
 * (Dependency Inversion). The user store comes from the global PersistenceModule;
 * this module exports passport/JWT so other modules can reuse the guard.
 */
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        // jsonwebtoken types `expiresIn` as a `ms` StringValue; a plain duration
        // string ("1d") is valid at runtime, so we assert through `unknown`.
        signOptions: {
          expiresIn: (config.get<string>('jwt.expiresIn') ?? '1d') as unknown as number,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    DefaultAdminSeeder,
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: TokenService, useClass: JwtTokenService },
    { provide: IdGenerator, useClass: UuidIdGenerator },
    // Use cases are pure classes (no framework decorators), so they are built
    // via factories that inject the ports — Layer 2 stays Nest-free.
    {
      provide: RegisterUserUseCase,
      useFactory: (users: UserRepository, hasher: PasswordHasher, tokens: TokenService, ids: IdGenerator) =>
        new RegisterUserUseCase(users, hasher, tokens, ids),
      inject: [UserRepository, PasswordHasher, TokenService, IdGenerator],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (users: UserRepository, hasher: PasswordHasher, tokens: TokenService) =>
        new LoginUserUseCase(users, hasher, tokens),
      inject: [UserRepository, PasswordHasher, TokenService],
    },
  ],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
