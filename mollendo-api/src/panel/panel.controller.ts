import { Controller, Get, Query } from '@nestjs/common';
import { PanelService } from './panel.service.js';
import { DashboardService } from './dashboard.service.js';
import { QueryDashboardDto } from './dto/query-dashboard.dto.js';
import { ListaPaginadaDto } from '../common/paginacion.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { estadoRespaldos } from './respaldos.util.js';
import { PushSdkService } from '../push-sdk/push-sdk.service.js';
import { LectoresDniService } from '../lectores-dni/lectores-dni.service.js';
import { ReleUsbService } from '../integraciones/rele-usb.service.js';
import { ControladorGateway } from '../controlador-remoto/controlador.gateway.js';
import { IntegracionesService } from '../integraciones/integraciones.service.js';

/** Controlador desconectado: lectores y relés figuran sin datos. */
const sinConfigurarLectores = () => {
  const lector = { configurado: false, conectado: false, ultimaLectura: null, error: null };
  return { ingreso: lector, salida: lector };
};
const sinConectarReles = () => {
  const rele = { conectado: false, serie: null, canal: 1, ultimoPulso: null, error: 'Controlador desconectado' };
  return { ingreso: rele, salida: rele };
};

@Controller()
export class PanelController {
  constructor(
    private readonly panelService: PanelService,
    private readonly dashboardService: DashboardService,
    private readonly prisma: PrismaService,
    private readonly pushSdk: PushSdkService,
    private readonly lectoresDni: LectoresDniService,
    private readonly releUsb: ReleUsbService,
    private readonly controlador: ControladorGateway,
    private readonly integraciones: IntegracionesService,
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

  // Lista paginada de la permanencia mayor a 24 horas del dashboard.
  @Get('panel/dashboard/permanencia')
  @Roles('administrador')
  permanencia(@Query() query: ListaPaginadaDto) {
    return this.dashboardService.permanencia(query);
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
  async estadoSistema() {
    const inicio = Date.now();
    let baseDeDatos: { estado: 'up' | 'down'; latenciaMs: number };
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      baseDeDatos = { estado: 'up', latenciaMs: Date.now() - inicio };
    } catch {
      baseDeDatos = { estado: 'down', latenciaMs: Date.now() - inicio };
    }

    const dispositivos = await this.pushSdk.listarEstadoDispositivos();
    // Con controlador (MOLINETES_REMOTOS=true), los lectores y los relés
    // están en la mini PC de la garita: se muestra lo que ella informa.
    const controlador = this.controlador.estado();
    const remotos = controlador.remoto ? controlador.estado : null;

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
      equipos: {
        total: dispositivos.length,
        enLinea: dispositivos.filter((d) => d.enLinea).length,
        dispositivos,
      },
      // Lectores de DNI (RS232 en la mini PC, ver lectores-dni/): si están
      // configurados, si el puerto está abierto y la hora de la última lectura.
      lectoresDni: remotos?.lectoresDni ?? (controlador.remoto ? sinConfigurarLectores() : this.lectoresDni.estado()),
      // Módulos de relés USB que abren los molinetes (uno por molinete).
      releMolinetes: remotos?.releMolinetes ?? (controlador.remoto ? sinConectarReles() : await this.releUsb.estado()),
      // Controlador (mini PC conectada por internet), si los molinetes se abren a distancia.
      controladorGarita: controlador,
      // Sincronización con los G4 Pro: diaria activa o no, en curso y el último resultado.
      sincronizacionG4: await this.integraciones.estadoSincronizacion(),
      respaldos: estadoRespaldos(),
      websocket: { namespace: '/ws/eventos' },
    };
  }
}
