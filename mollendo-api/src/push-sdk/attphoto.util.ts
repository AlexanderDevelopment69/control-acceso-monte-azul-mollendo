/**
 * Captura (`snapshot`) que el G4 Pro —equipo de luz visible— sube por su
 * cuenta en cada verificación: `POST /iclock/cdata?table=tabledata&tablename=ATTPHOTO`
 * (ver "Security PUSH Communication Protocol", sección 10.9). Cada registro
 * va con campos separados por tabulador:
 *
 *   `pin=<nombre>\tsn=<serie>\tsize=<bytes>\tphoto=<JPG en base64>`
 *
 * El campo `pin` **es el nombre del archivo**, con el formato
 * `<AAAAMMDDHHMMSS>-<idusuario>.jpg` (ej. `20181003143617-22.jpg`): el número
 * de la persona va en el nombre. Esto importa porque el `rtlog` del éxito
 * llega con `pin=0` (el firmware no dice quién), pero la captura **sí** podría
 * traer el DNI — es la única vía para recuperar la identidad (ver
 * `docs/g4pro/Protocolo_G4Pro_Referencia.md`, sección 10).
 *
 * Esta utilidad **no guarda la foto** (es biométrico): solo lee el nombre, la
 * serie y el tamaño, y deriva el posible DNI del nombre del archivo, para
 * poder correlacionarlo con el ingreso. Función pura, sin red, para probarla.
 */

export interface SnapshotRecibido {
  /** Nombre del archivo tal cual lo manda el equipo (`<fecha>-<dni>.jpg`). */
  nombreArchivo: string;
  /** Serie del equipo, si vino. */
  serie: string | null;
  /** Tamaño original de la captura en bytes, si vino. */
  tamano: string | null;
  /** DNI derivado del nombre del archivo (lo que sigue a la fecha), o null si no se reconoce. */
  pinDerivado: string | null;
}

/**
 * Deriva el número de usuario del nombre de la captura. El nombre es
 * `<AAAAMMDDHHMMSS>-<idusuario>.jpg`; se quita la extensión, se separa por "-"
 * y, si el primer trozo es la marca de tiempo de 14 dígitos, el resto es el
 * identificador (puede traer más de un trozo en algunos firmwares: se devuelve
 * el último, que es el número de la persona). Devuelve null si no encaja o si
 * el id es 0 (el equipo no identificó a nadie).
 */
export function pinDeNombreSnapshot(nombreArchivo: string): string | null {
  const base = nombreArchivo.replace(/\.jpe?g$/i, '');
  const trozos = base.split('-');
  if (trozos.length < 2 || !/^\d{14}$/.test(trozos[0])) return null;
  const id = trozos[trozos.length - 1].trim();
  if (!id || id === '0' || !/^[A-Za-z0-9]{1,24}$/.test(id)) return null;
  return id;
}

/** Lee una línea de `table=tabledata&tablename=ATTPHOTO`. Ignora el campo `photo` (biométrico). */
export function leerSnapshot(linea: string): SnapshotRecibido | null {
  const campos = new Map<string, string>();
  for (const parte of linea.split('\t')) {
    const i = parte.indexOf('=');
    if (i <= 0) continue;
    campos.set(parte.slice(0, i).trim().toLowerCase(), parte.slice(i + 1));
  }
  const nombreArchivo = (campos.get('pin') ?? '').trim();
  if (!nombreArchivo) return null;
  return {
    nombreArchivo,
    serie: campos.get('sn')?.trim() || null,
    tamano: campos.get('size')?.trim() || null,
    pinDerivado: pinDeNombreSnapshot(nombreArchivo),
  };
}
