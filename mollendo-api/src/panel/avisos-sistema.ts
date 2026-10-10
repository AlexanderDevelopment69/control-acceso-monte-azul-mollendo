// Lo que "Sistema y APIs" muestra en rojo, como avisos para la franja que el
// portal pone arriba de todas las páginas (administrador y vigilancia).

/** Más de 26 horas sin respaldo automático: alguno falló (se hace uno por día). */
export const RESPALDO_ATRASADO_MS = 26 * 60 * 60 * 1000;

export type TipoAviso = 'base-de-datos' | 'clave' | 'respaldos' | 'controlador' | 'terminal' | 'lector' | 'rele' | 'aviso';

export interface AvisoSistema {
  tipo: TipoAviso;
  /** Qué equipo o parte del sistema. */
  equipo: string;
  estado: string;
  /** Qué deja de funcionar, en palabras del vigilante. */
  impacto: string;
  /** Desde cuándo (última vez que se lo vio bien), si se sabe. */
  desde: string | null;
  /** critico: bloquea ingresos o salidas; advertencia: no los bloquea. */
  gravedad: 'critico' | 'advertencia';
}

interface Lector {
  configurado: boolean;
  conectado: boolean;
  ultimaLectura: string | null;
}
interface Rele {
  conectado: boolean;
}

/** La parte del estado de "Sistema y APIs" que hace falta para los avisos. */
export interface EstadoParaAvisos {
  fecha: string;
  baseDeDatos: { estado: 'up' | 'down' };
  claveEquiposConfigurada: boolean;
  respaldos: { disponible: boolean; ultimoAutomatico: { fecha: string } | null };
  dispositivos: { serialNumber: string; enLinea: boolean; ultimaActividad: string | null }[];
  lectoresDni: { ingreso: Lector; salida: Lector };
  releMolinetes: { ingreso?: Rele; salida?: Rele; avisoIngreso?: Rele; avisoSalida?: Rele };
  controlador: { remoto: boolean; conectado: boolean; ultimoReporte: string | null };
}

export function avisosDelSistema(e: EstadoParaAvisos): AvisoSistema[] {
  const avisos: AvisoSistema[] = [];
  const critico = (tipo: TipoAviso, equipo: string, estado: string, impacto: string, desde: string | null = null) =>
    avisos.push({ tipo, equipo, estado, impacto, desde, gravedad: 'critico' });
  const advertencia = (tipo: TipoAviso, equipo: string, estado: string, impacto: string, desde: string | null = null) =>
    avisos.push({ tipo, equipo, estado, impacto, desde, gravedad: 'advertencia' });

  if (e.baseDeDatos.estado !== 'up') {
    critico('base-de-datos', 'Base de datos', 'Sin conexión', 'No se pueden validar ingresos ni salidas');
  }
  if (!e.claveEquiposConfigurada) {
    critico('clave', 'Clave de equipos físicos', 'No configurada', 'Los equipos no pueden registrar ingresos ni salidas');
  }

  // Si el controlador de la garita está caído se avisa una sola vez, no cada lector y relé que depende de él.
  if (e.controlador.remoto && !e.controlador.conectado) {
    critico(
      'controlador',
      'Controlador',
      'Desconectado',
      'Nadie puede ingresar; la salida sigue con la lista del personal guardada',
      e.controlador.ultimoReporte,
    );
  } else {
    const lectores = [
      ['ingreso', e.lectoresDni.ingreso],
      ['salida', e.lectoresDni.salida],
    ] as const;
    for (const [puerta, lector] of lectores) {
      if (lector.configurado && !lector.conectado) {
        critico('lector', `Lector de DNI de ${puerta}`, 'Cable desconectado', `No se leen DNI en la ${puerta}`, lector.ultimaLectura);
      }
    }
    const r = e.releMolinetes;
    if (r.ingreso && !r.ingreso.conectado) critico('rele', 'Relé del molinete de ingreso', 'No conectado', 'El molinete de ingreso no se abre');
    if (r.salida && !r.salida.conectado) critico('rele', 'Relé del molinete de salida', 'No conectado', 'El molinete de salida no se abre');
    if (r.avisoIngreso && !r.avisoIngreso.conectado) {
      advertencia('aviso', 'Relé de aviso de ingreso', 'No conectado', 'No suena el aviso cuando se deniega un ingreso');
    }
    if (r.avisoSalida && !r.avisoSalida.conectado) {
      advertencia('aviso', 'Relé de aviso de salida', 'No conectado', 'No suena el aviso cuando se deniega una salida');
    }
  }

  for (const d of e.dispositivos) {
    if (!d.enLinea) {
      critico('terminal', `Terminal facial ${d.serialNumber}`, 'Desconectado', 'Nadie puede ingresar: no reconoce el rostro ni toma la prueba de alcohol', d.ultimaActividad);
    }
  }

  if (e.respaldos.disponible) {
    const ultimo = e.respaldos.ultimoAutomatico;
    if (!ultimo || new Date(e.fecha).getTime() - new Date(ultimo.fecha).getTime() > RESPALDO_ATRASADO_MS) {
      advertencia('respaldos', 'Respaldos', 'Atrasados', 'El último respaldo automático tiene más de 26 horas', ultimo?.fecha ?? null);
    }
  }

  return avisos;
}
