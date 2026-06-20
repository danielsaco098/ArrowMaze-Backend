import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../../domain/errors/domain-error';

/**
 * Cross-cutting concern (AOP): centralizes the translation of domain errors into
 * consistent HTTP responses. Use cases throw plain {@link DomainError}s and never
 * import anything HTTP-related; this filter maps them in one place.
 */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    response.status(exception.status).json({
      statusCode: exception.status,
      error: exception.name,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
