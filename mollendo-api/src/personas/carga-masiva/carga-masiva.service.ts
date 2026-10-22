import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.type.js';
import { PersonasService } from '../personas.service.js';
import type { CreatePersonaDto } from '../dto/create-persona.dto.js';
import type { FilaConErrorDto } from './carga-masiva.dto.js';
import { generarPlantillaCarga, leerFilasCarga, revisarFilasCarga, type FilaRevisada } from './carga-masiva.util.js';

export interface RevisionCarga {
  filas: FilaRevisada[];
  resumen: { total: number; listas: number; existentes: number; errores: number };
}

export interface ResultadoCarga {
  registradas: number;
  omitidas: { numeroDocumento: string; motivo: string }[];
}

/**
 * Carga masiva de personal: plantilla, revisión del Excel (sin guardar) y
 * registro de las filas correctas, una por una con el mismo registro del
 * formulario (validación, auditoría y envío al G4 Pro).
 */
@Injectable()
export class CargaMasivaService {
  private readonly logger = new Logger(CargaMasivaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly personas: PersonasService,
  ) {}

  private empresas() {
    return this.prisma.empresa.findMany({ select: { id: true, ruc: true, razonSocial: true, estado: true } });
  }

  async plantilla(filasConError: FilaConErrorDto[] = []): Promise<Buffer> {
    return generarPlantillaCarga(await this.empresas(), filasConError);
  }

  async revisar(contenido: Buffer): Promise<RevisionCarga> {
    let filasLeidas;
    try {
      filasLeidas = await leerFilasCarga(contenido);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
    if (!filasLeidas.length) throw new BadRequestException('El Excel no tiene personas: llene la hoja Personal desde la fila 2.');

    const existentes = await this.prisma.persona.findMany({
      select: { tipoDocumentoIdentidad: true, numeroDocumento: true, nombres: true, apellidos: true, estado: true },
    });
    const filas = revisarFilasCarga(filasLeidas, await this.empresas(), existentes);
    const cuenta = (estado: FilaRevisada['estado']) => filas.filter((f) => f.estado === estado).length;
    return {
      filas,
      resumen: { total: filas.length, listas: cuenta('lista'), existentes: cuenta('existe'), errores: cuenta('error') },
    };
  }

  /**
   * Registra a cada persona con el mismo registro del formulario. Si una falla
   * (por ejemplo, alguien la registró entre la revisión y la confirmación), se
   * omite y se informa; las demás se registran igual.
   */
  async registrar(personas: CreatePersonaDto[], user: AuthenticatedUser): Promise<ResultadoCarga> {
    const resultado: ResultadoCarga = { registradas: 0, omitidas: [] };
    for (const persona of personas) {
      try {
        await this.personas.create(persona, user);
        resultado.registradas++;
      } catch (error) {
        if (!(error instanceof HttpException)) throw error;
        resultado.omitidas.push({ numeroDocumento: persona.numeroDocumento, motivo: error.message });
      }
    }
    this.logger.log(`Carga masiva de ${user.correo}: ${resultado.registradas} registradas, ${resultado.omitidas.length} omitidas`);
    return resultado;
  }
}
