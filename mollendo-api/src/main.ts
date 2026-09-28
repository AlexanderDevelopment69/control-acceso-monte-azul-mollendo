import './common/zona-horaria.js';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { SWAGGER_FAVICON } from './common/swagger-favicon.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  // CORS_ORIGIN acepta uno o varios orígenes separados por coma (ej. para
  // permitir localhost y un túnel de ngrok al mismo tiempo).
  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);
  app.enableCors({ origin: corsOrigins });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // En producción solo si SWAGGER=true (p. ej. en la mini PC, red interna).
  if (process.env.NODE_ENV !== 'production' || process.env.SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Control de Acceso — Terminal de Mollendo')
      .setDescription('API del sistema de control de acceso (ver Especificacion_Desarrollo_Control_Acceso_Mollendo.md)')
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
