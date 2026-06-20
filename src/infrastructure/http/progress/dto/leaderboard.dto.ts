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
