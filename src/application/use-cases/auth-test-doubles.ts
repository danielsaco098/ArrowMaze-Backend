import { User } from '../../domain/entities/user';
import { UserRepository } from '../ports/user-repository';
import { PasswordHasher } from '../ports/password-hasher';
import { TokenService, TokenPayload } from '../ports/token-service';
import { IdGenerator } from '../ports/id-generator';

/** In-memory user store for use-case tests. */
export class FakeUserRepository extends UserRepository {
  private readonly byId = new Map<string, User>();

  async findByUsername(username: string): Promise<User | null> {
    return [...this.byId.values()].find((u) => u.username === username) ?? null;
  }
  async findById(id: string): Promise<User | null> {
    return this.byId.get(id) ?? null;
  }
  async save(user: User): Promise<void> {
    this.byId.set(user.id, user);
  }
}

/** Deterministic hasher: "hashed:<plain>", so compare is trivial to reason about. */
export class FakeHasher extends PasswordHasher {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }
  async compare(plain: string, hash: string): Promise<boolean> {
    return hash === `hashed:${plain}`;
  }
}

export class FakeTokenService extends TokenService {
  async sign(payload: TokenPayload): Promise<string> {
    return `token:${payload.sub}`;
  }
  async verify(token: string): Promise<TokenPayload> {
    return { sub: token.replace('token:', ''), username: 'x', role: 'user' };
  }
}

export class SequentialIdGenerator extends IdGenerator {
  private counter = 0;
  generate(): string {
    this.counter += 1;
    return `id-${this.counter}`;
  }
}
