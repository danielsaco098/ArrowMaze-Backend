import { User } from '../../domain/entities/user';

/**
 * Port for user persistence. Declared as an abstract class so it doubles as a
 * NestJS dependency-injection token; concrete implementations live in Layer 4.
 */
export abstract class UserRepository {
  abstract findByUsername(username: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract save(user: User): Promise<void>;
}
