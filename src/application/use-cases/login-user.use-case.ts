import { Injectable } from '@nestjs/common';
import { InvalidCredentialsError } from '../../domain/errors/auth-errors';
import { UserRepository } from '../ports/user-repository';
import { PasswordHasher } from '../ports/password-hasher';
import { TokenService } from '../ports/token-service';
import type { AuthResult } from './register-user.use-case';

export interface LoginUserInput {
  username: string;
  password: string;
}

/**
 * Authenticates a player by username + password and issues an access token.
 * Returns the same generic error whether the user is missing or the password is
 * wrong, so the API never reveals which usernames exist.
 */
@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: LoginUserInput): Promise<AuthResult> {
    const user = await this.users.findByUsername(input.username);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.hasher.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const accessToken = await this.tokens.sign({
      sub: user.id,
      username: user.username,
      role: user.role,
    });
    return { accessToken, user: { id: user.id, username: user.username, role: user.role } };
  }
}
