import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Verifier } from '@pact-foundation/pact';
import * as path from 'path';
import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/shared/filters/domain-exception.filter';

const PORT = 3111;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * Provider-side Pact verification: replays every interaction recorded by the
 * client's consumer tests (test/pacts/*.json) against the REAL NestJS app
 * (in-memory persistence — no database needed). Provider states reset the app
 * and seed exactly what each interaction assumes; the request filter swaps the
 * consumer's example token for a real one issued by this app.
 */
describe('Pact provider verification', () => {
  let app: INestApplication | null = null;
  let currentToken = '';

  async function resetApp(): Promise<void> {
    if (app) {
      await app.close();
    }
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.listen(PORT, '127.0.0.1');
  }

  async function register(username: string, password: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const body = (await res.json()) as { accessToken: string };
    return body.accessToken;
  }

  async function syncScore(token: string, levelId: number, score: number): Promise<void> {
    await fetch(`${BASE_URL}/progress/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ results: [{ levelId, score }] }),
    });
  }

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should_honor_every_consumer_interaction_when_replayed_against_the_real_api', async () => {
    await resetApp();

    await new Verifier({
      provider: 'ArrowMaze-Backend',
      providerBaseUrl: BASE_URL,
      pactUrls: [path.resolve(__dirname, 'pacts', 'ArrowMaze-Client-ArrowMaze-Backend.json')],
      logLevel: 'warn',
      stateHandlers: {
        'the username pact_user is available': async () => {
          await resetApp(); // fresh in-memory store: no users besides the admin seed
        },
        'a user pact_user with password secret123 exists': async () => {
          await resetApp();
          await register('pact_user', 'secret123');
        },
        'the level seed is loaded': async () => {
          await resetApp(); // levels are seeded on boot
        },
        'scores exist on level 1': async () => {
          await resetApp();
          const token = await register('pact_user', 'secret123');
          await syncScore(token, 1, 880);
        },
        'an authenticated player exists': async () => {
          await resetApp();
          currentToken = await register('pact_player', 'secret123');
          // GET /progress must return at least one record.
          await syncScore(currentToken, 1, 880);
        },
      },
      // The consumer records a placeholder token; swap in one this app issued.
      requestFilter: (req, _res, next) => {
        if (req.headers.authorization) {
          req.headers.authorization = `Bearer ${currentToken}`;
        }
        next();
      },
    }).verifyProvider();
  });
});
