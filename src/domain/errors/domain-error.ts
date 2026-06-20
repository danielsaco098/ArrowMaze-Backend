/**
 * Base class for domain rule violations. Each error carries the HTTP status it
 * maps to, so the centralized exception filter can translate it without the
 * domain knowing anything about HTTP.
 */
export abstract class DomainError extends Error {
  abstract readonly status: number;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
