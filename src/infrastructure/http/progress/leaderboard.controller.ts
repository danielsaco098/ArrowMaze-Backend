import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetLeaderboardUseCase } from '../../../application/use-cases/get-leaderboard.use-case';
import { LeaderboardEntry } from '../../../domain/entities/leaderboard-entry';
import { LeaderboardEntryDto } from './dto/leaderboard.dto';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly getLeaderboard: GetLeaderboardUseCase) {}

  @Get(':levelId')
  @ApiOperation({ summary: 'Top scores for a level' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({ type: LeaderboardEntryDto, isArray: true })
  async forLevel(
    @Param('levelId', ParseIntPipe) levelId: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<LeaderboardEntryDto[]> {
    const entries = await this.getLeaderboard.execute(levelId, limit);
    return entries.map((entry: LeaderboardEntry) => ({
      levelId: entry.levelId,
      username: entry.username,
      score: entry.score,
      achievedAt: entry.achievedAt.toISOString(),
    }));
  }
}
