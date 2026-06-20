import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../../application/ports/token-service';

export interface AuthenticatedUser {
  userId: string;
  username: string;
  role: string;
}

/** Validates incoming Bearer tokens and exposes the authenticated user on the request. */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret') ?? 'dev-secret-change-me',
    });
  }

  validate(payload: TokenPayload): AuthenticatedUser {
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}
