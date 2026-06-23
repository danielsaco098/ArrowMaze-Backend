import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../../domain/entities/user';
import { UserRepository } from '../../../application/ports/user-repository';
import { UserOrmEntity } from '../orm/user.orm-entity';

/** Postgres-backed {@link UserRepository}, mapping rows to domain users. */
@Injectable()
export class TypeOrmUserRepository extends UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {
    super();
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = await this.repo.findOne({ where: { username } });
    return row ? toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async save(user: User): Promise<void> {
    await this.repo.save({
      id: user.id,
      username: user.username,
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: user.createdAt,
    });
  }
}

function toDomain(row: UserOrmEntity): User {
  return new User(row.id, row.username, row.passwordHash, row.role as UserRole, row.createdAt);
}
