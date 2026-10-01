import ExcelJS from 'exceljs';
import { generarExcel } from './reporte-excel.js';
import { generarPdf } from './reporte-pdf.js';
import { textoDia, textoDuracion, textoFecha, textoFechaHora, type Reporte } from './reporte.types.js';
import { nombreSeguro, rutaUnica } from './reportes.service.js';

const reporte: Reporte = {
  titulo: 'Prueba de reporte',
  archivo: 'reporte-prueba',
  filtros: ['Periodo: 01/09/2026 al 30/09/2026'],
  columnas: [
    { titulo: 'Persona', ancho: 30 },
    { titulo: 'Ingreso', tipo: 'fechaHora', ancho: 16 },
    { titulo: 'Vence', tipo: 'fecha', ancho: 12 },
    { titulo: 'Cantidad', tipo: 'numero', ancho: 10 },
  ],
  filas: [
    ['Ñique Céspedes, José', new Date(2026, 8, 30, 14, 5), new Date(Date.UTC(2026, 9, 1)), 3],
    ['Sin datos', null, null, null],
  ],
  resumen: ['Total: 2'],
};

describe('formato de fechas y duraciones', () => {
  it('muestra el instante en hora local y la fecha DATE sin correrse un día', () => {
    expect(textoFechaHora(new Date(2026, 8, 30, 14, 5))).toBe('30/09/2026 14:05');
    expect(textoFecha(new Date(Date.UTC(2026, 9, 1)))).toBe('01/10/2026');
    expect(textoDia('2026-09-30')).toBe('30/09/2026');
  });

  it('duración en horas y minutos, y en días desde las 48 horas', () => {
    expect(textoDuracion(125 * 60_000)).toBe('2 h 05 min');
    expect(textoDuracion((3 * 24 + 4) * 3_600_000)).toBe('3 días 4 h');
    expect(textoDuracion(-5)).toBe('0 h 00 min');
  });
});

describe('generarExcel', () => {
  it('arma la hoja con encabezado, cabecera con filtro, fechas reales y resumen', async () => {
    const libro = new ExcelJS.Workbook();
    const contenido = await generarExcel(reporte, new Date(2026, 8, 30, 18, 0));
    // Los tipos de ExcelJS esperan un Buffer de ArrayBuffer; en tiempo de ejecución es el mismo.
    await libro.xlsx.load(contenido as unknown as ArrayBuffer);
    const hoja = libro.worksheets[0];
    expect(hoja.getRow(1).getCell(1).value).toBe('Prueba de reporte');
    const cabecera = 6; // título, sistema, 1 filtro, generado, vacía
    expect(hoja.getRow(cabecera).values).toEqual([undefined, 'Persona', 'Ingreso', 'Vence', 'Cantidad']);
    expect(hoja.autoFilter).toBe(`A${cabecera}:D${cabecera + 2}`);
    // La hora de Lima se guarda tal cual, para que Excel muestre la misma.
    expect((hoja.getRow(cabecera + 1).getCell(2).value as Date).toISOString()).toBe('2026-09-30T14:05:00.000Z');
    expect(hoja.getRow(cabecera + 1).getCell(1).value).toBe('Ñique Céspedes, José');
    expect(hoja.getRow(hoja.rowCount).getCell(1).value).toBe('Total: 2');
  });
});

describe('generarPdf', () => {
  it('genera un PDF válido', async () => {
    const pdf = await generarPdf(reporte, new Date(2026, 8, 30, 18, 0));
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pdf.length).toBeGreaterThan(1000);
  });
});

describe('nombres dentro del ZIP de documentos', () => {
  it('quita los caracteres que no admite un nombre de archivo', () => {
    expect(nombreSeguro('DEMO S.A.C.')).toBe('DEMO S.A.C');
    expect(nombreSeguro('Ruta: a/b\\c*?"<>|')).toBe('Ruta- a-b-c------');
    expect(nombreSeguro('  Pérez, José\t(123)  ')).toBe('Pérez, José (123)');
    expect(nombreSeguro('...')).toBe('sin-nombre');
  });

  it('no repite rutas: agrega (2), (3)… sin distinguir mayúsculas', () => {
    const usados = new Set<string>();
    expect(rutaUnica('archivos/a/SCTR v1.pdf', usados)).toBe('archivos/a/SCTR v1.pdf');
    expect(rutaUnica('archivos/a/sctr v1.pdf', usados)).toBe('archivos/a/sctr v1 (2).pdf');
    expect(rutaUnica('archivos/a/SCTR v1.pdf', usados)).toBe('archivos/a/SCTR v1 (3).pdf');
  });
});
