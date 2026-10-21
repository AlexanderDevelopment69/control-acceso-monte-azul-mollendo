import { Controller, Get, Query } from '@nestjs/common';
import { PanelService } from './panel.service.js';
import { DashboardService } from './dashboard.service.js';
import { QueryDashboardDto } from './dto/query-dashboard.dto.js';
import { ListaPaginadaDto } from '../common/paginacion.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { avisosDelSistema } from './avisos-sistema.js';
import { EstadoSistemaService } from './estado-sistema.service.js';

@Controller()
export class PanelController {
  constructor(
    private readonly panelService: PanelService,
    private readonly dashboardService: DashboardService,
    private readonly prisma: PrismaService,
    private readonly estadoSistemaService: EstadoSistemaService,
  ) {}

  @Get('panel/resumen')
  @Roles('administrador', 'vigilancia')
  resumen() {
    return this.panelService.resumen();
  }

  // Indicadores y gráficos del dashboard (solo Administrador): presencia,
  // visitas, ingresos y salidas del periodo, personal y documentos.
  @Get('panel/dashboard')
  @Roles('administrador')
  dashboard(@Query() query: QueryDashboardDto) {
    return this.dashboardService.obtener(query);
  }

  // Lista paginada de la permanencia mayor a 12 horas del dashboard.
  @Get('panel/dashboard/permanencia')
  @Roles('administrador')
  permanencia(@Query() query: ListaPaginadaDto) {
    return this.dashboardService.permanencia(query);
  }

  // Todas las personas dentro ahora (lista de "Presentes actualmente" del dashboard).
  // También el vigilante: desde ahí abre la salida si se desconecta el lector de salida.
  @Get('panel/dashboard/presentes')
  @Roles('administrador', 'vigilancia')
  presentes() {
    return this.dashboardService.presentes();
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
  // datos, reporta si la clave de equipos está configurada y, ahora que el
  // protocolo PUSH ya está implementado (ver push-sdk/), si hay algún equipo
  // conectado de verdad (llamó a /iclock/getrequest en los últimos 2 min).
  @Get('panel/estado-sistema')
  @Roles('administrador')
  estadoSistema() {
    return this.estadoSistemaService.calcular();
  }

  // Lo que está caído, para la franja que el portal muestra arriba de todas las
  // páginas: también la ve el vigilante, para que pueda informarlo.
  @Get('panel/avisos')
  @Roles('administrador', 'vigilancia')
  async avisos() {
    const e = await this.estadoSistemaService.calcular();
    return {
      fecha: e.api.fecha,
      avisos: avisosDelSistema({
        fecha: e.api.fecha,
        baseDeDatos: e.baseDeDatos,
        claveEquiposConfigurada: e.integraciones.claveEquiposConfigurada,
        respaldos: e.respaldos,
        dispositivos: e.equipos.dispositivos,
        lectoresDni: e.lectoresDni,
        releMolinetes: e.releMolinetes,
        controlador: e.controladorGarita,
      }),
    };
  }
}
