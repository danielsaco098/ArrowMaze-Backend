/** A player's best score on a level, as shown on the global leaderboard. */
export class LeaderboardEntry {
  constructor(
    public readonly levelId: number,
    public readonly userId: string,
    public readonly username: string,
    public readonly score: number,
    public readonly achievedAt: Date,
  ) {}
}

/** A player's accumulated best scores across all levels (overall ranking). */
export class OverallLeaderboardEntry {
  constructor(
    public readonly userId: string,
    public readonly username: string,
    /** Sum of the player's best score on every level they completed. */
    public readonly totalScore: number,
    /** How many distinct levels contribute to the total. */
    public readonly levelsPlayed: number,
  ) {}
}
