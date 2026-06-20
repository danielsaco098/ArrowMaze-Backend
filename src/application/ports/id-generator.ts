/** Port for generating unique identifiers (DI token + abstraction). */
export abstract class IdGenerator {
  abstract generate(): string;
}
