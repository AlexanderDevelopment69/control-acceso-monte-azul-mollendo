// Registro de desconexiones (Auditoría, dato "Equipos"): qué equipo o servicio
// está caído en un momento, con el texto con que queda registrado.
import { RESPALDO_ATRASADO_MS, type EstadoParaAvisos } from './avisos-sistema.js';

export interface Falla {
  /** Nombre del equipo o servicio; también identifica la falla (una por equipo). */
  etiqueta: string;
  /** Qué le pasa (después de "etiqueta: "). */
  caida: string;
}

/** Lo que depende del controlador (mini PC): sin él no se puede saber su estado. */
export const dependeDelControlador = (etiqueta: string) => etiqueta.startsWith('Lector de DNI') || etiqueta.startsWith('Relé');

/**
 * Equipos y servicios caídos ahora, uno por equipo. Sin el controlador, sus
 * lectores y relés no se cuentan (no se sabe cómo están; queda registrado el
 * controlador).
 */
export function fallasEquipos(e: EstadoParaAvisos): Falla[] {
  const fallas: Falla[] = [];
  if (e.baseDeDatos.estado !== 'up') fallas.push({ etiqueta: 'Base de datos', caida: 'sin conexión' });
  if (e.respaldos.disponible) {
    const ultimo = e.respaldos.ultimoAutomatico;
    if (!ultimo || new Date(e.fecha).getTime() - new Date(ultimo.fecha).getTime() > RESPALDO_ATRASADO_MS) {
      fallas.push({ etiqueta: 'Respaldos', caida: 'atrasados (más de 26 horas sin respaldo automático)' });
    }
  }
  const varios = e.dispositivos.length > 1;
  for (const d of e.dispositivos) {
    if (!d.enLinea) fallas.push({ etiqueta: `Equipo facial (G4 Pro)${varios ? ` ${d.serialNumber}` : ''}`, caida: 'desconectado' });
  }
  if (e.controlador.remoto && !e.controlador.conectado) {
    fallas.push({ etiqueta: 'Controlador (PC)', caida: 'desconectado (sin internet o apagado)' });
    return fallas;
  }
  for (const puerta of ['ingreso', 'salida'] as const) {
    const lector = e.lectoresDni[puerta];
    if (lector.configurado && !lector.conectado) {
      fallas.push({
        etiqueta: `Lector de DNI de ${puerta}`,
        caida: e.controlador.remoto ? 'desconectado. Contingencia "sin lector" activada' : 'desconectado',
      });
    }
  }
  const reles = e.releMolinetes;
  const reviso = (rele: { conectado: boolean } | undefined, etiqueta: string) => {
    if (rele && !rele.conectado) fallas.push({ etiqueta, caida: 'desconectado' });
  };
  reviso(reles.ingreso, 'Relé del molinete de ingreso');
  reviso(reles.salida, 'Relé del molinete de salida');
  reviso(reles.avisoIngreso, 'Relé de aviso de ingreso');
  reviso(reles.avisoSalida, 'Relé de aviso de salida');
  return fallas;
}

/** "45 s", "2 min 5 s", "1 h 4 min", "2 días 3 h". */
export function duracionTexto(ms: number): string {
  const s = Math.max(1, Math.round(ms / 1000));
  if (s < 60) return `${s} s`;
  const min = Math.floor(s / 60);
  if (min < 60) return s % 60 ? `${min} min ${s % 60} s` : `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return min % 60 ? `${h} h ${min % 60} min` : `${h} h`;
  const dias = Math.floor(h / 24);
  return `${dias} ${dias === 1 ? 'día' : 'días'}${h % 24 ? ` ${h % 24} h` : ''}`;
}

/** Texto de cuando el equipo vuelve, con cuánto duró la falla. */
export function textoVuelta(etiqueta: string, ms: number, remoto: boolean): string {
  const dur = duracionTexto(ms);
  if (etiqueta === 'Respaldos') return `${etiqueta}: al día de nuevo (estuvieron atrasados ${dur})`;
  const femenino = etiqueta === 'Base de datos';
  const sinLector = remoto && etiqueta.startsWith('Lector de DNI') ? '. Contingencia "sin lector" terminada' : '';
  return `${etiqueta}: ${femenino ? 'conectada' : 'conectado'} de nuevo (estuvo ${dur} sin conexión)${sinLector}`;
}
