import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * TypeORM persistence model for a user. Kept separate from the domain {@link
 * User} entity so the domain layer stays free of framework/ORM concerns; the
 * repository maps between the two.
 */
@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column()
  role: string;

  @Column({ type: 'timestamptz' })
  createdAt: Date;
}
