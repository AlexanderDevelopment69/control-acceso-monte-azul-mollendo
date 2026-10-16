import ExcelJS from 'exceljs';
import { leyenda, textoFechaHora, textoHoras, type Celda, type Columna, type Reporte } from './reporte.types.js';

const MARCA = 'FF465FFF';
const GRIS = 'FF667085';

/**
 * Excel del reporte: título, filtros y fecha de generación arriba; la tabla
 * con cabecera fija, filtros de Excel y fechas como fechas reales (se pueden
 * ordenar y filtrar); y el resumen al final. La última hoja, "Leyenda", explica
 * cada columna.
 */
// Espacio extra en la cabecera para la flecha del filtro de Excel, que tapa el final del título.
const ESPACIO_FILTRO = 4;
const ANCHO_MAXIMO = 60;

/** Lo que ocupa un valor en la celda, en caracteres (las fechas, con su formato). */
function largo(valor: Celda, tipo?: string): number {
  if (valor === null || valor === undefined) return 0;
  if (valor instanceof Date) return tipo === 'fecha' ? 10 : 16;
  if (tipo === 'horas' && typeof valor === 'number') return textoHoras(valor).length;
  if (typeof valor === 'object') return valor.texto.length;
  return String(valor).length;
}

/**
 * Ancho de la columna según su contenido: el más largo entre el título (con la
 * flecha del filtro) y sus valores, sin bajar del ancho sugerido ni pasar de 60.
 */
function anchoColumna(columnas: Columna[], filas: Celda[][], i: number): number {
  const c = columnas[i];
  let maximo = c.titulo.length + ESPACIO_FILTRO;
  for (const fila of filas) maximo = Math.max(maximo, largo(fila[i], c.tipo) + 2);
  return Math.min(ANCHO_MAXIMO, Math.max(c.ancho, maximo));
}

/** Cabecera, filas (fechas reales, enlaces), anchos, filtros de Excel y cabecera fija. */
function escribirTabla(hoja: ExcelJS.Worksheet, columnas: Columna[], filas: Celda[][]) {
  const cabecera = hoja.addRow(columnas.map((c) => c.titulo));
  cabecera.eachCell((celda) => {
    celda.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: MARCA } };
    celda.alignment = { vertical: 'middle' };
  });
  cabecera.height = 20;

  for (const fila of filas) {
    const filaExcel = hoja.addRow(
      fila.map((valor, i) => {
        // ExcelJS guarda las fechas en UTC: se pasa la hora de Lima como si fuera UTC
        // para que Excel muestre la misma hora que el sistema.
        if (valor instanceof Date && columnas[i].tipo === 'fechaHora') {
          return new Date(Date.UTC(valor.getFullYear(), valor.getMonth(), valor.getDate(), valor.getHours(), valor.getMinutes()));
        }
        // Horas: duración de Excel (en días), redondeada al minuto como en el PDF.
        if (typeof valor === 'number' && columnas[i].tipo === 'horas') return Math.round(valor / 60_000) / 1440;
        // Enlace relativo: Excel lo abre desde la carpeta donde está el archivo.
        if (valor !== null && typeof valor === 'object' && !(valor instanceof Date)) {
          return { text: valor.texto, hyperlink: valor.enlace };
        }
        return valor;
      }),
    );
    filaExcel.eachCell((celda) => {
      if (celda.hyperlink) celda.font = { color: { argb: MARCA }, underline: true };
    });
  }

  columnas.forEach((c, i) => {
    const columna = hoja.getColumn(i + 1);
    columna.width = anchoColumna(columnas, filas, i);
    if (c.tipo === 'fecha') columna.numFmt = 'dd/mm/yyyy';
    if (c.tipo === 'fechaHora') columna.numFmt = 'dd/mm/yyyy hh:mm';
    if (c.tipo === 'horas') columna.numFmt = '[h]:mm';
    // Todo a la izquierda, también los números, como el resto de las columnas.
    columna.alignment = { horizontal: 'left' };
    cabecera.getCell(i + 1).alignment = { vertical: 'middle', horizontal: 'left' };
  });
  if (filas.length > 0) {
    hoja.autoFilter = {
      from: { row: cabecera.number, column: 1 },
      to: { row: cabecera.number + filas.length, column: columnas.length },
    };
  }
  hoja.views = [{ state: 'frozen', ySplit: cabecera.number }];
}

export async function generarExcel(reporte: Reporte, generado: Date): Promise<Buffer> {
  const libro = new ExcelJS.Workbook();
  libro.creator = 'Sistema de Control de Accesos - TMAM';
  libro.created = generado;
  const hoja = libro.addWorksheet(reporte.titulo.slice(0, 31), {
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 },
  });
  const columnas = reporte.columnas.length;

  const titulo = hoja.addRow([reporte.titulo]);
  titulo.font = { bold: true, size: 14, color: { argb: 'FF1D2939' } };
  hoja.mergeCells(titulo.number, 1, titulo.number, columnas);
  const encabezado = [
    'Sistema de Control de Accesos - Terminal Monte Azul Mollendo',
    ...reporte.filtros,
    `Generado el ${textoFechaHora(generado)}`,
    'Qué significa cada columna: hoja "Leyenda".',
  ];
  for (const texto of encabezado) {
    const fila = hoja.addRow([texto]);
    fila.font = { size: 10, color: { argb: GRIS } };
    hoja.mergeCells(fila.number, 1, fila.number, columnas);
  }
  hoja.addRow([]);

  escribirTabla(hoja, reporte.columnas, reporte.filas);

  hoja.addRow([]);
  if (reporte.filas.length === 0) hoja.addRow(['Sin registros para los filtros elegidos.']).font = { italic: true, color: { argb: GRIS } };
  for (const texto of reporte.resumen) hoja.addRow([texto]).font = { bold: true };

  // Tablas adicionales: cada una en su hoja, con su título.
  for (const seccion of reporte.secciones ?? []) {
    const otra = libro.addWorksheet(seccion.titulo.slice(0, 31), {
      pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 },
    });
    const ancho = seccion.columnas.length;
    const t = otra.addRow([seccion.titulo]);
    t.font = { bold: true, size: 14, color: { argb: 'FF1D2939' } };
    otra.mergeCells(t.number, 1, t.number, ancho);
    for (const linea of [...reporte.filtros, ...(seccion.nota ? [seccion.nota] : [])]) {
      const fila = otra.addRow([linea]);
      fila.font = { size: 10, color: { argb: GRIS } };
      otra.mergeCells(fila.number, 1, fila.number, ancho);
    }
    otra.addRow([]);
    escribirTabla(otra, seccion.columnas, seccion.filas);
    if (seccion.filas.length === 0) {
      otra.addRow([]);
      otra.addRow(['Sin registros.']).font = { italic: true, color: { argb: GRIS } };
    }
  }

  escribirLeyenda(libro, reporte);
  return Buffer.from(await libro.xlsx.writeBuffer());
}

/** Hoja "Leyenda": cada columna del reporte con lo que significa. */
function escribirLeyenda(libro: ExcelJS.Workbook, reporte: Reporte) {
  const hoja = libro.addWorksheet('Leyenda', {
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 },
  });
  const t = hoja.addRow(['Leyenda']);
  t.font = { bold: true, size: 14, color: { argb: 'FF1D2939' } };
  hoja.mergeCells(t.number, 1, t.number, 2);
  const nota = hoja.addRow([`Qué significa cada columna del reporte "${reporte.titulo}".`]);
  nota.font = { size: 10, color: { argb: GRIS } };
  hoja.mergeCells(nota.number, 1, nota.number, 2);
  hoja.addRow([]);
  escribirTabla(
    hoja,
    [
      { titulo: 'Columna', ancho: 22, descripcion: '' },
      { titulo: 'Qué significa', ancho: 100, descripcion: '' },
    ],
    leyenda(reporte),
  );
  // La explicación, en un ancho fijo y en varias líneas si no entra.
  hoja.getColumn(2).width = 100;
  hoja.getColumn(2).alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
  hoja.getColumn(1).alignment = { horizontal: 'left', vertical: 'top' };
}
