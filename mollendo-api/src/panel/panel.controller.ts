import { Controller, Get } from '@nestjs/common';
import { PanelService } from './panel.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { estadoRespaldos } from './respaldos.util.js';

@Controller()
export class PanelController {
  constructor(
    private readonly panelService: PanelService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('panel/resumen')
  @Roles('administrador', 'vigilancia')
  resumen() {
    return this.panelService.resumen();
  }

  // Estado del servidor (público). En el alcance base no hay modo contingencia;
  // la pantalla de garita lo usa solo para avisar si el servidor no responde.
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
  // datos, reporta si la clave de equipos está configurada — no si el
  // hardware real responde, ya que aún no hay SDK definido (spec base, sección 12).
  @Get('panel/estado-sistema')
  @Roles('administrador')
  async estadoSistema() {
    const inicio = Date.now();
    let baseDeDatos: { estado: 'up' | 'down'; latenciaMs: number };
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      baseDeDatos = { estado: 'up', latenciaMs: Date.now() - inicio };
    } catch {
      baseDeDatos = { estado: 'down', latenciaMs: Date.now() - inicio };
    }

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
        claveEquiposConfigurada: !!process.env.DEVICE_API_KEY,
      },
      respaldos: estadoRespaldos(),
      websocket: { namespace: '/ws/eventos' },
    };
  }
}
