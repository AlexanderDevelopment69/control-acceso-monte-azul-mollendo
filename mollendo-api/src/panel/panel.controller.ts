import { Controller, Get } from '@nestjs/common';
import { PanelService } from './panel.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfiguracionSmtpService } from '../configuracion-smtp/configuracion-smtp.service.js';

@Controller()
export class PanelController {
  constructor(
    private readonly panelService: PanelService,
    private readonly prisma: PrismaService,
    private readonly configuracionSmtpService: ConfiguracionSmtpService,
  ) {}

  @Get('panel/resumen')
  @Roles('administracion', 'vigilancia')
  resumen() {
    return this.panelService.resumen();
  }

  // Usado por el servidor local/PC de vigilancia para detectar cuándo el
  // servidor central no responde y activar el modo contingencia (spec 9.9).
  @Get('health')
  @Public()
  async health() {
    const inicio = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'up', latenciaMs: Date.now() - inicio, fecha: new Date().toISOString() };
    } catch {
      return { status: 'degraded', database: 'down', latenciaMs: Date.now() - inicio, fecha: new Date().toISOString() };
    }
  }

  // Vista ampliada para el panel de Administración: además de la base de
  // datos, reporta qué integraciones externas están configuradas (SMTP,
  // clave de equipos) — no si el hardware real responde, ya que aún no hay
  // proveedor definido (spec, sección 12).
  @Get('panel/estado-sistema')
  @Roles('administracion')
  async estadoSistema() {
    const inicio = Date.now();
    let baseDeDatos: { estado: 'up' | 'down'; latenciaMs: number };
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      baseDeDatos = { estado: 'up', latenciaMs: Date.now() - inicio };
    } catch {
      baseDeDatos = { estado: 'down', latenciaMs: Date.now() - inicio };
    }

    const smtp = await this.configuracionSmtpService.obtenerConfigTransporte();

    return {
      api: {
        estado: 'up' as const,
        entorno: process.env.NODE_ENV ?? 'development',
        uptimeSegundos: Math.round(process.uptime()),
        nodeVersion: process.version,
        fecha: new Date().toISOString(),
      },
      baseDeDatos,
      integraciones: {
        smtpConfigurado: !!smtp,
        claveEquiposConfigurada: !!process.env.DEVICE_API_KEY,
      },
      websocket: { namespace: '/ws/eventos' },
    };
  }
}
