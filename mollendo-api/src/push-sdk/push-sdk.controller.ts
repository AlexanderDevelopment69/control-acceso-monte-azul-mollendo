import { Body, Controller, Get, Header, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../common/decorators/public.decorator.js';
import { SerieG4Guard } from '../common/guards/serie-g4.guard.js';
import { PushSdkService } from './push-sdk.service.js';

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
  constructor(private readonly pushSdk: PushSdkService) {}

  @Post('registry')
  @Header('Content-Type', 'application/push;charset=UTF-8')
  async registry(@Query('SN') sn: string, @Req() req: Request) {
    const dispositivo = await this.pushSdk.obtenerOCrearDispositivo(sn, req.ip);
    return `RegistryCode=${dispositivo.registryCode}`;
  }

  @Post('push')
  @Header('Content-Type', 'application/push;charset=UTF-8')
  push() {
    return this.pushSdk.respuestaPush();
  }

  @Get('getrequest')
  @Header('Content-Type', 'text/plain')
  async getrequest(@Query('SN') sn: string, @Req() req: Request) {
    await this.pushSdk.tocarActividad(sn, req.ip);
    const comandos = await this.pushSdk.entregarComandosPendientes(sn);
    return comandos.length > 0 ? comandos.join('\n') : 'OK';
  }

  @Post('devicecmd')
  @Header('Content-Type', 'text/plain')
  async devicecmd(@Query('SN') sn: string, @Body() body: string) {
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
  async getCdata(@Query('SN') sn: string, @Req() req: Request) {
    await this.pushSdk.tocarActividad(sn, req.ip);
    return 'OK';
  }

  @Post('cdata')
  @Header('Content-Type', 'text/plain')
  async postCdata(
    @Query('SN') sn: string,
    @Query('table') table: string,
    @Query('type') type: string,
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
