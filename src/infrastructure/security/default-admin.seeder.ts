import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../../domain/entities/user';
import { UserRepository } from '../../application/ports/user-repository';
import { PasswordHasher } from '../../application/ports/password-hasher';
import { IdGenerator } from '../../application/ports/id-generator';

/**
 * Seeds a default admin account on startup (idempotent) so the admin-only
 * endpoints are usable out of the box. Credentials come from configuration.
 */
@Injectable()
export class DefaultAdminSeeder implements OnModuleInit {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly ids: IdGenerator,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const username = this.config.get<string>('admin.username') ?? 'admin';
    const password = this.config.get<string>('admin.password') ?? 'admin12345';

    if (await this.users.findByUsername(username)) {
      return;
    }
    const passwordHash = await this.hasher.hash(password);
    await this.users.save(new User(this.ids.generate(), username, passwordHash, 'admin', new Date()));
  }
}
