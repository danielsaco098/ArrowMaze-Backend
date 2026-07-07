import {
  GetLeaderboardUseCase,
  GetOverallLeaderboardUseCase,
} from './get-leaderboard.use-case';
import { LeaderboardEntry } from '../../domain/entities/leaderboard-entry';
import { InMemoryLeaderboardRepository } from '../../infrastructure/persistence/in-memory-leaderboard-repository';

const entry = (levelId: number, userId: string, score: number): LeaderboardEntry =>
  new LeaderboardEntry(levelId, userId, userId, score, new Date('2026-07-01T00:00:00Z'));

describe('Leaderboard use cases', () => {
  it('should_return_the_top_scores_for_a_level_highest_first', async () => {
    // Arrange
    const repo = new InMemoryLeaderboardRepository();
    await repo.record(entry(1, 'ana', 800));
    await repo.record(entry(1, 'bob', 950));
    const useCase = new GetLeaderboardUseCase(repo);

    // Act
    const top = await useCase.execute(1);

    // Assert
    expect(top.map((e) => e.username)).toEqual(['bob', 'ana']);
  });

  it('should_sum_each_players_best_scores_across_levels_for_the_overall_ranking', async () => {
    // Arrange
    const repo = new InMemoryLeaderboardRepository();
    await repo.record(entry(1, 'ana', 800));
    await repo.record(entry(2, 'ana', 700));
    await repo.record(entry(1, 'bob', 950));
    const useCase = new GetOverallLeaderboardUseCase(repo);

    // Act
    const overall = await useCase.execute();

    // Assert: ana 1500 across 2 levels beats bob 950 across 1
    expect(overall.map((e) => [e.username, e.totalScore, e.levelsPlayed])).toEqual([
      ['ana', 1500, 2],
      ['bob', 950, 1],
    ]);
  });

  it('should_clamp_the_limit_to_the_allowed_range', async () => {
    // Arrange
    const repo = new InMemoryLeaderboardRepository();
    await repo.record(entry(1, 'ana', 800));
    await repo.record(entry(1, 'bob', 950));
    const useCase = new GetOverallLeaderboardUseCase(repo);

    // Act: a non-positive limit is clamped up to 1
    const overall = await useCase.execute(0);

    // Assert
    expect(overall).toHaveLength(1);
    expect(overall[0].username).toBe('bob');
  });
});
