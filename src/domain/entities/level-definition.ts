export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type CellKind = 'ARROW' | 'WALL' | 'EMPTY' | 'EXIT';
export type DirectionName = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface CellData {
  row: number;
  col: number;
  kind: CellKind;
  direction?: DirectionName;
}

/**
 * Server-side definition of a playable level. The client fetches these so new
 * levels can ship without an app update.
 */
export class LevelDefinition {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly difficulty: Difficulty,
    public readonly rows: number,
    public readonly cols: number,
    public readonly cells: ReadonlyArray<CellData>,
  ) {}
}
