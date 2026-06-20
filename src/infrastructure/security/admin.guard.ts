import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

/** Allows the request only when the authenticated user has the `admin` role. */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: { role?: string } }>();
    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('Admin privileges are required.');
    }
    return true;
  }
}
