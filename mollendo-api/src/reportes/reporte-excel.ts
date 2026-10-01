import ExcelJS from 'exceljs';
import { textoFechaHora, type Reporte } from './reporte.types.js';

const MARCA = 'FF465FFF';
const GRIS = 'FF667085';

/**
 * Excel del reporte: título, filtros y fecha de generación arriba; la tabla
 * con cabecera fija, filtros de Excel y fechas como fechas reales (se pueden
 * ordenar y filtrar); y el resumen al final.
 */
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
  ];
  for (const texto of encabezado) {
    const fila = hoja.addRow([texto]);
    fila.font = { size: 10, color: { argb: GRIS } };
    hoja.mergeCells(fila.number, 1, fila.number, columnas);
  }
  hoja.addRow([]);

  const cabecera = hoja.addRow(reporte.columnas.map((c) => c.titulo));
  cabecera.eachCell((celda) => {
    celda.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: MARCA } };
    celda.alignment = { vertical: 'middle' };
  });
  cabecera.height = 20;

  for (const fila of reporte.filas) {
    const filaExcel = hoja.addRow(
      fila.map((valor, i) => {
        // ExcelJS guarda las fechas en UTC: se pasa la hora de Lima como si fuera UTC
        // para que Excel muestre la misma hora que el sistema.
        if (valor instanceof Date && reporte.columnas[i].tipo === 'fechaHora') {
          return new Date(Date.UTC(valor.getFullYear(), valor.getMonth(), valor.getDate(), valor.getHours(), valor.getMinutes()));
        }
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

  reporte.columnas.forEach((c, i) => {
    const columna = hoja.getColumn(i + 1);
    columna.width = c.ancho;
    if (c.tipo === 'fecha') columna.numFmt = 'dd/mm/yyyy';
    if (c.tipo === 'fechaHora') columna.numFmt = 'dd/mm/yyyy hh:mm';
    if (c.tipo === 'numero') columna.alignment = { horizontal: 'right' };
  });
  if (reporte.filas.length > 0) {
    hoja.autoFilter = {
      from: { row: cabecera.number, column: 1 },
      to: { row: cabecera.number + reporte.filas.length, column: columnas },
    };
  }
  hoja.views = [{ state: 'frozen', ySplit: cabecera.number }];

  hoja.addRow([]);
  if (reporte.filas.length === 0) hoja.addRow(['Sin registros para los filtros elegidos.']).font = { italic: true, color: { argb: GRIS } };
  for (const texto of reporte.resumen) hoja.addRow([texto]).font = { bold: true };

  return Buffer.from(await libro.xlsx.writeBuffer());
}
