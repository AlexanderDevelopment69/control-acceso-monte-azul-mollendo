import './common/zona-horaria.js';
import { NestFactory } from '@nestjs/core';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { text } from 'express';
import { AppModule } from './app.module.js';
import { SWAGGER_FAVICON } from './common/swagger-favicon.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // El equipo G4 Pro llama rutas fijas en la raíz (/iclock/cdata, etc.), sin
  // prefijo y sin poder configurarlo -- se excluyen del prefijo global.
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'iclock/(.*)', method: RequestMethod.ALL }],
  });

  // El equipo manda los cuerpos de /iclock/* como texto plano, tab/salto de
  // línea separado (table=rtlog, table=rtstate, etc.), casi nunca con un
  // Content-Type reconocible -- se fuerza a leerlos como texto siempre, antes
  // de que los parsers por defecto de Nest (json/urlencoded) los ignoren.
  app.use('/iclock', text({ type: () => true, limit: '2mb' }));
  // Depuración del equipo (PUSH_SDK_DEPURAR=true): anota cada pedido del G4 Pro
  // con su contenido, para estudiar qué informa (p. ej. el estado del alcoholímetro).
  if (process.env.PUSH_SDK_DEPURAR === 'true') {
    const registro = new Logger('G4ProDepurar');
    app.use('/iclock', (req: { method: string; originalUrl: string; body?: unknown }, _res: unknown, next: () => void) => {
      const cuerpo = typeof req.body === 'string' ? req.body.replace(/	/g, ' | ').slice(0, 3000) : '';
      if (!req.originalUrl.startsWith('/iclock/getrequest')) registro.log(`${req.method} ${req.originalUrl}${cuerpo ? `
${cuerpo}` : ''}`);
      next();
    });
  }
  // CORS_ORIGIN acepta uno o varios orígenes separados por coma (ej. para
  // permitir localhost y un túnel de ngrok al mismo tiempo).
  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);
  // Content-Disposition: el portal lee el nombre de los reportes que descarga.
  app.enableCors({ origin: corsOrigins, exposedHeaders: ['Content-Disposition'] });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // En producción solo si SWAGGER=true (p. ej. en la mini PC, red interna).
  if (process.env.NODE_ENV !== 'production' || process.env.SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Control de Acceso — Terminal de Mollendo')
      .setDescription('API del sistema de control de acceso (ver docs/especificacion/Especificacion_Desarrollo_Control_Acceso_Mollendo.md)')
      .setVersion('1.0')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'device-api-key')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'API · Control de Acceso Mollendo',
      customfavIcon: SWAGGER_FAVICON,
    });
  }

  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
