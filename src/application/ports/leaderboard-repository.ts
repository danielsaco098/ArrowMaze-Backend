import { LeaderboardEntry } from '../../domain/entities/leaderboard-entry';

/** Port for the global leaderboard (DI token + abstraction). */
export abstract class LeaderboardRepository {
  /** Records a player's score for a level, keeping only their best. */
  abstract record(entry: LeaderboardEntry): Promise<void>;
  /** Returns the top entries for a level, highest score first. */
  abstract topForLevel(levelId: number, limit: number): Promise<LeaderboardEntry[]>;
}
