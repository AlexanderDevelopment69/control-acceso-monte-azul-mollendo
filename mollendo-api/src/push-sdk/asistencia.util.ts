import { textoCampo } from './comandos-acceso.util.js';

/**
 * Protocolo PUSH de **asistencia** del G4 Pro (variante ATT del firmware, en
 * uso desde el 19/10/2026; ver protocolo-g4.ts). El equipo envía un registro
 * (`table=ATTLOG`) por cada verificación **con el DNI y el grado de alcohol**,
 * también cuando el alcohol sale alto (probado con el equipo real:
 * `48058719 2026-10-19 14:25:28 255 15 0 0 0 255 0 0 3 0.000951g/L - - -`, separado por tabuladores).
 * El estado es siempre 255: el resultado se decide con el grado
 * (alcoholConforme). Llega unos 10 a 15 s después del soplido (~1 s después de que el
 * equipo dice "correcto": tarda unos 8 s en darlo después de medir). En la variante
 * de control de acceso, el aprobado llega con `pin=0`. Para que lo envíe, el
 * servidor responde a `GET /iclock/cdata?options=all` con las opciones de
 * asistencia y `TransFlag` con `AttLog`. Los usuarios se registran con
 * `USERINFO` (comandoPersonaAsistencia). Funciones puras, sin acceso a la
 * red, para poder probarlas.
 */

const T = '\t';

/** Opciones del modo asistencia: el equipo envía los registros de asistencia (ATTLOG) al instante. */
export function opcionesAsistencia(serialNumber: string): string {
  return [
    `GET OPTION FROM: ${serialNumber}`,
    'ATTLOGStamp=0',
    'OPERLOGStamp=9999',
    // 0 (antes 9999): que el equipo envíe también la foto de la verificación (AttPhoto).
    'ATTPHOTOStamp=0',
    'ErrorDelay=60',
    // Cada cuánto consulta al servidor: el mismo valor que en control de acceso (RequestDelay=2).
    'Delay=2',
    'TransTimes=00:00;14:00',
    'TransInterval=1',
    // AttLog (registro con DNI y alcohol) + AttPhoto (foto de la captura, que sube con PIN=<fecha>-<DNI>.jpg,
    // ver docs/g4pro: sección "Uploading Attendance Photo"). Separados por tabulador (formato II del protocolo).
    'TransFlag=TransData AttLog\tAttPhoto',
    'Realtime=1',
    'Encrypt=0',
    'ServerVer=2.2.14',
    'PushProtVer=2.4.1',
    // Sin TimeZone: el equipo conserva su hora (un valor mal puesto la cambiaría).
  ].join('\n');
}

/** Un registro de asistencia del equipo. */
export interface RegistroAsistencia {
  /** DNI de la persona verificada. */
  pin: string;
  /** Hora del equipo, como la envía ("2026-09-28 13:03:31"). */
  hora: string;
  /** Estado del registro (el PushDemo del proveedor mostró 255). */
  estado: string | null;
  /** Cómo se verificó (15 = rostro). */
  verificacion: string | null;
  /** Grado de alcohol que midió ("0.00g/L"), si viene. */
  alcohol: string | null;
  /** Número de la marcación en el equipo (campo 11): sube de uno en uno; un salto es una prueba que no llegó. */
  numero: number | null;
}

/**
 * Lee una línea de `table=ATTLOG`: campos separados por tabulador, en el
 * orden del protocolo de asistencia (sección 11.2): PIN, fecha y hora, estado
 * (255: sin tecla de estado), verificación (15: rostro), código de trabajo,
 * dos reservados, mascarilla (255: detección apagada), temperatura y
 * temperatura convertida. Después, propios del G4 Pro con alcoholímetro
 * (vistos el 19/10/2026): el número de la marcación (donde el protocolo pone
 * TimeOffset) y el grado de alcohol ("0.00g/L"); SleepTime, HealthStatus y
 * PlateNumber llegan vacíos ("-"). Detalle en docs/g4pro/Comparacion_ACC_ATT.md
 * 2 bis. El grado se busca por su "g/L". Devuelve null si la línea no tiene un
 * PIN y una fecha válidos.
 */
export function leerRegistroAsistencia(linea: string): RegistroAsistencia | null {
  const campos = linea.split('\t').map((c) => c.trim());
  const [pin, hora, estado, verificacion] = campos;
  if (!pin || !/^[A-Z0-9]{1,24}$/i.test(pin) || !hora || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(hora)) return null;
  const alcohol = campos.slice(4).find((c) => /g\/L$/i.test(c)) ?? null;
  const numero = alcohol && /^\d+$/.test(campos[10] ?? '') ? Number(campos[10]) : null;
  return { pin, hora, estado: estado || null, verificacion: verificacion || null, alcohol, numero };
}

/**
 * Alta o actualización de la persona en la variante de asistencia (probado
 * con el equipo real, 19/10/2026: Return=0). Sin contraseña ni tarjeta: solo
 * se identifica con el rostro. La foto va con el mismo comando que en control
 * de acceso (comandoFoto). Grupo 1 y horario 1: el de siempre.
 */
export function comandoPersonaAsistencia(p: { pin: string; nombres: string; apellidos: string }): string {
  const nombre = textoCampo(`${p.nombres} ${p.apellidos}`);
  return `DATA UPDATE USERINFO PIN=${p.pin}${T}Name=${nombre}${T}Pri=0${T}Passwd=${T}Card=${T}Grp=1${T}TZ=0000000100000000${T}Verify=-1${T}ViceCard=`;
}

/**
 * Un usuario de la respuesta a `DATA QUERY USERINFO` (`PIN=1\tName=…\tPri=0\t
 * Passwd=\tCard=\t…`) con los nombres de campo del control de acceso (`pin`,
 * `name`, `privilege`, `password`, `cardno`, …), para revisarlo con
 * pinsDeRespuestaUsuarios y usuariosConDatosDistintos.
 */
export function usuarioComoControlDeAcceso(campos: string): string {
  const valores: Record<string, string> = {};
  for (const parte of campos.split('\t')) {
    const igual = parte.indexOf('=');
    if (igual > 0) valores[parte.slice(0, igual).trim().toLowerCase()] = parte.slice(igual + 1).trim();
  }
  return [
    `pin=${valores.pin ?? ''}`,
    `name=${valores.name ?? ''}`,
    `privilege=${valores.pri ?? ''}`,
    `password=${valores.passwd ?? ''}`,
    `cardno=${valores.card ?? ''}`,
    `starttime=${valores.startdatetime ?? ''}`,
    `endtime=${valores.enddatetime ?? ''}`,
  ].join('\t');
}

/** Borra a la persona del equipo, con su rostro (variante de asistencia). */
export function comandoBorrarPersonaAsistencia(pin: string): string {
  return `DATA DELETE USERINFO PIN=${pin}`;
}

/** Grado de alcohol del registro ("0.000951g/L" → 0.000951), o null si no viene o no se entiende. */
export function gradoAlcohol(alcohol: string | null): number | null {
  const valor = /^(\d+(?:\.\d+)?)\s*g\/L$/i.exec(alcohol?.trim() ?? '')?.[1];
  return valor === undefined ? null : Number(valor);
}

/**
 * Umbral de alcohol en g/L: el mismo que tiene configurado el G4 Pro
 * (`AlcoholVolume=0.0001`, leído del equipo el 19/10/2026), para decidir igual
 * que su pantalla. Se cambia con G4PRO_UMBRAL_ALCOHOL (si se cambia en el
 * equipo, cambiarlo también aquí).
 */
export function umbralAlcohol(): number {
  const valor = Number(process.env.G4PRO_UMBRAL_ALCOHOL);
  return Number.isFinite(valor) && valor > 0 ? valor : 0.0001;
}

/** ¿Pasó la prueba de alcohol? Sin grado legible, no (ante la duda, no se abre). */
export function alcoholConforme(alcohol: string | null, umbral = umbralAlcohol()): boolean {
  const grado = gradoAlcohol(alcohol);
  return grado !== null && grado < umbral;
}
