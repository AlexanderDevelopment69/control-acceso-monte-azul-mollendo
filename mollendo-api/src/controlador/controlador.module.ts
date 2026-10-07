import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReleUsbService } from '../integraciones/rele-usb.service.js';
import { LectoresDniService } from '../lectores-dni/lectores-dni.service.js';
import { RegistroLecturas } from '../lectores-dni/registro-lecturas.js';
import { ControladorService } from './controlador.service.js';

/**
 * Modo controlador de garita: solo lectores de DNI, relés de los molinetes y
 * la conexión con el servidor en la nube. Sin base de datos ni API propia.
 */
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    ReleUsbService,
    LectoresDniService,
    ControladorService,
    // Los DNI leídos se mandan al servidor (y no a la base de datos local).
    { provide: RegistroLecturas, useExisting: ControladorService },
  ],
})
export class ControladorModule {}
