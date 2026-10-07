// Arranque en modo controlador de garita (la mini PC en la garita cuando el
// servidor está en la nube): `node dist/controlador/main.js`. Ver ControladorService.
import '../common/zona-horaria.js';
import { NestFactory } from '@nestjs/core';
import { ControladorModule } from './controlador.module.js';

const app = await NestFactory.createApplicationContext(ControladorModule);
app.enableShutdownHooks();
