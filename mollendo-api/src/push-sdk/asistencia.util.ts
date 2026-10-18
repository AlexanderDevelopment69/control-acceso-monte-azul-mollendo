/**
 * Protocolo PUSH de **asistencia** del G4 Pro, junto al de control de acceso
 * (en prueba, 17/10/2026). En modo asistencia el equipo envía un registro
 * (`table=ATTLOG`) por cada verificación **con el DNI y el grado de alcohol**
 * (`44943297\t2026-09-28 13:03:31\t255\t15\t...\t0.00g/L`, visto en el
 * PushDemo del proveedor con el mismo firmware 4.1.109-OCM-4101-3). En el de
 * control de acceso, el aprobado llega con `pin=0`. Para que lo envíe, el
 * servidor debe responder a `GET /iclock/cdata?options=all` con las opciones
 * de asistencia y `TransFlag` con `AttLog` (como el PushDemo). Funciones
 * puras, sin acceso a la red, para poder probarlas.
 */

/** Opciones del modo asistencia: el equipo envía los registros de asistencia (ATTLOG) al instante. */
export function opcionesAsistencia(serialNumber: string): string {
  return [
    `GET OPTION FROM: ${serialNumber}`,
    'ATTLOGStamp=0',
    'OPERLOGStamp=9999',
    'ATTPHOTOStamp=9999',
    'ErrorDelay=60',
    // Cada cuánto consulta al servidor: el mismo valor que en control de acceso (RequestDelay=2).
    'Delay=2',
    'TransTimes=00:00;14:00',
    'TransInterval=1',
    'TransFlag=TransData AttLog',
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
}

/**
 * Lee una línea de `table=ATTLOG`: campos separados por tabulador, en el
 * orden del protocolo (PIN, fecha y hora, estado, tipo de verificación, ...).
 * El grado de alcohol viene en uno de los campos siguientes, terminado en
 * "g/L". Devuelve null si la línea no tiene un PIN y una fecha válidos.
 */
export function leerRegistroAsistencia(linea: string): RegistroAsistencia | null {
  const campos = linea.split('\t').map((c) => c.trim());
  const [pin, hora, estado, verificacion] = campos;
  if (!pin || !/^[A-Z0-9]{1,24}$/i.test(pin) || !hora || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(hora)) return null;
  const alcohol = campos.slice(4).find((c) => /g\/L$/i.test(c)) ?? null;
  return { pin, hora, estado: estado || null, verificacion: verificacion || null, alcohol };
}
