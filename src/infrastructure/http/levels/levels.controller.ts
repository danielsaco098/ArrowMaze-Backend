import { Body, Controller, Get, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetLevelsUseCase } from '../../../application/use-cases/get-levels.use-case';
import { GetLevelUseCase } from '../../../application/use-cases/get-level.use-case';
import { UpsertLevelUseCase } from '../../../application/use-cases/upsert-level.use-case';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { AdminGuard } from '../../security/admin.guard';
import { LevelResponseDto, UpsertLevelDto } from './dto/level.dto';

@ApiTags('levels')
@Controller('levels')
export class LevelsController {
  constructor(
    private readonly getLevels: GetLevelsUseCase,
    private readonly getLevel: GetLevelUseCase,
    private readonly upsertLevel: UpsertLevelUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all level definitions' })
  @ApiOkResponse({ type: LevelResponseDto, isArray: true })
  list(): Promise<LevelResponseDto[]> {
    return this.getLevels.execute() as unknown as Promise<LevelResponseDto[]>;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single level definition' })
  @ApiOkResponse({ type: LevelResponseDto })
  @ApiNotFoundResponse({ description: 'Level not found' })
  getOne(@Param('id', ParseIntPipe) id: number): Promise<LevelResponseDto> {
    return this.getLevel.execute(id) as unknown as Promise<LevelResponseDto>;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update a level definition (admin only)' })
  @ApiOkResponse({ type: LevelResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Admin privileges required' })
  upsert(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertLevelDto,
  ): Promise<LevelResponseDto> {
    return this.upsertLevel.execute({ id, ...dto }) as unknown as Promise<LevelResponseDto>;
  }
}
