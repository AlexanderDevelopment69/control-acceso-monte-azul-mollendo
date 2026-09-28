import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

// Levanta la API completa (como en main.ts) contra la base de datos del .env.
// Solo lee: no crea ni modifica datos.
describe('API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health responde y la base de datos está arriba', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('las rutas del portal piden sesión', async () => {
    await request(app.getHttpServer()).get('/api/v1/personas').expect(401);
    await request(app.getHttpServer()).patch('/api/v1/cuenta/password').send({}).expect(401);
  });

  it('las rutas de los equipos piden la clave de equipo', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/eventos-acceso/salida')
      .send({ tipoDocumentoIdentidad: 'DNI', numeroDocumento: '12345678' })
      .expect(401);
  });

  it('el login rechaza credenciales incorrectas', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ correo: 'nadie@mollendo.local', password: 'incorrecta' })
      .expect(401);
  });
});
