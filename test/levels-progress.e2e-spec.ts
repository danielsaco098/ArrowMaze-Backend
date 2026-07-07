import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/shared/filters/domain-exception.filter';

describe('Levels, progress and leaderboard (e2e)', () => {
  let app: INestApplication;
  let playerToken: string;

  async function token(username: string, password: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username, password })
      .expect(201);
    return res.body.accessToken as string;
  }

  async function adminToken(): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin12345' })
      .expect(200);
    return res.body.accessToken as string;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
    playerToken = await token('player_e2e', 'secret123');
  });

  afterAll(async () => {
    await app.close();
  });

  it('should_list_seeded_levels', async () => {
    const res = await request(app.getHttpServer()).get('/levels').expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
    expect(res.body[0]).toHaveProperty('cells');
  });

  it('should_return_404_for_an_unknown_level', async () => {
    await request(app.getHttpServer()).get('/levels/999').expect(404);
  });

  it('should_forbid_level_upsert_without_a_token', async () => {
    await request(app.getHttpServer())
      .put('/levels/10')
      .send({ name: 'X', difficulty: 'EASY', rows: 1, cols: 1, cells: [{ row: 0, col: 0, kind: 'EMPTY' }] })
      .expect(401);
  });

  it('should_forbid_level_upsert_for_a_non_admin', async () => {
    await request(app.getHttpServer())
      .put('/levels/10')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ name: 'X', difficulty: 'EASY', rows: 1, cols: 1, cells: [{ row: 0, col: 0, kind: 'EMPTY' }] })
      .expect(403);
  });

  it('should_allow_an_admin_to_upsert_a_level', async () => {
    const admin = await adminToken();
    await request(app.getHttpServer())
      .put('/levels/10')
      .set('Authorization', `Bearer ${admin}`)
      .send({
        name: 'Admin Level',
        difficulty: 'HARD',
        rows: 1,
        cols: 2,
        cells: [{ row: 0, col: 0, kind: 'ARROW', direction: 'RIGHT' }],
      })
      .expect(200);

    const res = await request(app.getHttpServer()).get('/levels/10').expect(200);
    expect(res.body.name).toBe('Admin Level');
  });

  it('should_require_a_token_to_read_progress', async () => {
    await request(app.getHttpServer()).get('/progress').expect(401);
  });

  it('should_sync_progress_and_reflect_it_on_the_leaderboard', async () => {
    await request(app.getHttpServer())
      .post('/progress/sync')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ results: [{ levelId: 1, score: 880 }] })
      .expect(201);

    const progress = await request(app.getHttpServer())
      .get('/progress')
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(200);
    expect(progress.body).toEqual([{ levelId: 1, bestScore: 880 }]);

    const leaderboard = await request(app.getHttpServer()).get('/leaderboard/1').expect(200);
    expect(leaderboard.body[0]).toMatchObject({ username: 'player_e2e', score: 880 });
  });

  it('should_expose_the_overall_ranking_summing_best_scores_across_levels', async () => {
    await request(app.getHttpServer())
      .post('/progress/sync')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ results: [{ levelId: 2, score: 620 }] })
      .expect(201);

    const overall = await request(app.getHttpServer()).get('/leaderboard').expect(200);
    // 880 (level 1, previous test) + 620 (level 2) = 1500 across 2 levels.
    expect(overall.body[0]).toMatchObject({
      username: 'player_e2e',
      totalScore: 1500,
      levelsPlayed: 2,
    });
  });
});
