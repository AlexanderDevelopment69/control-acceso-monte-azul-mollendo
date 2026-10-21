import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { estadoRespaldos } from './respaldos.util.js';
import { PushSdkService } from '../push-sdk/push-sdk.service.js';
import { AlcoholimetroService } from '../push-sdk/alcoholimetro.service.js';
import { LectoresDniService } from '../lectores-dni/lectores-dni.service.js';
import { ReleUsbService } from '../integraciones/rele-usb.service.js';
import { ControladorGateway } from '../controlador-remoto/controlador.gateway.js';
import { IntegracionesService } from '../integraciones/integraciones.service.js';
import { swaggerActivo } from '../common/swagger.util.js';
import { seriesPermitidas } from '../common/seguridad/equipos.util.js';

/** Controlador sin datos todavía (nunca informó): lectores y relés, incluidos los de aviso, figuran sin conexión. */
const sinConfigurarLectores = () => {
  const lector = { configurado: true, conectado: false, ultimaLectura: null, error: 'Controlador desconectado' };
  return { ingreso: lector, salida: lector };
};
const sinConectarReles = () => {
  const rele = { conectado: false, serie: null, canal: 1, ultimoPulso: null, error: 'Controlador desconectado' };
  return { ingreso: rele, salida: rele, avisoIngreso: rele, avisoSalida: rele };
};

/**
 * Estado de todo el sistema (lo que muestra "Sistema y APIs"): base de datos,
 * equipos faciales, lectores de DNI, relés, controlador y respaldos. Lo usan
 * la pantalla, la franja de fallas y el registro de desconexiones (BitacoraEquiposService).
 */
@Injectable()
export class EstadoSistemaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushSdk: PushSdkService,
    private readonly lectoresDni: LectoresDniService,
    private readonly releUsb: ReleUsbService,
    private readonly controlador: ControladorGateway,
    private readonly integraciones: IntegracionesService,
    private readonly alcoholimetro: AlcoholimetroService,
  ) {}

  async calcular() {
    const inicio = Date.now();
    let baseDeDatos: { estado: 'up' | 'down'; latenciaMs: number };
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      baseDeDatos = { estado: 'up', latenciaMs: Date.now() - inicio };
    } catch {
      baseDeDatos = { estado: 'down', latenciaMs: Date.now() - inicio };
    }

    // Cada equipo facial con su alcoholímetro (se revisa cada 10 s: AlcoholimetroService).
    const dispositivos = (await this.pushSdk.listarEstadoDispositivos()).map((d) => ({ ...d, alcoholimetro: this.alcoholimetro.estado(d.serialNumber) }));
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
        swagger: swaggerActivo(),
        fecha: new Date().toISOString(),
      },
      baseDeDatos,
      integraciones: {
        claveEquiposConfigurada: !!process.env.DEVICE_API_KEY,
        terminalesPermitidos: seriesPermitidas(),
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
