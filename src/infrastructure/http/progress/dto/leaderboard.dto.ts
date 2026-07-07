import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntryDto {
  @ApiProperty({ example: 1 })
  levelId!: number;

  @ApiProperty({ example: 'player1' })
  username!: string;

  @ApiProperty({ example: 990 })
  score!: number;

  @ApiProperty({ example: '2026-07-01T12:00:00.000Z' })
  achievedAt!: string;
}

export class OverallLeaderboardEntryDto {
  @ApiProperty({ example: 'player1' })
  username!: string;

  @ApiProperty({ example: 4350, description: 'Sum of best scores across all levels.' })
  totalScore!: number;

  @ApiProperty({ example: 5, description: 'Distinct levels contributing to the total.' })
  levelsPlayed!: number;
}
