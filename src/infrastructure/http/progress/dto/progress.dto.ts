import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, Min, ValidateNested } from 'class-validator';

export class LevelResultDto {
  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  levelId!: number;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  score!: number;
}

export class SyncProgressDto {
  @ApiProperty({ type: [LevelResultDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LevelResultDto)
  results!: LevelResultDto[];
}

export class ProgressRecordDto {
  @ApiProperty({ example: 1 })
  levelId!: number;

  @ApiProperty({ example: 890 })
  bestScore!: number;
}
