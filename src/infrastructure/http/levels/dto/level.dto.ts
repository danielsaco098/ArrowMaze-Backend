import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;
const CELL_KINDS = ['ARROW', 'WALL', 'EMPTY', 'EXIT'] as const;
const DIRECTIONS = ['UP', 'DOWN', 'LEFT', 'RIGHT'] as const;

export class CellDataDto {
  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  row!: number;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  col!: number;

  @ApiProperty({ enum: CELL_KINDS })
  @IsEnum(CELL_KINDS)
  kind!: (typeof CELL_KINDS)[number];

  @ApiPropertyOptional({ enum: DIRECTIONS })
  @IsOptional()
  @IsEnum(DIRECTIONS)
  direction?: (typeof DIRECTIONS)[number];
}

export class UpsertLevelDto {
  @ApiProperty({ example: 'First Steps' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name!: string;

  @ApiProperty({ enum: DIFFICULTIES })
  @IsEnum(DIFFICULTIES)
  difficulty!: (typeof DIFFICULTIES)[number];

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  rows!: number;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  cols!: number;

  @ApiProperty({ type: [CellDataDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CellDataDto)
  cells!: CellDataDto[];
}

export class LevelResponseDto extends UpsertLevelDto {
  @ApiProperty({ example: 1 })
  id!: number;
}
