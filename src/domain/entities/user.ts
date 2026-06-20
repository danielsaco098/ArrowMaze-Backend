export type UserRole = 'user' | 'admin';

/**
 * Domain entity for a registered player. Holds the password *hash* only — the
 * domain never deals with plaintext passwords.
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
    public readonly createdAt: Date,
  ) {}

  isAdmin(): boolean {
    return this.role === 'admin';
  }
}
