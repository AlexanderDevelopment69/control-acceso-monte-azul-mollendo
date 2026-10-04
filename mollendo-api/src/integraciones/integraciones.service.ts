import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { AbrirMolineteEvent, HabilitarEnEquipoEvent } from '../eventos-acceso/eventos-acceso.service.js';
import type { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
import { PushSdkService } from '../push-sdk/push-sdk.service.js';
import { ReleUsbService } from './rele-usb.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

interface PersonaFotoActualizadaEvent {
  personaId: number;
}

interface PersonaGuardadaEvent {
  personaId: number;
  numeroAnterior?: string;
}

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
export class IntegracionesService {
  private readonly logger = new Logger(IntegracionesService.name);

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
   * Registra en los G4 Pro a todo el personal (con su foto), por ejemplo al
   * instalar un equipo nuevo. Devuelve cuántas personas se encolaron.
   */
  async sincronizarTodas(): Promise<{ personas: number }> {
    const personas = await this.prisma.persona.findMany({ orderBy: { id: 'asc' } });
    for (const persona of personas) {
      await this.pushSdk.sincronizarPersona(persona, { conFoto: true });
    }
    return { personas: personas.length };
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
