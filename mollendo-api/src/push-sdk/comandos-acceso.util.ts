/**
 * Comandos del protocolo PUSH de **control de acceso** (variante ACC del G4
 * Pro), confirmados con el equipo real HSR3263100192 el 04/oct/2026. No son los
 * del protocolo de asistencia (`USERINFO`, que el equipo rechaza con -629):
 *
 * - `user`: la persona, con su número de documento como `Pin`.
 * - `extuser`: el nombre y el apellido que muestra la pantalla del equipo.
 * - `biophoto`: la foto; el equipo la convierte en una plantilla de rostro
 *   (`biodata` tipo 9) y con ella reconoce a la persona.
 * - `userauthorize`: el permiso de paso (zona horaria 1, puerta 1). Sin él, el
 *   equipo rechaza a la persona (`rtlog event=23`) aunque la reconozca.
 *
 * Campos separados por tabulador, como exige el protocolo.
 */
const T = '\t';

/**
 * Pin del equipo: el número de documento (DNI, carné de extranjería o
 * pasaporte). El G4 Pro acepta letras y números de hasta 24 caracteres
 * (confirmado con el equipo real, 05/oct/2026: "99CE00451" y pins de 12, 18 y
 * 24 caracteres, también para el permiso de paso).
 */
export function pinDeDocumento(numeroDocumento: string): string | null {
  const limpio = numeroDocumento.trim().toUpperCase();
  return /^[A-Z0-9]{1,24}$/.test(limpio) ? limpio : null;
}

/** Texto apto para un campo del comando: sin tabuladores ni saltos de línea, y acotado. */
export function textoCampo(texto: string, maximo = 24): string {
  return texto.replace(/[\t\r\n=]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maximo);
}

export interface PersonaParaEquipo {
  pin: string;
  nombres: string;
  apellidos: string;
}

/** Alta o actualización de la persona (sin permiso de paso). */
export function comandosPersona(p: PersonaParaEquipo): string[] {
  const nombre = textoCampo(`${p.nombres} ${p.apellidos}`);
  return [
    `DATA UPDATE user CardNo=${T}Pin=${p.pin}${T}Password=${T}Group=0${T}StartTime=0${T}EndTime=0${T}Name=${nombre}${T}Privilege=0`,
    `DATA UPDATE extuser Pin=${p.pin}${T}FunSwitch=0${T}FirstName=${textoCampo(p.nombres)}${T}LastName=${textoCampo(p.apellidos)}${T}PersonalVs=0`,
  ];
}

/** Foto de la persona (JPG en base64, ya convertido con convertirFotoParaG4Pro). */
export function comandoFoto(pin: string, fotoBase64: string): string {
  return `DATA UPDATE biophoto PIN=${pin}${T}Type=9${T}Size=${fotoBase64.length}${T}Content=${fotoBase64}${T}Format=0${T}Url=${T}PostBackTmpFlag=0`;
}

/**
 * Borra a la persona del equipo. `DATA DELETE user` borra su rostro, pero no su
 * nombre (`extuser`) ni sus permisos (`userauthorize`): se borran aparte
 * (confirmado con el equipo real, 05/oct/2026).
 */
export function comandosBorrarPersona(pin: string): string[] {
  return [`DATA DELETE userauthorize Pin=${pin}`, `DATA DELETE extuser Pin=${pin}`, `DATA DELETE user Pin=${pin}`];
}

/** Permiso de paso (habilitar) o su retiro (deshabilitar). */
export function comandoHabilitar(pin: string): string {
  return `DATA UPDATE userauthorize Pin=${pin}${T}AuthorizeTimezoneId=1${T}AuthorizeDoorId=1`;
}

export function comandoDeshabilitar(pin: string): string {
  return `DATA DELETE userauthorize Pin=${pin}${T}AuthorizeDoorId=1`;
}

/**
 * Números de usuario (pin) de la respuesta a
 * `DATA QUERY tablename=user,fielddesc=*,filter=*` (una línea por usuario:
 * `user uid=20<TAB>cardno=<TAB>pin=48058719<TAB>…`).
 */
export function pinsDeRespuestaUsuarios(datos: string): string[] {
  const pins = new Set<string>();
  for (const linea of datos.split(/\r?\n/)) {
    const pin = /(?:^|[\t ])pin=([^\t\r\n ]*)/i.exec(linea)?.[1];
    if (pin) pins.add(pin);
  }
  return [...pins];
}

/**
 * Personas del sistema que están en el equipo con datos distintos de los que
 * les pone el sistema (`comandosPersona`): contraseña, privilegio de
 * administrador, tarjeta, deshabilitada, vigencia o nombre cambiados a mano en
 * el menú del equipo. Una contraseña, por ejemplo, podría servir para
 * identificarse sin el rostro. Se comparan solo las que están en `esperadas`.
 */
export function usuariosConDatosDistintos(respuestaUsuarios: string, esperadas: Map<string, PersonaParaEquipo>): string[] {
  const distintos: string[] = [];
  for (const linea of respuestaUsuarios.split(/\r?\n/)) {
    const campos: Record<string, string> = {};
    for (const parte of linea.split('\t')) {
      const igual = parte.indexOf('=');
      if (igual > 0) campos[parte.slice(0, igual).replace(/^user\s+/i, '').trim().toLowerCase()] = parte.slice(igual + 1).trim();
    }
    const persona = campos.pin ? esperadas.get(campos.pin) : undefined;
    if (!persona) continue;
    const sinValor = (v: string | undefined) => !v || v === '0';
    const nombre = textoCampo(`${persona.nombres} ${persona.apellidos}`).normalize('NFC');
    const correcto =
      !campos.password &&
      sinValor(campos.privilege) &&
      sinValor(campos.cardno) &&
      sinValor(campos.disable) &&
      sinValor(campos.starttime) &&
      sinValor(campos.endtime) &&
      (campos.name ?? '').normalize('NFC') === nombre;
    if (!correcto) distintos.push(campos.pin);
  }
  return distintos;
}

/** Valor de la respuesta a `DATA COUNT <tabla>` (`userauthorize=50` → 50), o null si no se entiende. */
export function conteoDeRespuesta(datos: string, tabla: string): number | null {
  const valor = new RegExp(`${tabla}=(\\d+)`, 'i').exec(datos)?.[1];
  return valor === undefined ? null : Number(valor);
}

/**
 * Qué hacer para que el equipo tenga exactamente al personal del sistema:
 * borrar los usuarios que el sistema no conoce (por ejemplo, registrados a
 * mano en el equipo) y agregar a los activos que faltan. Las personas dadas
 * de baja pueden quedar en el equipo: nunca se las habilita.
 */
export function planDeSincronizacion(pinsEquipo: string[], pinsSistema: Set<string>, pinsActivos: Set<string>) {
  const enEquipo = new Set(pinsEquipo);
  return {
    sobrantes: pinsEquipo.filter((pin) => !pinsSistema.has(pin)),
    faltantes: [...pinsActivos].filter((pin) => !enEquipo.has(pin)),
  };
}

/**
 * Cuántos comandos pendientes se entregan en una consulta del equipo. El G4 Pro
 * ejecuta como mucho 256 por consulta y descarta el resto sin avisar
 * (confirmado con el equipo real, 17/oct/2026: de 300 borrados confirmó 256 y
 * los otros 44 quedaron sin respuesta). Se entregan de a 100 y, con fotos
 * (cada una pesa decenas de KB), hasta ~512 KB; siempre al menos uno. Los
 * demás quedan pendientes para la consulta siguiente (unos segundos después).
 * Los permisos de paso van primero (ver esPermisoDePaso).
 */
export const MAX_COMANDOS_POR_ENTREGA = 100;
export const MAX_BYTES_POR_ENTREGA = 512 * 1024;

/**
 * Dar o quitar el permiso de paso: va antes que el resto de la cola, para que
 * quien acaba de pasar su DNI no espere detrás de una carga grande (p. ej. una
 * carga masiva o una sincronización con fotos).
 */
export function esPermisoDePaso(comando: string): boolean {
  return comando.startsWith('DATA UPDATE userauthorize ') || comando.startsWith('DATA DELETE userauthorize ');
}

export function loteDeComandos<T extends { comando: string }>(
  pendientes: T[],
  maxCantidad = MAX_COMANDOS_POR_ENTREGA,
  maxBytes = MAX_BYTES_POR_ENTREGA,
): T[] {
  const lote: T[] = [];
  let bytes = 0;
  // Orden estable: primero los permisos de paso, cada grupo en su orden de llegada.
  const ordenados = [...pendientes.filter((c) => esPermisoDePaso(c.comando)), ...pendientes.filter((c) => !esPermisoDePaso(c.comando))];
  for (const c of ordenados) {
    if (lote.length >= maxCantidad) break;
    if (lote.length > 0 && bytes + c.comando.length > maxBytes) break;
    lote.push(c);
    bytes += c.comando.length;
  }
  return lote;
}
