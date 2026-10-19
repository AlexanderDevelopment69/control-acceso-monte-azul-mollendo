/**
 * Quién aprobó rostro y alcohol en el G4 Pro. El `rtlog` del éxito llega con
 * `pin=0`, pero el launcher del equipo anota cada verificación exitosa, con el
 * DNI, en un archivo de rastreo sin cifrar (hallado el 19/10/2026, ver
 * Protocolo_G4Pro_Referencia.md sección 10.2 bis). Se lee por el protocolo con
 * `SHELL`, una línea por pase:
 *
 *   2026-10-17 18:48:41 446:userPin->15724705; userName->Fernando Herrera Broncales:
 *
 * La línea se escribe ~1 s después de que el equipo manda el `rtlog`.
 */
export const COMANDO_VERIFY_SUCCESS = 'SHELL tail -n 5 /sdcard/ZKTeco/trace/VerifySuccess.txt';

export interface PaseExitoso {
  /** Hora del equipo (misma zona horaria que el `time=` del rtlog). */
  hora: Date;
  pin: string;
  nombre: string;
}

const LINEA = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\d{1,3}):userPin->([^;]*); userName->(.*?):?\s*$/;

/** Las líneas del archivo que se entienden (las demás se ignoran). */
export function leerVerifySuccess(texto: string): PaseExitoso[] {
  const pases: PaseExitoso[] = [];
  for (const linea of texto.split(/\r?\n/)) {
    const m = LINEA.exec(linea.trim());
    if (!m) continue;
    const hora = new Date(`${m[1].replace(' ', 'T')}.${m[2].padStart(3, '0')}`);
    const pin = m[3].trim();
    if (Number.isNaN(hora.getTime()) || !pin) continue;
    pases.push({ hora, pin, nombre: m[4].trim() });
  }
  return pases;
}

/**
 * Hasta cuánto después del rtlog puede estar la línea del mismo pase. Corto
 * para no tomar la del pase siguiente (rostro y alcohol tardan más que esto).
 */
const DESPUES_MS = 5_000;

/**
 * El pase que corresponde al `rtlog` de la hora indicada: la línea escrita
 * desde ese segundo hasta 5 s después. Nunca antes: el equipo la escribe
 * después de mandar el rtlog (17:36:13 → 17:36:13.843, 18:48:40 →
 * 18:48:41.446), y una línea anterior es del pase anterior. Si hay líneas de
 * **personas distintas** en ese rango, no se puede saber cuál fue: null.
 */
export function paseDelRtlog(pases: PaseExitoso[], horaRtlog: Date): PaseExitoso | null {
  const t = horaRtlog.getTime();
  const cerca = pases.filter((p) => p.hora.getTime() >= t && p.hora.getTime() <= t + DESPUES_MS);
  if (cerca.length === 0 || new Set(cerca.map((p) => p.pin)).size > 1) return null;
  return cerca.sort((a, b) => a.hora.getTime() - b.hora.getTime())[0];
}

/**
 * Respuesta de un `SHELL` por `/iclock/devicecmd`, en varias líneas:
 * `ID=<id>`, `SN=…`, `Return=…`, `CMD=Shell`, `FILENAME=…` y `Content=<salida>`
 * (la salida sigue en las líneas siguientes). null si no es una respuesta de SHELL.
 */
export function respuestaShell(cuerpo: string): { id: number; salida: string } | null {
  if (!/^CMD=Shell\s*$/im.test(cuerpo)) return null;
  const id = Number(/^ID=(\d+)/m.exec(cuerpo)?.[1]);
  const inicio = cuerpo.indexOf('Content=');
  if (!Number.isFinite(id) || inicio < 0) return null;
  return { id, salida: cuerpo.slice(inicio + 'Content='.length) };
}
