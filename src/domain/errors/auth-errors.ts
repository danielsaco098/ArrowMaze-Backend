import { DomainError } from './domain-error';

export class UsernameTakenError extends DomainError {
  readonly status = 409;
  constructor(username: string) {
    super(`Username "${username}" is already taken.`);
  }
}

export class InvalidCredentialsError extends DomainError {
  readonly status = 401;
  constructor() {
    super('Invalid username or password.');
  }
}

export class UserNotFoundError extends DomainError {
  readonly status = 404;
  constructor(id: string) {
    super(`User ${id} was not found.`);
  }
}
