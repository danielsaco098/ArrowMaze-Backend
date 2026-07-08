import { User } from '../../domain/entities/user';
import { UsernameTakenError } from '../../domain/errors/auth-errors';
import { UserRepository } from '../ports/user-repository';
import { PasswordHasher } from '../ports/password-hasher';
import { TokenService } from '../ports/token-service';
import { IdGenerator } from '../ports/id-generator';

export interface RegisterUserInput {
  username: string;
  password: string;
}

export interface AuthResult {
  accessToken: string;
  user: { id: string; username: string; role: string };
}

/**
 * Registers a new player: rejects duplicate usernames, hashes the password,
 * persists the user and issues an access token. Depends only on ports.
 */
export class RegisterUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthResult> {
    const existing = await this.users.findByUsername(input.username);
    if (existing) {
      throw new UsernameTakenError(input.username);
    }

    const passwordHash = await this.hasher.hash(input.password);
    const user = new User(this.ids.generate(), input.username, passwordHash, 'user', new Date());
    await this.users.save(user);

    const accessToken = await this.tokens.sign({
      sub: user.id,
      username: user.username,
      role: user.role,
    });
    return { accessToken, user: { id: user.id, username: user.username, role: user.role } };
  }
}
