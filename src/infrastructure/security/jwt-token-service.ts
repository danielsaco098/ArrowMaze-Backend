import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload, TokenService } from '../../application/ports/token-service';

/** {@link TokenService} backed by Nest's JwtService (HS256). */
@Injectable()
export class JwtTokenService extends TokenService {
  constructor(private readonly jwt: JwtService) {
    super();
  }

  sign(payload: TokenPayload): Promise<string> {
    return this.jwt.signAsync({ ...payload });
  }

  verify(token: string): Promise<TokenPayload> {
    return this.jwt.verifyAsync<TokenPayload>(token);
  }
}
