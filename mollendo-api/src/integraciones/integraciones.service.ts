import { ConflictException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { AbrirMolineteEvent, HabilitarEnEquipoEvent, QuienAproboEvent } from '../eventos-acceso/eventos-acceso.service.js';
import type { PaseExitoso } from '../push-sdk/verify-success.util.js';
import type { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
import { PushSdkService } from '../push-sdk/push-sdk.service.js';
import { AVISO_DE, ReleUsbService } from './rele-usb.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import { ControladorGateway, molinetesRemotos } from '../controlador-remoto/controlador.gateway.js';
import { pinDeDocumento } from '../push-sdk/comandos-acceso.util.js';
import { guardarHoraDiaria, leerCambioDiaria, leerHoraDiaria } from './sincronizacion-diaria.js';
import { leerFacialPrimero, type PermisosFijosEvent } from '../eventos-acceso/modo-ingreso.service.js';

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
  /** Personas con datos cambiados a mano en el equipo (contraseña, administrador…), corregidas. */
  corregidas: number;
  usuariosABorrar: string[];
  porEquipo: { serialNumber: string; usuarios: number; conRostro: number; sinRostro: string[] }[];
}

const RESUMEN_VACIO = {
  equipos: 0,
  equiposSinRespuesta: 0,
  agregadas: 0,
  borradas: 0,
  permisosQuitados: 0,
  corregidas: 0,
  usuariosABorrar: [],
  porEquipo: [],
};

/**
 * Adaptadores de los equipos físicos. La integración real está definida en
 * docs/g4pro/Historial_Integracion_G4Pro.md (Parte A):
 * - Terminal ZKTeco G4 Pro + alcoholímetro: protocolo PUSH del fabricante
 *   (sin ZKBio) para registrar personas y fotos, y recibir los eventos de
 *   verificación (ver push-sdk/). El G4 Pro abre el ingreso con su propio
 *   relé -- el vigilante es el control de que nadie se salte el DNI (ver
 *   Analisis_Control_Acceso_Mollendo.md sección 6.0), así que esta
 *   integración ya no necesita "habilitar" a nadie, solo mantener
 *   sincronizados nombre y rostro.
 * - Molinetes TS2000 Plus: los abre el Controlador (PC) con un módulo de relés USB
 *   para cada uno (ver rele-usb.service.ts), con cada
 *   salida autorizada y con cada ingreso autorizado por el G4 Pro (rostro =
 *   DNI y alcohol conforme), según docs/diagramas/ingreso.svg y salida.svg.
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
    private readonly auditoria: AuditoriaService,
    private readonly controlador: ControladorGateway,
  ) {}

  /** Orden "facial primero": permiso fijo a todo el personal activo (al activarlo) o su retiro (al apagarlo). */
  @OnEvent('g4pro.permisos-fijos')
  async permisosFijos(evento: PermisosFijosEvent): Promise<void> {
    try {
      const n = await this.pushSdk.permisosEnEquipos(evento.documentos, evento.habilitar);
      this.logger.log(`G4 Pro: ${evento.habilitar ? 'permiso fijo a' : 'se quita el permiso a'} ${n} persona(s) (facial primero)`);
    } catch (error) {
      this.logger.error(`No se pudieron cambiar los permisos fijos: ${(error as Error).message}`);
    }
  }

  /**
   * Orden "facial primero": quién aprobó rostro y alcohol (el rtlog llega con
   * pin=0). Se responde por `emitAsync`; null si no se pudo saber.
   */
  @OnEvent('g4pro.quien-aprobo')
  async quienAprobo(evento: QuienAproboEvent): Promise<PaseExitoso | null> {
    try {
      return await this.pushSdk.quienAprobo(evento.serialNumber, evento.horaDispositivo);
    } catch (error) {
      this.logger.error(`No se pudo leer quién aprobó en el G4 Pro: ${(error as Error).message}`);
      return null;
    }
  }

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

  /**
   * Ingreso denegado (documentos, baja, no registrado, alcohol o sin verificación) o salida denegada
   * (DNI no registrado): contacto seco del relé de aviso de esa puerta, si está configurado.
   */
  @OnEvent('evento-acceso.registrado')
  async avisarDenegado(evento: { tipoMovimiento?: string; resultado?: string }): Promise<void> {
    if (evento.resultado !== 'denegado' || (evento.tipoMovimiento !== 'ingreso' && evento.tipoMovimiento !== 'salida')) return;
    // Con controlador, el aviso lo lleva ControladorGateway al Controlador (PC).
    if (process.env.MOLINETES_REMOTOS === 'true') return;
    await this.releUsb.pulso(AVISO_DE[evento.tipoMovimiento]);
  }

  /** Tarjeta de contingencia rechazada (sin evento de acceso): suena igual el aviso de esa puerta. */
  @OnEvent('aviso.denegado')
  async avisarTarjetaRechazada(aviso: { tipoMovimiento: 'ingreso' | 'salida' }): Promise<void> {
    if (process.env.MOLINETES_REMOTOS === 'true') return;
    await this.releUsb.pulso(AVISO_DE[aviso.tipoMovimiento]);
  }

  @OnEvent('molinete.abrir')
  async abrirMolinete(evento: AbrirMolineteEvent): Promise<void> {
    // Con controlador, la orden la lleva ControladorGateway al Controlador (PC).
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
      if (!persona) return;
      await this.pushSdk.sincronizarPersona(persona, opciones);
      // Facial primero: el personal activo tiene permiso fijo; quien se da de baja lo pierde.
      if (await leerFacialPrimero(this.prisma)) await this.pushSdk.habilitarEnEquipos(persona.numeroDocumento, persona.estado === 'activo');
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
  async sincronizarTodas(simular = false, origen: 'manual' | 'diaria' = 'manual', usuarioId?: number): Promise<ResultadoSincronizacion> {
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
      await this.auditarSincronizacion(resultado, usuarioId);
      throw error;
    } finally {
      this.enCurso = false;
    }
    await this.guardarResultado(resultado);
    await this.auditarSincronizacion(resultado, usuarioId);
    return resultado;
  }

  /** En la Auditoría: quién la ejecutó ("Sistema" la diaria) y qué cambió en el equipo. */
  private async auditarSincronizacion(r: ResultadoSincronizacion, usuarioId?: number) {
    const que = r.origen === 'diaria' ? 'Revisión diaria' : r.simulacion ? 'Simulación' : 'Sincronización';
    const detalle = r.error
      ? `${que}: falló (${r.error})`
      : r.simulacion
        ? `${que}: agregaría ${r.agregadas}, borraría ${r.borradas}, corregiría ${r.corregidas}`
        : `${que}: ${r.agregadas} agregadas, ${r.borradas} borradas, ${r.corregidas} corregidas`;
    await this.auditoria
      .registrar({ usuarioId: usuarioId ?? null, tablaAfectada: 'sincronizacion_g4', registroId: 0, accion: 'ejecucion', detalle: detalle.slice(0, 200) })
      .catch(() => undefined);
  }

  /** Estado de la sincronización para "Sistema y APIs" (la última se lee de la base de datos). */
  async estadoSincronizacion() {
    return {
      diaria: { activa: this.horaDiaria !== null, hora: this.horaDiaria, ...leerCambioDiaria() },
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
    const pinEnTurno = enTurno ? pinDeDocumento(enTurno.persona.numeroDocumento) : null;
    // Normal: solo la persona en su turno tiene permiso. Facial primero: todo el personal activo.
    const facialPrimero = await leerFacialPrimero(this.prisma);
    const conPermiso = facialPrimero ? activos : new Set(pinEnTurno ? [pinEnTurno] : []);
    const datosEsperados = new Map(
      [...activos].map((pin) => [pin, { pin, nombres: porPin.get(pin)!.nombres, apellidos: porPin.get(pin)!.apellidos }]),
    );
    const limpieza = await this.pushSdk.limpiarEquipos(new Set(porPin.keys()), activos, conPermiso, !simular, datosEsperados);
    for (const pin of simular ? [] : limpieza.faltantes) {
      await this.pushSdk.sincronizarPersona(porPin.get(pin)!, { conFoto: true });
      if (facialPrimero) await this.pushSdk.habilitarEnEquipos(pin, true);
    }
    const resumen = {
      simulacion: simular,
      equipos: limpieza.equipos,
      equiposSinRespuesta: limpieza.sinRespuesta,
      agregadas: limpieza.faltantes.size,
      borradas: limpieza.borrados,
      permisosQuitados: limpieza.permisosQuitados,
      corregidas: limpieza.corregidos.size,
      usuariosABorrar: [...limpieza.sobrantes],
      porEquipo: limpieza.porEquipo,
    };
    this.logger.log(`Sincronización con los G4 Pro: ${JSON.stringify(resumen)}`);
    return resumen;
  }

  onModuleInit() {
    this.programarDiaria(leerHoraDiaria());
  }

  /** Activa (hora 0..23, hora de Lima) o desactiva (null) la sincronización diaria, desde "Sistema y APIs". */
  async cambiarDiaria(hora: number | null, cambiadoPor?: string, usuarioId?: number) {
    guardarHoraDiaria(hora, cambiadoPor);
    this.programarDiaria(hora);
    await this.auditoria.registrar({
      usuarioId: usuarioId ?? null,
      tablaAfectada: 'sincronizacion_g4',
      registroId: 0,
      accion: 'modificar',
      detalle: hora === null ? 'Revisión diaria: desactivada' : `Revisión diaria: activada a las ${hora}:00`,
    });
    return this.estadoSincronizacion();
  }

  /** Una vez al día, a esa hora: revisa cada 10 minutos si ya toca. */
  private programarDiaria(hora: number | null) {
    if (this.revisionDiaria) clearInterval(this.revisionDiaria);
    this.revisionDiaria = null;
    this.horaDiaria = hora;
    if (hora === null) {
      this.logger.warn('Sincronización diaria con los G4 Pro desactivada; sigue disponible la manual');
      return;
    }
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
   * "salida"; también "Ingreso"/"Salida", como los nombra el lector). Con el
   * servidor en la nube va al Controlador (PC), como cualquier apertura;
   * sin él conectado no se abre. El molinete se cierra solo después del paso,
   * así que "cerrar" no hace nada.
   */
  async enviarComandoTorniquete(dto: TorniqueteComandoDto, usuarioId?: number): Promise<{ enviado: boolean }> {
    const molinete = dto.torniqueteId.trim().toLowerCase();
    if (dto.comando !== 'abrir' || (molinete !== 'ingreso' && molinete !== 'salida')) {
      this.logger.log(`Comando molinete ${dto.torniqueteId}: ${dto.comando} (sin acción)`);
      return { enviado: false };
    }
    let enviado: boolean;
    if (molinetesRemotos()) {
      enviado = this.controlador.estado().conectado;
      if (enviado) this.controlador.abrirMolinete({ tipoMovimiento: molinete, eventoId: 0, torniqueteId: dto.torniqueteId });
    } else {
      enviado = await this.releUsb.pulso(molinete);
    }
    // Abre sin DNI: queda en la Auditoría con quién lo pidió.
    await this.auditoria.registrar({
      usuarioId: usuarioId ?? null,
      tablaAfectada: 'molinete',
      registroId: 0,
      accion: 'apertura',
      detalle: `Molinete de ${molinete} abierto a mano (por la API)${enviado ? '' : molinetesRemotos() ? ': el controlador no está conectado' : ': el relé no respondió'}`,
    });
    return { enviado };
  }
}
