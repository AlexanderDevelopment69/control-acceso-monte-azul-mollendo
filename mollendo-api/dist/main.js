import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api/v1');
    const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
        .split(',')
        .map((origen) => origen.trim())
        .filter(Boolean);
    app.enableCors({ origin: corsOrigins });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    if (process.env.NODE_ENV !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('Control de Acceso — Terminal de Mollendo')
            .setDescription('API del sistema de control de acceso (ver Especificacion_Desarrollo_Control_Acceso_Mollendo.md)')
            .setVersion('1.0')
            .addBearerAuth()
            .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'device-api-key')
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
    }
    await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
//# sourceMappingURL=main.js.map