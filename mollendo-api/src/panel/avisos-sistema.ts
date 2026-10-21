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
  const agregar = (tipo: TipoAviso, equipo: string, estado: string, impacto: string, desde: string | null = null) =>
    avisos.push({ tipo, equipo, estado, impacto, desde });

  if (e.baseDeDatos.estado !== 'up') {
    agregar('base-de-datos', 'Base de datos', 'Sin conexión', 'No se pueden validar ingresos ni salidas');
  }
  if (!e.claveEquiposConfigurada) {
    agregar('clave', 'Clave de equipos físicos', 'No configurada', 'Los equipos no pueden registrar ingresos ni salidas');
  }

  if (e.respaldos.disponible) {
    const ultimo = e.respaldos.ultimoAutomatico;
    if (!ultimo || new Date(e.fecha).getTime() - new Date(ultimo.fecha).getTime() > RESPALDO_ATRASADO_MS) {
      agregar('respaldos', 'Respaldos', 'Atrasados', 'El último respaldo automático tiene más de 26 horas', ultimo?.fecha ?? null);
    }
  }

  // Un aviso por tarjeta de "Equipos de acceso", en el mismo orden que la pantalla.
  const sinControlador = e.controlador.remoto && !e.controlador.conectado;
  if (sinControlador) {
    agregar(
      'controlador',
      'Controlador',
      'Desconectado',
      'Nadie puede ingresar; la salida sigue con la lista del personal guardada',
      e.controlador.ultimoReporte,
    );
  }

  for (const d of e.dispositivos) {
    if (!d.enLinea) {
      agregar('terminal', `Terminal facial ${d.serialNumber}`, 'Desconectado', 'Nadie puede ingresar: no reconoce el rostro ni toma la prueba de alcohol', d.ultimaActividad);
    }
  }

  // Lectores y relés: sin el controlador están todos caídos; si no, solo los que fallan.
  const puertas = (ingreso: boolean, salida: boolean) =>
    ingreso && salida ? 'ingreso y salida' : ingreso ? 'ingreso' : salida ? 'salida' : null;

  const ingresoLector = e.lectoresDni.ingreso;
  const salidaLector = e.lectoresDni.salida;
  const lectores = sinControlador
    ? 'ingreso y salida'
    : puertas(ingresoLector.configurado && !ingresoLector.conectado, salidaLector.configurado && !salidaLector.conectado);
  if (lectores) {
    agregar(
      'lector',
      'Lectores de DNI',
      sinControlador ? 'Desconectados' : `Desconectado: ${lectores}`,
      sinControlador
        ? 'Sin el controlador no se leen DNI en ingreso ni salida'
        : `No se leen DNI en ${lectores === 'ingreso y salida' ? 'el ingreso ni en la salida' : lectores === 'ingreso' ? 'el ingreso' : 'la salida'}${
            // Con el controlador en línea se activa sola la contingencia (ingreso por rostro; salida desde Presentes ahora).
            e.controlador.remoto ? '. Contingencia «sin lector» activa' : ''
          }`,
    );
  }

  const r = e.releMolinetes;
  const molinetes = sinControlador ? 'ingreso y salida' : puertas(!!r.ingreso && !r.ingreso.conectado, !!r.salida && !r.salida.conectado);
  if (molinetes) {
    agregar(
      'rele',
      'Relés de molinetes',
      sinControlador ? 'Desconectados' : `Desconectado: ${molinetes}`,
      sinControlador
        ? 'Sin el controlador no se abren los molinetes'
        : `No se abre el molinete de ${molinetes === 'ingreso y salida' ? 'ingreso ni el de salida' : molinetes}`,
    );
  }

  const avisoIngreso = !!r.avisoIngreso && (sinControlador || !r.avisoIngreso.conectado);
  const avisoSalida = !!r.avisoSalida && (sinControlador || !r.avisoSalida.conectado);
  const avisosCaidos = puertas(avisoIngreso, avisoSalida);
  if (avisosCaidos) {
    agregar(
      'aviso',
      'Relés de aviso',
      sinControlador ? 'Desconectados' : `Desconectado: ${avisosCaidos}`,
      sinControlador
        ? 'Sin el controlador no suenan los avisos de ingreso o salida denegados'
        : `No suena el aviso cuando se deniega ${avisosCaidos === 'ingreso y salida' ? 'un ingreso o una salida' : avisosCaidos === 'ingreso' ? 'un ingreso' : 'una salida'}`,
    );
  }

  return avisos;
}
