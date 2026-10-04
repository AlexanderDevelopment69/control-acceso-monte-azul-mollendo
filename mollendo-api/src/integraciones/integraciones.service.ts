import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { AbrirMolineteEvent } from '../eventos-acceso/eventos-acceso.service.js';
import type { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';
import { PushSdkService } from '../push-sdk/push-sdk.service.js';
import { ReleUsbService } from './rele-usb.service.js';

interface PersonaFotoActualizadaEvent {
  personaId: number;
  tipoDocumentoIdentidad: string;
  numeroDocumento: string;
  rutaFoto: string;
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
  ) {}

  @OnEvent('molinete.abrir')
  async abrirMolinete(evento: AbrirMolineteEvent): Promise<void> {
    await this.releUsb.pulso(evento.tipoMovimiento);
  }

  /**
   * Registra el rostro de la persona en el G4 Pro. Solo la foto: el equipo no
   * acepta `DATA UPDATE USERINFO` (confirmado, ver push-sdk.service.ts), así
   * que no se manda el nombre -- el equipo crea el usuario solo, a partir de
   * la foto.
   */
  @OnEvent('persona.foto-actualizada')
  async registrarRostro(evento: PersonaFotoActualizadaEvent): Promise<void> {
    try {
      await this.pushSdk.sincronizarPersona(evento.personaId, evento.rutaFoto);
    } catch (error) {
      this.logger.error(
        `No se pudo encolar el registro en el G4 Pro para la persona ${evento.personaId}: ${(error as Error).message}`,
      );
    }
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
