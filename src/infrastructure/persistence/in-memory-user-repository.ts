import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user';
import { UserRepository } from '../../application/ports/user-repository';

/**
 * In-memory {@link UserRepository}. Functional and dependency-free (great for
 * demos and tests); a database-backed adapter can replace it without touching
 * the use cases.
 */
@Injectable()
export class InMemoryUserRepository extends UserRepository {
  private readonly byId = new Map<string, User>();

  async findByUsername(username: string): Promise<User | null> {
    return [...this.byId.values()].find((user) => user.username === username) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.byId.get(id) ?? null;
  }

  async save(user: User): Promise<void> {
    this.byId.set(user.id, user);
  }
}
