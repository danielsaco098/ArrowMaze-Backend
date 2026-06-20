import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guard that requires a valid JWT Bearer token on protected routes. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
