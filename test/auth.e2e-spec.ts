import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/shared/filters/domain-exception.filter';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should_register_then_login_and_return_a_token', async () => {
    const credentials = { username: 'e2euser', password: 'secret123' };

    const registered = await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentials)
      .expect(201);
    expect(registered.body.accessToken).toEqual(expect.any(String));
    expect(registered.body.user.username).toBe('e2euser');

    const loggedIn = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(200);
    expect(loggedIn.body.accessToken).toEqual(expect.any(String));
  });

  it('should_reject_a_duplicate_username_with_409', async () => {
    const credentials = { username: 'dupe', password: 'secret123' };
    await request(app.getHttpServer()).post('/auth/register').send(credentials).expect(201);
    await request(app.getHttpServer()).post('/auth/register').send(credentials).expect(409);
  });

  it('should_reject_invalid_credentials_with_401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'ghostuser', password: 'whatever1' })
      .expect(401);
  });

  it('should_reject_a_malformed_payload_with_400', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'ab' })
      .expect(400);
  });

  it('should_report_health_ok', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);
    expect(response.body.status).toBe('ok');
  });
});
