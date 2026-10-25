import type { IngresoDto } from '../eventos-acceso/dto/ingreso.dto.js';
import type { SalidaDto } from '../eventos-acceso/dto/salida.dto.js';
import type { TarjetaLeidaDto } from '../eventos-acceso/dto/tarjeta-leida.dto.js';

/** Lo que interesa de la respuesta, para el registro: estado del ingreso o resultado de la salida. */
export interface ResultadoLectura {
  estado?: string;
  resultado?: string;
}

/**
 * Quién recibe los DNI que leen los lectores. En el servidor es
 * EventosAccesoService (los registra en la base de datos); en el Controlador (PC) como
 * controlador es ControladorService (los manda al servidor en la
 * nube). Así LectoresDniService es el mismo en los dos.
 */
export abstract class RegistroLecturas {
  abstract registrarIngreso(dto: IngresoDto): Promise<ResultadoLectura>;
  abstract registrarSalida(dto: SalidaDto): Promise<ResultadoLectura>;
  /** Tarjeta de contingencia (QR) pasada en lugar del DNI. */
  abstract registrarTarjeta(dto: TarjetaLeidaDto): Promise<ResultadoLectura>;
}
