import './common/zona-horaria.js';
import { NestFactory } from '@nestjs/core';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { text } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { SWAGGER_FAVICON } from './common/swagger-favicon.js';
import { swaggerActivo } from './common/swagger.util.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // La IP real del usuario cuando el pedido llega por el portal (que reenvía
  // /api/v1 desde la red interna de Docker): se confía en el X-Forwarded-For
  // solo si viene de la propia máquina o de una red privada. La usa el límite
  // de intentos del login.
  app.set('trust proxy', 'loopback, uniquelocal');
  // Cabeceras de seguridad (nosniff, sin marcos de otros sitios, sin X-Powered-By, etc.).
  // Sin CSP: la API no sirve páginas, salvo Swagger, que usa scripts propios.
  // Recursos de otro origen permitidos: el portal (otro puerto) descarga fotos y archivos.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Respuestas comprimidas (gzip) para quien las acepte: la lista del personal pesa
  // ~430 KB con mil personas y ~20 KB comprimida (se nota con internet lento). Los PDF,
  // imágenes, Excel y ZIP ya vienen comprimidos y no se tocan.
  app.use(compression());

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
  // credentials: el portal manda la sesión en cookies (ver auth/cookies-sesion.ts).
  app.enableCors({ origin: corsOrigins, credentials: true, exposedHeaders: ['Content-Disposition'] });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // En producción solo si SWAGGER=true (p. ej. en la mini PC, red interna);
  // en la nube va apagado: mostraría a cualquiera todas las rutas de la API.
  if (swaggerActivo()) {
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
