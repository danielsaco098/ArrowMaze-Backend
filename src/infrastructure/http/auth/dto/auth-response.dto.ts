import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ example: 'b3f1c2e4-...' })
  id!: string;

  @ApiProperty({ example: 'player1' })
  username!: string;

  @ApiProperty({ example: 'user', enum: ['user', 'admin'] })
  role!: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT bearer token' })
  accessToken!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}
