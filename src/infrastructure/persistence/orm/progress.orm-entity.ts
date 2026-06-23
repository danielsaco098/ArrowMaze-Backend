import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * TypeORM persistence model for a player's best score on a level. The composite
 * primary key (userId, levelId) enforces one row per user per level, so saving a
 * new best is a plain upsert.
 */
@Entity('progress')
export class ProgressOrmEntity {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('int')
  levelId: number;

  @Column('int')
  bestScore: number;
}
