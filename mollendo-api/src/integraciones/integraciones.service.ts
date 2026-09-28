import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { AbrirMolineteEvent } from '../eventos-acceso/eventos-acceso.service.js';
import type { TorniqueteComandoDto } from './dto/torniquete-comando.dto.js';

/**
 * Adaptadores de los equipos físicos. Todavía SIMULADOS (solo quedan en el
 * log); la integración real está definida en Opciones_Integracion_G4Pro.md:
 * - Terminal ZKTeco G4 Pro + alcoholímetro: protocolo PUSH del fabricante
 *   (sin ZKBio) para registrar personas y fotos, habilitarlas y recibir ingresos.
 * - Molinetes TS2000 Plus: el de salida con un relé de red; el de ingreso con el
 *   relé del propio G4 Pro.
 */
@Injectable()
export class IntegracionesService {
  private readonly logger = new Logger(IntegracionesService.name);

  @OnEvent('molinete.abrir')
  async abrirMolinete(evento: AbrirMolineteEvent): Promise<void> {
    await this.enviarComandoTorniquete({ torniqueteId: evento.torniqueteId ?? 'T1', comando: 'abrir' });
  }

  /**
   * Registrar (o actualizar) el rostro de la persona en el G4 Pro. Simulado:
   * falta programar el protocolo PUSH y convertir la foto al formato del terminal.
   */
  @OnEvent('persona.foto-actualizada')
  registrarRostro(evento: { personaId: number; tipoDocumentoIdentidad: string; numeroDocumento: string; rutaFoto: string }): void {
    this.logger.log(
      `Registrar rostro en el G4 Pro: ${evento.tipoDocumentoIdentidad} ${evento.numeroDocumento} (persona ${evento.personaId}), foto ${evento.rutaFoto} (simulado: falta el protocolo PUSH)`,
    );
  }

  async enviarComandoTorniquete(dto: TorniqueteComandoDto): Promise<{ enviado: boolean }> {
    this.logger.log(`Comando molinete ${dto.torniqueteId}: ${dto.comando} (simulado, sin relé real todavía)`);
    return { enviado: true };
  }
}
