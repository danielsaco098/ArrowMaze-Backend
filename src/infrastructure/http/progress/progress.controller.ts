import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { GetProgressUseCase } from '../../../application/use-cases/get-progress.use-case';
import { SyncProgressUseCase } from '../../../application/use-cases/sync-progress.use-case';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { CurrentUser } from '../../security/current-user.decorator';
import type { AuthenticatedUser } from '../../security/jwt.strategy';
import { ProgressRecordDto, SyncProgressDto } from './dto/progress.dto';

@ApiTags('progress')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(
    private readonly getProgress: GetProgressUseCase,
    private readonly syncProgress: SyncProgressUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get the authenticated player's progress" })
  @ApiOkResponse({ type: ProgressRecordDto, isArray: true })
  get(@CurrentUser() user: AuthenticatedUser): Promise<ProgressRecordDto[]> {
    return this.getProgress.execute(user.userId);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync level results and return the updated progress' })
  @ApiOkResponse({ type: ProgressRecordDto, isArray: true })
  sync(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SyncProgressDto,
  ): Promise<ProgressRecordDto[]> {
    return this.syncProgress.execute({
      userId: user.userId,
      username: user.username,
      results: dto.results,
    });
  }
}
