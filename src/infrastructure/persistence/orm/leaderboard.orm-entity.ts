import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * TypeORM persistence model for a leaderboard entry. The composite primary key
 * (levelId, userId) keeps a single best entry per user per level.
 */
@Entity('leaderboard')
export class LeaderboardOrmEntity {
  @PrimaryColumn('int')
  levelId: number;

  @PrimaryColumn('uuid')
  userId: string;

  @Column()
  username: string;

  @Column('int')
  score: number;

  @Column({ type: 'timestamptz' })
  achievedAt: Date;
}
