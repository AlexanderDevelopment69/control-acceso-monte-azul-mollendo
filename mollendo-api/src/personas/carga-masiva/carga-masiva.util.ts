import ExcelJS from 'exceljs';
import { PERFILES, PERFIL_LABEL, type Perfil } from '../perfiles.js';
import { PERIODO_AL_REVES, PERIODO_INCOMPLETO, normalizarPeriodo } from '../periodo-autorizacion.js';

/**
 * Carga masiva de personal desde Excel: columnas de la plantilla, lectura del
 * archivo y revisión de cada fila (sin guardar nada). Las reglas son las mismas
 * del registro uno por uno (CreatePersonaDto y PersonasService.create), más:
 * la empresa debe existir y estar activa, y un documento ya registrado se omite.
 */

export const MAX_FILAS_CARGA = 2000;

export const COLUMNAS_CARGA = [
  { clave: 'perfil', titulo: 'Perfil', ancho: 28, ayuda: 'Elija de la lista: ' },
  { clave: 'empresa', titulo: 'Empresa', ancho: 46, ayuda: 'Elija de la lista (empresas activas del sistema) o escriba su RUC.' },
  { clave: 'tipoDocumento', titulo: 'Tipo de documento', ancho: 20, ayuda: 'DNI, CE (carné de extranjería) o PASAPORTE.' },
  { clave: 'numeroDocumento', titulo: 'Número de documento', ancho: 22, ayuda: 'Solo letras y números. El DNI tiene 8 dígitos (con los ceros de adelante).' },
  { clave: 'nombres', titulo: 'Nombres', ancho: 28, ayuda: 'Obligatorio.' },
  { clave: 'apellidos', titulo: 'Apellidos', ancho: 28, ayuda: 'Obligatorio.' },
  // Período de autorización (22/10/2026): opcional; si se pone, van las dos fechas y el motivo.
  { clave: 'autorizadoDesde', titulo: 'Fecha de ingreso', ancho: 18, ayuda: 'Opcional. DD/MM/AAAA: desde cuándo puede ingresar. Vacío si no tiene límite de fechas.', opcional: true },
  { clave: 'autorizadoHasta', titulo: 'Fecha de finalización', ancho: 20, ayuda: 'Opcional. DD/MM/AAAA: hasta cuándo puede ingresar (ese día incluido).', opcional: true },
  { clave: 'motivoAutorizacion', titulo: 'Motivo de la autorización', ancho: 36, ayuda: 'Obligatorio si pone las fechas. Por ejemplo: visita técnica, obra hasta fin de mes.', opcional: true },
] as const;

/** Columnas que la plantilla debe tener (las del período son opcionales: una plantilla anterior sigue sirviendo). */
const OBLIGATORIAS = COLUMNAS_CARGA.filter((c) => !('opcional' in c));

export type ClaveCarga = (typeof COLUMNAS_CARGA)[number]['clave'];

/** Una fila del Excel, como texto (`fila` es el número de fila en Excel). */
export type FilaCarga = { fila: number } & Record<ClaveCarga, string>;

export type TipoDocumentoIdentidad = 'DNI' | 'CE' | 'PASAPORTE';

export interface PersonaCarga {
  empresaId: number;
  perfil: Perfil;
  tipoDocumentoIdentidad: TipoDocumentoIdentidad;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  /** Período de autorización (AAAA-MM-DD), o null sin período. */
  autorizadoDesde: string | null;
  autorizadoHasta: string | null;
  motivoAutorizacion: string | null;
}

export interface FilaRevisada extends FilaCarga {
  /** lista: se puede registrar; existe: el documento ya está registrado (se omite); error: hay que corregirla. */
  estado: 'lista' | 'existe' | 'error';
  motivos: string[];
  /** Columnas con error (para pintarlas en el Excel de filas con error). */
  campos: ClaveCarga[];
  /** Solo en las filas "lista": los datos tal como se registrarán. */
  persona?: PersonaCarga;
}

export interface EmpresaCarga {
  id: number;
  ruc: string;
  razonSocial: string;
  estado: 'activa' | 'inactiva';
}

export interface PersonaExistente {
  tipoDocumentoIdentidad: TipoDocumentoIdentidad;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  estado: 'activo' | 'inactivo';
}

/** Para comparar textos escritos a mano: sin tildes, sin puntos ni comas, sin espacios de más y en minúsculas. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** "Contratista", "contratista", "Subcontratista / proveedor", "proveedor"… → clave del perfil. */
const PERFIL_POR_TEXTO = new Map<string, Perfil>();
for (const perfil of PERFILES) {
  PERFIL_POR_TEXTO.set(normalizar(perfil), perfil);
  PERFIL_POR_TEXTO.set(normalizar(PERFIL_LABEL[perfil]), perfil);
  for (const parte of PERFIL_LABEL[perfil].split('/')) PERFIL_POR_TEXTO.set(normalizar(parte), perfil);
}

const TIPO_POR_TEXTO = new Map<string, TipoDocumentoIdentidad>([
  ['dni', 'DNI'],
  ['ce', 'CE'],
  ['carne de extranjeria', 'CE'],
  ['carnet de extranjeria', 'CE'],
  ['pasaporte', 'PASAPORTE'],
]);

const clavePersona = (tipo: string, numero: string) => `${tipo}|${numero}`;

/**
 * Fecha escrita en el Excel → AAAA-MM-DD, o null si no se entiende. Acepta
 * DD/MM/AAAA (o con guiones), AAAA-MM-DD y el número de serie de Excel (una
 * fecha en una celda sin formato). Vacío → null.
 */
export function fechaCarga(texto: string): string | null {
  const t = texto.trim();
  if (!t) return null;
  let a: number, m: number, d: number;
  let r = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(t);
  if (r) [d, m, a] = [Number(r[1]), Number(r[2]), Number(r[3])];
  else if ((r = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t))) [a, m, d] = [Number(r[1]), Number(r[2]), Number(r[3])];
  else if (/^\d{5}$/.test(t)) {
    // Serie de Excel: días desde el 30/12/1899.
    const f = new Date(Date.UTC(1899, 11, 30) + Number(t) * 86_400_000);
    [a, m, d] = [f.getUTCFullYear(), f.getUTCMonth() + 1, f.getUTCDate()];
  } else return null;
  const f = new Date(Date.UTC(a, m - 1, d));
  if (f.getUTCFullYear() !== a || f.getUTCMonth() !== m - 1 || f.getUTCDate() !== d) return null;
  return f.toISOString().slice(0, 10);
}

/** Texto de la celda: los números sin decimales ni separadores, las fórmulas por su resultado. */
function textoCelda(celda: ExcelJS.Cell): string {
  const valor = celda.value;
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'number') return String(Math.round(valor));
  if (typeof valor === 'string') return valor.trim();
  // Una fecha de Excel (la guarda en UTC): como la escribiría una persona, DD/MM/AAAA.
  if (valor instanceof Date) return valor.toISOString().slice(0, 10).split('-').reverse().join('/');
  if (typeof valor === 'object' && 'result' in valor) return String(valor.result ?? '').trim();
  return celda.text.trim();
}

/**
 * Lee las filas de la hoja "Personal" (o la primera). Ubica la cabecera por sus
 * títulos en las primeras 10 filas, así que las columnas pueden estar en otro
 * orden y se ignoran las que sobran (por ejemplo "Motivo", en el Excel de filas
 * con error). Las filas vacías se saltan.
 */
export async function leerFilasCarga(contenido: Buffer): Promise<FilaCarga[]> {
  const libro = new ExcelJS.Workbook();
  try {
    await libro.xlsx.load(contenido as unknown as ArrayBuffer);
  } catch {
    throw new Error('No se pudo leer el archivo. Debe ser un Excel (.xlsx); use la plantilla.');
  }
  const hoja = libro.getWorksheet('Personal') ?? libro.worksheets[0];
  if (!hoja) throw new Error('El Excel no tiene hojas.');

  const titulos = new Map<string, ClaveCarga>(COLUMNAS_CARGA.map((c) => [normalizar(c.titulo), c.clave]));
  let filaCabecera = 0;
  const posicion = new Map<ClaveCarga, number>();
  for (let f = 1; f <= Math.min(10, hoja.rowCount) && !filaCabecera; f++) {
    const encontradas = new Map<ClaveCarga, number>();
    hoja.getRow(f).eachCell((celda, col) => {
      const clave = titulos.get(normalizar(textoCelda(celda)));
      if (clave && !encontradas.has(clave)) encontradas.set(clave, col);
    });
    if (OBLIGATORIAS.every((c) => encontradas.has(c.clave))) {
      filaCabecera = f;
      for (const [clave, col] of encontradas) posicion.set(clave, col);
    }
  }
  if (!filaCabecera) {
    const faltan = OBLIGATORIAS.map((c) => `"${c.titulo}"`).join(', ');
    throw new Error(`No se encontró la fila de títulos (${faltan}). Use la plantilla de carga masiva.`);
  }

  const filas: FilaCarga[] = [];
  for (let f = filaCabecera + 1; f <= hoja.rowCount; f++) {
    const fila = hoja.getRow(f);
    // Una columna opcional que no está en el archivo (plantilla anterior) queda vacía.
    const datos = Object.fromEntries(
      COLUMNAS_CARGA.map((c) => [c.clave, posicion.has(c.clave) ? textoCelda(fila.getCell(posicion.get(c.clave)!)) : '']),
    ) as Record<
      ClaveCarga,
      string
    >;
    if (Object.values(datos).every((v) => !v)) continue;
    filas.push({ fila: f, ...datos });
    if (filas.length > MAX_FILAS_CARGA) {
      throw new Error(`El archivo tiene más de ${MAX_FILAS_CARGA} personas. Divídalo en varios archivos.`);
    }
  }
  return filas;
}

/**
 * Revisa cada fila sin guardar nada: datos obligatorios, perfil, tipo y número
 * de documento, empresa (por razón social o RUC, activa), documentos repetidos
 * en el mismo archivo y personas ya registradas.
 */
export function revisarFilasCarga(
  filas: FilaCarga[],
  empresas: EmpresaCarga[],
  existentes: PersonaExistente[],
): FilaRevisada[] {
  const empresaPorRuc = new Map(empresas.map((e) => [e.ruc, e]));
  const empresaPorNombre = new Map(empresas.map((e) => [normalizar(e.razonSocial), e]));
  const registradas = new Map(existentes.map((p) => [clavePersona(p.tipoDocumentoIdentidad, p.numeroDocumento), p]));
  const vistas = new Map<string, number>();

  return filas.map((fila) => {
    const motivos: string[] = [];
    const campos = new Set<ClaveCarga>();
    const marcar = (campo: ClaveCarga, motivo: string) => {
      motivos.push(motivo);
      campos.add(campo);
    };

    const perfil = fila.perfil ? PERFIL_POR_TEXTO.get(normalizar(fila.perfil)) : undefined;
    if (!fila.perfil) marcar('perfil', 'Falta el perfil');
    else if (!perfil) marcar('perfil', `Perfil desconocido: "${fila.perfil}"`);

    let empresa: EmpresaCarga | undefined;
    if (!fila.empresa) marcar('empresa', 'Falta la empresa');
    else {
      const texto = fila.empresa.replace(/\s+/g, '');
      empresa = /^\d{11}$/.test(texto) ? empresaPorRuc.get(texto) : empresaPorNombre.get(normalizar(fila.empresa));
      if (!empresa) marcar('empresa', `La empresa no está registrada en el sistema (regístrela en Empresas): "${fila.empresa}"`);
      else if (empresa.estado !== 'activa') marcar('empresa', `La empresa está inactiva (se activa en Empresas): ${empresa.razonSocial}`);
    }

    const tipo = fila.tipoDocumento ? TIPO_POR_TEXTO.get(normalizar(fila.tipoDocumento)) : undefined;
    if (!fila.tipoDocumento) marcar('tipoDocumento', 'Falta el tipo de documento');
    else if (!tipo) marcar('tipoDocumento', `Tipo de documento desconocido: "${fila.tipoDocumento}" (DNI, CE o PASAPORTE)`);

    // Igual que en el registro uno por uno: sin espacios y en mayúsculas.
    const numero = fila.numeroDocumento.replace(/\s+/g, '').toUpperCase();
    if (!numero) marcar('numeroDocumento', 'Falta el número de documento');
    else if (!/^[A-Z0-9]+$/.test(numero)) marcar('numeroDocumento', 'El número de documento solo puede tener letras y números');
    else if (numero.length > 20) marcar('numeroDocumento', 'El número de documento no puede tener más de 20 caracteres');
    else if (tipo === 'DNI' && !/^\d{8}$/.test(numero)) marcar('numeroDocumento', 'El DNI debe tener 8 dígitos');

    const nombres = fila.nombres.trim();
    const apellidos = fila.apellidos.trim();
    if (!nombres) marcar('nombres', 'Faltan los nombres');
    else if (nombres.length > 150) marcar('nombres', 'Los nombres no pueden tener más de 150 caracteres');
    if (!apellidos) marcar('apellidos', 'Faltan los apellidos');
    else if (apellidos.length > 150) marcar('apellidos', 'Los apellidos no pueden tener más de 150 caracteres');

    // Período de autorización (opcional): las dos fechas y el motivo, con las mismas reglas del formulario.
    const desdeTexto = fechaCarga(fila.autorizadoDesde);
    const hastaTexto = fechaCarga(fila.autorizadoHasta);
    if (fila.autorizadoDesde && !desdeTexto) marcar('autorizadoDesde', `Fecha de ingreso no válida: "${fila.autorizadoDesde}" (DD/MM/AAAA)`);
    if (fila.autorizadoHasta && !hastaTexto) marcar('autorizadoHasta', `Fecha de finalización no válida: "${fila.autorizadoHasta}" (DD/MM/AAAA)`);
    let periodo: Pick<PersonaCarga, 'autorizadoDesde' | 'autorizadoHasta' | 'motivoAutorizacion'> = {
      autorizadoDesde: null,
      autorizadoHasta: null,
      motivoAutorizacion: null,
    };
    if ((!fila.autorizadoDesde || desdeTexto) && (!fila.autorizadoHasta || hastaTexto)) {
      const revisado = normalizarPeriodo({ desde: desdeTexto, hasta: hastaTexto, motivo: fila.motivoAutorizacion });
      if (revisado === PERIODO_INCOMPLETO) {
        const faltan: ClaveCarga[] = [];
        if (!desdeTexto) faltan.push('autorizadoDesde');
        if (!hastaTexto) faltan.push('autorizadoHasta');
        if (fila.motivoAutorizacion.trim().length < 3) faltan.push('motivoAutorizacion');
        motivos.push(PERIODO_INCOMPLETO);
        faltan.forEach((c) => campos.add(c));
      } else if (revisado === PERIODO_AL_REVES) marcar('autorizadoHasta', PERIODO_AL_REVES);
      else if (typeof revisado === 'string') marcar('motivoAutorizacion', revisado);
      else if (revisado.autorizadoDesde) {
        periodo = { autorizadoDesde: desdeTexto, autorizadoHasta: hastaTexto, motivoAutorizacion: revisado.motivoAutorizacion };
      }
    }

    if (tipo && numero) {
      const clave = clavePersona(tipo, numero);
      const anterior = vistas.get(clave);
      if (anterior) marcar('numeroDocumento', `El documento se repite: ya está en la fila ${anterior}`);
      else vistas.set(clave, fila.fila);
      if (!motivos.length) {
        const registrada = registradas.get(clave);
        if (registrada) {
          const baja = registrada.estado === 'inactivo' ? ' (dado de baja)' : '';
          return {
            ...fila,
            estado: 'existe',
            motivos: [`Ya está registrado: ${registrada.apellidos}, ${registrada.nombres}${baja}`],
            campos: [],
          };
        }
      }
    }

    if (motivos.length || !perfil || !empresa || !tipo) return { ...fila, estado: 'error', motivos, campos: [...campos] };
    return {
      ...fila,
      estado: 'lista',
      motivos,
      campos: [],
      persona: { empresaId: empresa.id, perfil, tipoDocumentoIdentidad: tipo, numeroDocumento: numero, nombres, apellidos, ...periodo },
    };
  });
}

const MARCA = 'FF465FFF';

/**
 * Libro de la plantilla: hoja "Personal" (títulos, listas desplegables de
 * perfil, empresa y tipo de documento, número de documento como texto para no
 * perder los ceros de adelante), "Instrucciones" y la hoja oculta "Listas".
 * Con `filas`, las escribe debajo de los títulos con una columna "Motivo" y
 * la celda de cada error pintada de rojo claro (el Excel de filas con error,
 * para corregirlo y volver a subirlo).
 */
export async function generarPlantillaCarga(
  empresas: EmpresaCarga[],
  filas: (FilaCarga & { motivo?: string; campos?: ClaveCarga[] })[] = [],
): Promise<Buffer> {
  const libro = new ExcelJS.Workbook();
  libro.creator = 'Control de Accesos TMAM';
  const hoja = libro.addWorksheet('Personal', { views: [{ state: 'frozen', ySplit: 1 }] });
  const instrucciones = libro.addWorksheet('Instrucciones');
  const listas = libro.addWorksheet('Listas', { state: 'veryHidden' });

  const perfiles = PERFILES.map((p) => PERFIL_LABEL[p]);
  const activas = empresas
    .filter((e) => e.estado === 'activa')
    .map((e) => e.razonSocial)
    .sort((a, b) => a.localeCompare(b, 'es'));
  perfiles.forEach((p, i) => (listas.getCell(i + 1, 1).value = p));
  activas.forEach((e, i) => (listas.getCell(i + 1, 2).value = e));

  const conMotivo = filas.some((f) => f.motivo);
  const columnas = [...COLUMNAS_CARGA.map((c) => ({ titulo: c.titulo, ancho: c.ancho })), ...(conMotivo ? [{ titulo: 'Motivo', ancho: 60 }] : [])];
  hoja.columns = columnas.map((c) => ({ width: c.ancho }));
  const cabecera = hoja.addRow(columnas.map((c) => c.titulo));
  cabecera.eachCell((celda, col) => {
    celda.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: col > COLUMNAS_CARGA.length ? 'FFD92D20' : MARCA } };
    celda.alignment = { vertical: 'middle' };
  });
  cabecera.height = 22;
  hoja.getColumn(4).numFmt = '@';
  // Las fechas del período, como las escribe una persona (DD/MM/AAAA).
  for (const clave of ['autorizadoDesde', 'autorizadoHasta'] as const) {
    hoja.getColumn(COLUMNAS_CARGA.findIndex((c) => c.clave === clave) + 1).numFmt = 'dd/mm/yyyy';
  }

  for (const f of filas) {
    const fila = hoja.addRow([...COLUMNAS_CARGA.map((c) => f[c.clave]), ...(conMotivo ? [f.motivo ?? ''] : [])]);
    fila.getCell(4).numFmt = '@';
    if (conMotivo) fila.getCell(COLUMNAS_CARGA.length + 1).font = { color: { argb: 'FFD92D20' } };
    // La celda exacta con el error, en rojo claro (también si está vacía).
    for (const campo of f.campos ?? []) {
      const celda = fila.getCell(COLUMNAS_CARGA.findIndex((c) => c.clave === campo) + 1);
      celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE4E2' } };
      celda.font = { color: { argb: 'FFB42318' } };
    }
  }

  const ultima = Math.max(MAX_FILAS_CARGA + 1, filas.length + 1);
  const lista = (formula: string, titulo: string) =>
    ({
      type: 'list',
      allowBlank: true,
      formulae: [formula],
      showErrorMessage: true,
      errorStyle: 'warning',
      errorTitle: titulo,
      error: 'El valor no está en la lista. Puede dejarlo, pero el sistema lo revisará al subir el archivo.',
    }) as ExcelJS.DataValidation;
  for (let f = 2; f <= ultima; f++) {
    hoja.getCell(f, 1).dataValidation = lista(`Listas!$A$1:$A$${perfiles.length}`, 'Perfil');
    if (activas.length) hoja.getCell(f, 2).dataValidation = lista(`Listas!$B$1:$B$${activas.length}`, 'Empresa');
    hoja.getCell(f, 3).dataValidation = lista('"DNI,CE,PASAPORTE"', 'Tipo de documento');
  }

  instrucciones.columns = [{ width: 24 }, { width: 90 }];
  const titulo = instrucciones.addRow(['Carga masiva de personal']);
  titulo.font = { bold: true, size: 14, color: { argb: MARCA } };
  instrucciones.addRow([]);
  for (const texto of [
    '1. Llene la hoja Personal: una fila por persona, desde la fila 2. No cambie los títulos de la fila 1.',
    `2. Hasta ${MAX_FILAS_CARGA} personas por archivo.`,
    '3. En el portal: Personal → Carga masiva → suba este archivo. El sistema revisa todas las filas antes de guardar.',
    '4. Se registran solo las filas correctas. Las que ya están registradas se omiten y las que tienen errores se pueden descargar para corregirlas.',
    '5. Después de registrarlas, cada persona necesita su foto y sus documentos (en su ficha) para poder ingresar.',
  ]) {
    instrucciones.addRow(['', texto]).getCell(2).alignment = { wrapText: true };
  }
  instrucciones.addRow([]);
  const cab = instrucciones.addRow(['Columna', 'Qué escribir']);
  cab.font = { bold: true };
  for (const c of COLUMNAS_CARGA) {
    const ayuda = c.clave === 'perfil' ? `${c.ayuda}${perfiles.join(', ')}.` : c.ayuda;
    instrucciones.addRow([c.titulo, ayuda]).getCell(2).alignment = { wrapText: true };
  }
  instrucciones.addRow([]);
  instrucciones.addRow(['Ejemplo', 'Contratista | DEMO Servicios Portuarios Islay S.A. | DNI | 01234567 | Juan Carlos | Pérez Rojas']);
  instrucciones.addRow([
    'Con período',
    'Visita | DEMO Servicios Portuarios Islay S.A. | DNI | 07654321 | Ana | Díaz | 22/10/2026 | 31/10/2026 | Visita técnica. Fuera de esas fechas no podrá ingresar.',
  ]).getCell(2).alignment = { wrapText: true };
  instrucciones.addRow([
    'Empresas',
    'Si la empresa no aparece en la lista, regístrela primero en el portal (menú Empresas → + Nueva empresa) y vuelva a descargar la plantilla.',
  ]).getCell(2).alignment = { wrapText: true };

  return Buffer.from(await libro.xlsx.writeBuffer());
}
