import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IdGenerator } from '../../application/ports/id-generator';

/** {@link IdGenerator} backed by the Node crypto UUID generator. */
@Injectable()
export class UuidIdGenerator extends IdGenerator {
  generate(): string {
    return randomUUID();
  }
}
