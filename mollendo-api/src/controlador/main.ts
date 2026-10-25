// Arranque en modo controlador (el Controlador (PC) en la garita cuando el
// servidor está en la nube): `node dist/controlador/main.js`. Ver ControladorService.
import '../common/zona-horaria.js';
import path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { ControladorModule } from './controlador.module.js';
import { RegistroArchivoLogger } from './registro-archivo.logger.js';

// El registro también queda en la carpeta de datos (sobrevive a una reinstalación del contenedor).
const carpeta = process.env.CONTROLADOR_DATOS?.trim() || '/app/datos-controlador';
const app = await NestFactory.createApplicationContext(ControladorModule, {
  logger: new RegistroArchivoLogger(path.join(carpeta, 'registro', 'controlador.log')),
});
app.enableShutdownHooks();
