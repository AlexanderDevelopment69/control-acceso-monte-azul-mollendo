import { Body, Controller, Get, Header, Logger, NotFoundException, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../common/decorators/public.decorator.js';
import { SerieG4Guard } from '../common/guards/serie-g4.guard.js';
import { PushSdkService } from './push-sdk.service.js';
import { ipLocalDeRegistro } from './ip-local.util.js';
import { opcionesAsistencia } from './asistencia.util.js';

/**
 * Endpoints del protocolo ADMS/PUSH que llama el equipo G4 Pro directamente
 * (rutas fijas, sin prefijo, no configurables desde el equipo). Sin
 * autenticación: el equipo no manda ningún token, por eso van marcados
 * @Public() -- ver main.ts para la exclusión del prefijo global "api/v1".
 * En su lugar, solo se atiende a los números de serie de G4PRO_SN_PERMITIDOS.
 */
@Controller('iclock')
@Public()
@UseGuards(SerieG4Guard)
export class PushSdkController {
  private readonly logger = new Logger(PushSdkController.name);

  constructor(private readonly pushSdk: PushSdkService) {}

  @Post('registry')
  @Header('Content-Type', 'application/push;charset=UTF-8')
  async registry(@Query('SN') sn: string, @Req() req: Request, @Body() body: string) {
    const dispositivo = await this.pushSdk.obtenerOCrearDispositivo(sn, req.ip, ipLocalDeRegistro(body));
    // Prueba del protocolo de asistencia: como el PushDemo original del proveedor, que no
    // contesta el registro (ahí el G4 envía ATTLOG con el DNI y el alcohol).
    if (await this.pushSdk.protocoloAsistencia()) {
      this.logger.log(`G4 Pro ${sn}: registry sin RegistryCode (prueba del protocolo de asistencia)`);
      return 'OK';
    }
    return `RegistryCode=${dispositivo.registryCode}`;
  }

  @Post('push')
  @Header('Content-Type', 'application/push;charset=UTF-8')
  async push() {
    // Prueba del protocolo de asistencia: el PushDemo original no tenía esta ruta.
    if (await this.pushSdk.protocoloAsistencia()) throw new NotFoundException();
    return this.pushSdk.respuestaPush();
  }

  @Get('getrequest')
  @Header('Content-Type', 'text/plain')
  async getrequest(@Query('SN') sn: string, @Req() req: Request) {
    await this.pushSdk.tocarActividad(sn, req.ip);
    await this.pushSdk.pedirInfoUnaVez(sn);
    const comandos = await this.pushSdk.entregarComandosPendientes(sn);
    return comandos.length > 0 ? comandos.join('\n') : 'OK';
  }

  @Post('devicecmd')
  @Header('Content-Type', 'text/plain')
  async devicecmd(@Query('SN') sn: string, @Body() body: string) {
    // La respuesta a INFO trae los datos del equipo, uno por línea (entre ellos "IPAddress=").
    const ipLocal = ipLocalDeRegistro(body);
    if (ipLocal) await this.pushSdk.guardarIpLocal(sn, ipLocal);
    // Si el equipo recibió varios comandos juntos, confirma todos en el mismo
    // mensaje: una línea "ID=..&Return=..&CMD=.." por comando.
    for (const linea of (body ?? '').split(/\r?\n/)) {
      if (!linea.trim()) continue;
      const params = new URLSearchParams(linea);
      const id = Number(params.get('ID'));
      const returnCode = Number(params.get('Return'));
      if (params.has('ID') && Number.isFinite(id)) {
        await this.pushSdk.confirmarComando(sn, id, Number.isFinite(returnCode) ? returnCode : 0);
      }
    }
    return 'OK';
  }

  @Get('cdata')
  @Header('Content-Type', 'text/plain')
  async getCdata(@Query('SN') sn: string, @Query('options') options: string, @Query('DeviceType') deviceType: string, @Req() req: Request) {
    await this.pushSdk.tocarActividad(sn, req.ip);
    // Opciones del modo asistencia: solo para un equipo de asistencia. Este G4 Pro pide
    // options=all con DeviceType=acc y, si recibe estas opciones, las vuelve a pedir sin parar y
    // deja de funcionar (probado el 17/10/2026): a un equipo de control de acceso se le responde OK.
    if (options === 'all' && (deviceType !== 'acc' || (await this.pushSdk.protocoloAsistencia()))) {
      this.logger.log(`G4 Pro ${sn}: pide las opciones de asistencia (options=all); se le piden los ATTLOG`);
      return opcionesAsistencia(sn);
    }
    return 'OK';
  }

  @Post('cdata')
  @Header('Content-Type', 'text/plain')
  async postCdata(
    @Query('SN') sn: string,
    @Query('table') table: string,
    @Query('type') type: string,
    @Query('tablename') tablename: string,
    @Body() body: string,
    @Req() req: Request,
  ) {
    await this.pushSdk.tocarActividad(sn, req.ip);

    // Background Verification (sección 12.8.3 del protocolo oficial): este
    // equipo específico no la soporta (confirmado, no existe en su menú),
    // pero se deja implementada por si algún otro equipo de la familia sí.
    if (type === 'PostVerifyData') {
      return 'OK';
    }

    const tablaNormalizada = (table ?? '').toLowerCase();

    // Captura de la verificación (snapshot) que sube el equipo de luz visible:
    // `table=tabledata&tablename=ATTPHOTO`. El nombre del archivo trae el DNI
    // (`<fecha>-<dni>.jpg`), la única vía para saber quién pasó cuando el rtlog
    // llega con pin=0 (ver Security PUSH, sección 10.9). El equipo espera
    // "ATTPHOTO=<n procesados>" como respuesta.
    if (tablaNormalizada === 'tabledata' && (tablename ?? '').toLowerCase() === 'attphoto') {
      let procesados = 0;
      for (const linea of (body ?? '').split('\n').filter((l) => l.trim().length > 0)) {
        if (await this.pushSdk.guardarSnapshot(sn, linea)) procesados++;
      }
      return `ATTPHOTO=${procesados}`;
    }

    if (tablaNormalizada === 'attlog') {
      for (const linea of (body ?? '').split('\n').filter((l) => l.trim().length > 0)) {
        await this.pushSdk.guardarRegistroAsistencia(sn, linea);
      }
      return 'OK';
    }
    if (tablaNormalizada === 'rtlog' || tablaNormalizada === 'rtstate') {
      const lineas = (body ?? '').split('\n').filter((linea) => linea.trim().length > 0);
      for (const linea of lineas) {
        await this.pushSdk.guardarVerificacion(sn, tablaNormalizada, linea);
      }
    }

    return 'OK';
  }

  /**
   * Respuestas a las consultas del protocolo de control de acceso (`DATA COUNT
   * <tabla>`, `DATA QUERY tablename=<tabla>,...`): el G4 Pro las envía aquí con
   * `type=count|tabledata`, `cmdid` (el id del comando) y `tablename`; el
   * cuerpo trae `user=0` (conteo) o una línea por registro. Si no se responde
   * "OK", el equipo reintenta.
   */
  @Post('querydata')
  @Header('Content-Type', 'text/plain')
  async querydata(
    @Query('SN') sn: string,
    @Query('type') tipo: string,
    @Query('cmdid') cmdid: string,
    @Query('tablename') tabla: string,
    @Query('packcnt') packcnt: string,
    @Query('packidx') packidx: string,
    @Body() body: string,
    @Req() req: Request,
  ) {
    await this.pushSdk.tocarActividad(sn, req.ip);
    this.pushSdk.guardarRespuestaConsulta(sn, Number(cmdid), tipo, tabla, body ?? '', {
      indice: Number(packidx),
      total: Number(packcnt),
    });
    return 'OK';
  }
}
