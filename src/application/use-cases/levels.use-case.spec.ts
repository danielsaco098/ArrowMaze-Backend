import { GetLevelsUseCase } from './get-levels.use-case';
import { GetLevelUseCase } from './get-level.use-case';
import { UpsertLevelUseCase } from './upsert-level.use-case';
import { LevelNotFoundError } from '../../domain/errors/level-errors';
import { InMemoryLevelRepository } from '../../infrastructure/persistence/in-memory-level-repository';

function buildSubject() {
  const repo = new InMemoryLevelRepository();
  return {
    repo,
    getLevels: new GetLevelsUseCase(repo),
    getLevel: new GetLevelUseCase(repo),
    upsertLevel: new UpsertLevelUseCase(repo),
  };
}

describe('Levels use cases', () => {
  it('should_return_levels_sorted_by_id_when_listing_the_seed', async () => {
    const { getLevels } = buildSubject();

    const levels = await getLevels.execute();

    expect(levels.map((l) => l.id)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
  });

  it('should_return_the_level_when_queried_by_id', async () => {
    const { getLevel } = buildSubject();

    const level = await getLevel.execute(1);

    expect(level.name).toBe('First Steps');
  });

  it('should_seed_levels_with_multi_cell_arrows_grouped_by_arrowId', async () => {
    const { getLevels } = buildSubject();

    const levels = await getLevels.execute();

    // Every seeded level encodes arrows via arrowId, and at least one arrow
    // spans multiple cells (the whole point of the multi-cell format).
    const hasMultiCellArrow = levels.some((level) => {
      const counts = new Map<number, number>();
      for (const cell of level.cells) {
        if (cell.arrowId !== undefined) {
          counts.set(cell.arrowId, (counts.get(cell.arrowId) ?? 0) + 1);
        }
      }
      return [...counts.values()].some((count) => count > 1);
    });
    expect(hasMultiCellArrow).toBe(true);
  });

  it('should_throw_LevelNotFoundError_for_an_unknown_id', async () => {
    const { getLevel } = buildSubject();

    await expect(getLevel.execute(999)).rejects.toThrow(LevelNotFoundError);
  });

  it('should_make_the_level_retrievable_when_a_new_one_is_upserted', async () => {
    const { getLevel, upsertLevel } = buildSubject();

    await upsertLevel.execute({
      id: 42,
      name: 'Custom',
      difficulty: 'HARD',
      rows: 2,
      cols: 2,
      cells: [{ row: 0, col: 0, kind: 'ARROW', direction: 'RIGHT' }],
    });

    const level = await getLevel.execute(42);
    expect(level.name).toBe('Custom');
    expect(level.difficulty).toBe('HARD');
  });

  it('should_overwrite_the_level_when_the_id_already_exists', async () => {
    const { getLevel, upsertLevel } = buildSubject();

    await upsertLevel.execute({
      id: 1,
      name: 'Renamed',
      difficulty: 'EASY',
      rows: 1,
      cols: 1,
      cells: [{ row: 0, col: 0, kind: 'ARROW', direction: 'UP' }],
    });

    expect((await getLevel.execute(1)).name).toBe('Renamed');
  });
});
