import { DomainError } from './domain-error';

export class LevelNotFoundError extends DomainError {
  readonly status = 404;
  constructor(id: number) {
    super(`Level ${id} was not found.`);
  }
}
