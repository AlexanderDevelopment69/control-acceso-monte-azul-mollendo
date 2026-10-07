import { ConflictException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { AbrirMolineteEvent, HabilitarEnEquipoEvent } from '../eventos-acceso/eventos-acceso.service.js';
import type { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
import { PushSdkService } from '../push-sdk/push-sdk.service.js';
import { ReleUsbService } from './rele-usb.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { pinDeDocumento } from '../push-sdk/comandos-acceso.util.js';

interface PersonaFotoActualizadaEvent {
  personaId: number;
}

interface PersonaGuardadaEvent {
  personaId: number;
  numeroAnterior?: string;
}

/** Resultado de una sincronización con los G4 Pro (se muestra en "Sistema y APIs"). */
export interface ResultadoSincronizacion {
  simulacion: boolean;
  origen: 'manual' | 'diaria';
  fecha: string;
  error: string | null;
  equipos: number;
  equiposSinRespuesta: number;
  agregadas: number;
  borradas: number;
  permisosQuitados: number;
  usuariosABorrar: string[];
  porEquipo: { serialNumber: string; usuarios: number; conRostro: number; sinRostro: string[] }[];
}

const RESUMEN_VACIO = {
  equipos: 0,
  equiposSinRespuesta: 0,
  agregadas: 0,
  borradas: 0,
  permisosQuitados: 0,
  usuariosABorrar: [],
  porEquipo: [],
};

/**
 * Adaptadores de los equipos físicos. La integración real está definida en
 * Opciones_Integracion_G4Pro.md:
 * - Terminal ZKTeco G4 Pro + alcoholímetro: protocolo PUSH del fabricante
 *   (sin ZKBio) para registrar personas y fotos, y recibir los eventos de
 *   verificación (ver push-sdk/). El G4 Pro abre el ingreso con su propio
 *   relé -- el vigilante es el control de que nadie se salte el DNI (ver
 *   Analisis_Control_Acceso_Mollendo.md sección 6.0), así que esta
 *   integración ya no necesita "habilitar" a nadie, solo mantener
 *   sincronizados nombre y rostro.
 * - Molinetes TS2000 Plus: los abre la mini PC con un módulo de relés USB
 *   para cada uno (ver rele-usb.service.ts), con cada
 *   salida autorizada y con cada ingreso autorizado por el G4 Pro (rostro =
 *   DNI y alcohol conforme), según diagramas/ingreso.svg y salida.svg.
 */
@Injectable()
export class IntegracionesService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IntegracionesService.name);
  private revisionDiaria: NodeJS.Timeout | null = null;
  private ultimaSincronizacion: string | null = null;
  private horaDiaria: number | null = null;
  private enCurso = false;

  constructor(
    private readonly pushSdk: PushSdkService,
    private readonly releUsb: ReleUsbService,
    private readonly prisma: PrismaService,
  ) {}

  /** Permiso de paso en los G4 Pro mientras la persona espera su ingreso (y su retiro al terminar). */
  @OnEvent('g4pro.habilitar')
  async habilitarEnEquipo(evento: HabilitarEnEquipoEvent): Promise<void> {
    try {
      const enviado = await this.pushSdk.habilitarEnEquipos(evento.numeroDocumento, evento.habilitar);
      this.logger.log(`G4 Pro: ${evento.habilitar ? 'habilitar' : 'deshabilitar'} DNI ${evento.numeroDocumento}${enviado ? '' : ' (sin equipos)'}`);
    } catch (error) {
      this.logger.error(`No se pudo ${evento.habilitar ? 'habilitar' : 'deshabilitar'} el DNI ${evento.numeroDocumento}: ${(error as Error).message}`);
    }
  }

  @OnEvent('molinete.abrir')
  async abrirMolinete(evento: AbrirMolineteEvent): Promise<void> {
    // Con controlador de garita, la orden la lleva ControladorGateway a la mini PC.
    if (process.env.MOLINETES_REMOTOS === 'true') return;
    await this.releUsb.pulso(evento.tipoMovimiento);
  }

  /** Alta o edición de una persona: se registra (o actualiza) en los G4 Pro, sin permiso de paso. */
  @OnEvent('persona.guardada')
  async registrarPersona(evento: PersonaGuardadaEvent): Promise<void> {
    await this.sincronizar(evento.personaId, { numeroAnterior: evento.numeroAnterior });
  }

  /** Foto nueva: se envía a los G4 Pro, que la convierten en el rostro que reconocen. */
  @OnEvent('persona.foto-actualizada')
  async registrarRostro(evento: PersonaFotoActualizadaEvent): Promise<void> {
    await this.sincronizar(evento.personaId, { conFoto: true });
  }

  private async sincronizar(personaId: number, opciones: { conFoto?: boolean; numeroAnterior?: string }) {
    try {
      const persona = await this.prisma.persona.findUnique({ where: { id: personaId } });
      if (persona) await this.pushSdk.sincronizarPersona(persona, opciones);
    } catch (error) {
      this.logger.error(`No se pudo encolar la persona ${personaId} para el G4 Pro: ${(error as Error).message}`);
    }
  }

  /**
   * Sincronización completa con los G4 Pro (manual con
   * `POST /integraciones/g4pro/sincronizar`, y todos los días a medianoche):
   * borra del equipo a quien el sistema no conoce, quita permisos de paso
   * sueltos (salvo a la persona en su turno) y registra, con su foto, al
   * personal activo que falte. Con `simular`, solo informa qué haría.
   */
  async sincronizarTodas(simular = false, origen: 'manual' | 'diaria' = 'manual'): Promise<ResultadoSincronizacion> {
    if (this.enCurso) throw new ConflictException('Ya hay una sincronización con el G4 Pro en curso');
    this.enCurso = true;
    const inicio = new Date();
    let resultado: ResultadoSincronizacion;
    try {
      const resumen = await this.sincronizarConEquipos(simular);
      resultado = { ...resumen, origen, fecha: inicio.toISOString(), error: null };
    } catch (error) {
      resultado = { ...RESUMEN_VACIO, simulacion: simular, origen, fecha: inicio.toISOString(), error: (error as Error).message };
      await this.guardarResultado(resultado);
      throw error;
    } finally {
      this.enCurso = false;
    }
    await this.guardarResultado(resultado);
    return resultado;
  }

  /** Estado de la sincronización para "Sistema y APIs" (la última se lee de la base de datos). */
  async estadoSincronizacion() {
    return {
      diaria: { activa: this.horaDiaria !== null, hora: this.horaDiaria },
      enCurso: this.enCurso,
      ultima: await this.ultimaGuardada(),
    };
  }

  /** Se guarda cada sincronización para conservar la última aunque la API se reinicie. */
  private async guardarResultado(resultado: ResultadoSincronizacion) {
    const { fecha, origen, simulacion, error, ...detalle } = resultado;
    try {
      await this.prisma.sincronizacionG4.create({
        data: { fecha: new Date(fecha), origen, simulacion, error, resultado: detalle },
      });
    } catch (e) {
      this.logger.error(`No se pudo guardar el resultado de la sincronización con el G4 Pro: ${(e as Error).message}`);
    }
  }

  private async ultimaGuardada(): Promise<ResultadoSincronizacion | null> {
    const fila = await this.prisma.sincronizacionG4.findFirst({ orderBy: { id: 'desc' } });
    if (!fila) return null;
    return {
      ...RESUMEN_VACIO,
      ...(fila.resultado as Partial<ResultadoSincronizacion>),
      simulacion: fila.simulacion,
      origen: fila.origen === 'diaria' ? 'diaria' : 'manual',
      fecha: fila.fecha.toISOString(),
      error: fila.error,
    };
  }

  private async sincronizarConEquipos(simular: boolean) {
    const personas = await this.prisma.persona.findMany({ orderBy: { id: 'asc' } });
    const porPin = new Map<string, (typeof personas)[number]>();
    for (const persona of personas) {
      const pin = pinDeDocumento(persona.numeroDocumento);
      if (pin) porPin.set(pin, persona);
    }
    const activos = new Set([...porPin].filter(([, p]) => p.estado === 'activo').map(([pin]) => pin));
    const enTurno = await this.prisma.ingresoPendiente.findFirst({
      where: { consumidoEn: null, habilitadoEn: { gte: new Date(Date.now() - 2 * 60 * 1000) } },
      include: { persona: { select: { numeroDocumento: true } } },
    });
    const limpieza = await this.pushSdk.limpiarEquipos(
      new Set(porPin.keys()),
      activos,
      enTurno ? pinDeDocumento(enTurno.persona.numeroDocumento) : null,
      !simular,
    );
    for (const pin of simular ? [] : limpieza.faltantes) {
      await this.pushSdk.sincronizarPersona(porPin.get(pin)!, { conFoto: true });
    }
    const resumen = {
      simulacion: simular,
      equipos: limpieza.equipos,
      equiposSinRespuesta: limpieza.sinRespuesta,
      agregadas: limpieza.faltantes.size,
      borradas: limpieza.borrados,
      permisosQuitados: limpieza.permisosQuitados,
      usuariosABorrar: [...limpieza.sobrantes],
      porEquipo: limpieza.porEquipo,
    };
    this.logger.log(`Sincronización con los G4 Pro: ${JSON.stringify(resumen)}`);
    return resumen;
  }

  onModuleInit() {
    // Una vez al día, a la hora G4PRO_HORA_SINCRONIZACION (0 = medianoche, hora de Lima):
    // revisa cada 10 minutos si ya toca. "off" (o cualquier valor que no sea una hora) la desactiva.
    const valor = (process.env.G4PRO_HORA_SINCRONIZACION ?? '0').trim();
    const hora = /^\d{1,2}$/.test(valor) && Number(valor) < 24 ? Number(valor) : null;
    if (hora === null) {
      this.logger.warn(`Sincronización diaria con los G4 Pro desactivada (G4PRO_HORA_SINCRONIZACION=${valor}); sigue disponible la manual`);
      return;
    }
    this.horaDiaria = hora;
    this.logger.log(`Sincronización diaria con los G4 Pro a las ${hora}:00`);
    this.revisionDiaria = setInterval(() => {
      const ahora = new Date();
      const hoy = ahora.toDateString();
      if (ahora.getHours() === hora && this.ultimaSincronizacion !== hoy) {
        this.ultimaSincronizacion = hoy;
        this.sincronizarTodas(false, 'diaria').catch((error: Error) => this.logger.error(`Sincronización diaria con los G4 Pro: ${error.message}`));
      }
    }, 10 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.revisionDiaria) clearInterval(this.revisionDiaria);
  }

  /**
   * Orden manual: "abrir" da un pulso en el relé del molinete ("ingreso" o
   * "salida"; también "Ingreso"/"Salida", como los nombra el lector). El
   * molinete se cierra solo después del paso, así que "cerrar" no hace nada.
   */
  async enviarComandoTorniquete(dto: TorniqueteComandoDto): Promise<{ enviado: boolean }> {
    const molinete = dto.torniqueteId.trim().toLowerCase();
    if (dto.comando !== 'abrir' || (molinete !== 'ingreso' && molinete !== 'salida')) {
      this.logger.log(`Comando molinete ${dto.torniqueteId}: ${dto.comando} (sin acción)`);
      return { enviado: false };
    }
    return { enviado: await this.releUsb.pulso(molinete) };
  }
}
