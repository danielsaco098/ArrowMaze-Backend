import { SyncProgressUseCase } from './sync-progress.use-case';
import { GetLeaderboardUseCase } from './get-leaderboard.use-case';
import { InMemoryProgressRepository } from '../../infrastructure/persistence/in-memory-progress-repository';
import { InMemoryLeaderboardRepository } from '../../infrastructure/persistence/in-memory-leaderboard-repository';

function buildSubject() {
  const progress = new InMemoryProgressRepository();
  const leaderboard = new InMemoryLeaderboardRepository();
  return {
    progress,
    leaderboard,
    sync: new SyncProgressUseCase(progress, leaderboard),
    getLeaderboard: new GetLeaderboardUseCase(leaderboard),
  };
}

describe('SyncProgressUseCase', () => {
  it('should_return_updated_progress_when_results_are_synced', async () => {
    const { sync } = buildSubject();

    const progress = await sync.execute({
      userId: 'u1',
      username: 'alice',
      results: [
        { levelId: 1, score: 800 },
        { levelId: 2, score: 600 },
      ],
    });

    expect(progress).toEqual([
      { levelId: 1, bestScore: 800 },
      { levelId: 2, bestScore: 600 },
    ]);
  });

  it('should_keep_only_the_higher_score_when_syncing_again', async () => {
    const { sync } = buildSubject();
    await sync.execute({ userId: 'u1', username: 'alice', results: [{ levelId: 1, score: 800 }] });

    const lower = await sync.execute({
      userId: 'u1',
      username: 'alice',
      results: [{ levelId: 1, score: 500 }],
    });
    expect(lower).toEqual([{ levelId: 1, bestScore: 800 }]);

    const higher = await sync.execute({
      userId: 'u1',
      username: 'alice',
      results: [{ levelId: 1, score: 950 }],
    });
    expect(higher).toEqual([{ levelId: 1, bestScore: 950 }]);
  });

  it('should_rank_players_by_score_when_the_leaderboard_is_read', async () => {
    const { sync, getLeaderboard } = buildSubject();
    await sync.execute({ userId: 'u1', username: 'alice', results: [{ levelId: 1, score: 800 }] });
    await sync.execute({ userId: 'u2', username: 'bob', results: [{ levelId: 1, score: 950 }] });
    await sync.execute({ userId: 'u3', username: 'cara', results: [{ levelId: 1, score: 700 }] });

    const top = await getLeaderboard.execute(1, 2);

    expect(top.map((e) => e.username)).toEqual(['bob', 'alice']);
    expect(top).toHaveLength(2);
  });
});
