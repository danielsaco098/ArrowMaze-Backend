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
