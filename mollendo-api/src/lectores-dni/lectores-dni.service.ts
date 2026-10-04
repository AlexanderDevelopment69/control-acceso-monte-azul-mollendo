import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import tty from 'node:tty';
import { promisify } from 'node:util';
import { EventosAccesoService } from '../eventos-acceso/eventos-acceso.service.js';
import { extraerDocumento, FiltroRepetidos, SeparadorLineas } from './lector-dni.util.js';

const ejecutar = promisify(execFile);

/** Espera antes de volver a abrir un lector que se desconectó o no se pudo abrir. */
const REINTENTO_MS = 5000;

type Movimiento = 'ingreso' | 'salida';

export interface EstadoLectorDni {
  configurado: boolean;
  conectado: boolean;
  ultimaLectura: string | null;
  error: string | null;
}

interface Lector {
  movimiento: Movimiento;
  puerto: string;
  molinete: string;
  separador: SeparadorLineas;
  repetidos: FiltroRepetidos;
  stream: tty.ReadStream | null;
  reintento: NodeJS.Timeout | null;
  ultimaLectura: Date | null;
  error: string | null;
}

/**
 * Lee los lectores de DNI (Syble XB-7705H en modo RS232) conectados a la
 * mini PC y registra cada lectura como ingreso o salida, igual que
 * `POST /eventos-acceso/ingreso|salida`.
 *
 * Cada lector se configura con `LECTOR_DNI_INGRESO_PUERTO` /
 * `LECTOR_DNI_SALIDA_PUERTO` (el dispositivo dentro del contenedor) y
 * `LECTOR_DNI_BAUDIOS` (115200 por defecto, la velocidad de fábrica del
 * lector en RS232). El puerto se configura con `stty` (viene en la imagen
 * Alpine) y se lee con `tty.ReadStream`, sin dependencias nativas. Si el
 * lector se desconecta o no se puede abrir, se reintenta cada 5 s.
 */
@Injectable()
export class LectoresDniService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LectoresDniService.name);
  private readonly lectores: Lector[] = [];
  private cerrando = false;

  constructor(private readonly eventosAcceso: EventosAccesoService) {}

  onModuleInit() {
    for (const movimiento of ['ingreso', 'salida'] as const) {
      const clave = movimiento.toUpperCase();
      const puerto = process.env[`LECTOR_DNI_${clave}_PUERTO`]?.trim();
      if (!puerto) continue;
      const lector: Lector = {
        movimiento,
        puerto,
        molinete: process.env[`LECTOR_DNI_${clave}_MOLINETE`]?.trim() || (movimiento === 'ingreso' ? 'Ingreso' : 'Salida'),
        separador: new SeparadorLineas(),
        repetidos: new FiltroRepetidos(),
        stream: null,
        reintento: null,
        ultimaLectura: null,
        error: null,
      };
      this.lectores.push(lector);
      void this.abrir(lector);
    }
  }

  onModuleDestroy() {
    this.cerrando = true;
    for (const lector of this.lectores) {
      if (lector.reintento) clearTimeout(lector.reintento);
      lector.stream?.destroy();
    }
  }

  /** Estado de cada lector para "Sistema y APIs". */
  estado(): Record<Movimiento, EstadoLectorDni> {
    const de = (movimiento: Movimiento): EstadoLectorDni => {
      const lector = this.lectores.find((l) => l.movimiento === movimiento);
      return {
        configurado: !!lector,
        conectado: !!lector?.stream,
        ultimaLectura: lector?.ultimaLectura?.toISOString() ?? null,
        error: lector?.error ?? null,
      };
    };
    return { ingreso: de('ingreso'), salida: de('salida') };
  }

  private async abrir(lector: Lector) {
    lector.reintento = null;
    if (this.cerrando) return;
    const baudios = process.env.LECTOR_DNI_BAUDIOS?.trim() || '115200';
    try {
      await ejecutar('stty', ['-F', lector.puerto, baudios, 'raw', '-echo', 'clocal', 'cs8', '-cstopb', '-parenb', '-crtscts']);
      const fd = fs.openSync(lector.puerto, fs.constants.O_RDONLY | fs.constants.O_NOCTTY | fs.constants.O_NONBLOCK);
      const stream = new tty.ReadStream(fd);
      stream.on('data', (pedazo: Buffer) => this.recibir(lector, pedazo));
      stream.on('error', (error) => this.desconectado(lector, error.message));
      stream.on('close', () => this.desconectado(lector, 'el puerto se cerró'));
      lector.stream = stream;
      lector.error = null;
      this.logger.log(`Lector de DNI de ${lector.movimiento} conectado en ${lector.puerto} (${baudios} baudios)`);
    } catch (error) {
      this.desconectado(lector, (error as Error).message);
    }
  }

  private desconectado(lector: Lector, motivo: string) {
    if (lector.stream) {
      lector.stream.removeAllListeners();
      lector.stream.destroy();
      lector.stream = null;
    }
    if (lector.error !== motivo) {
      this.logger.warn(`Lector de DNI de ${lector.movimiento} (${lector.puerto}) desconectado: ${motivo}. Se reintenta cada ${REINTENTO_MS / 1000} s.`);
    }
    lector.error = motivo;
    if (!this.cerrando && !lector.reintento) lector.reintento = setTimeout(() => void this.abrir(lector), REINTENTO_MS);
  }

  private recibir(lector: Lector, pedazo: Buffer) {
    for (const linea of lector.separador.agregar(pedazo.toString('latin1'))) {
      const documento = extraerDocumento(linea);
      if (!documento) {
        this.logger.warn(`Lector de DNI de ${lector.movimiento}: se ignoró una lectura que no es un DNI (${linea.length} caracteres)`);
        continue;
      }
      if (lector.repetidos.esRepetido(documento.numeroDocumento)) continue;
      lector.ultimaLectura = new Date();
      void this.registrar(lector, documento);
    }
  }

  private async registrar(lector: Lector, documento: NonNullable<ReturnType<typeof extraerDocumento>>) {
    const dto = { ...documento, torniqueteId: lector.molinete };
    try {
      const resultado =
        lector.movimiento === 'ingreso' ? await this.eventosAcceso.registrarIngreso(dto) : await this.eventosAcceso.registrarSalida(dto);
      const estado = 'estado' in resultado ? resultado.estado : resultado.resultado;
      this.logger.log(`DNI leído en ${lector.movimiento}: ${estado}`);
    } catch (error) {
      this.logger.error(`No se pudo registrar el DNI leído en ${lector.movimiento}: ${(error as Error).message}`);
    }
  }
}
