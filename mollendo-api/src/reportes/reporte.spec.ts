import ExcelJS from 'exceljs';
import { generarExcel } from './reporte-excel.js';
import { generarPdf } from './reporte-pdf.js';
import { leyenda, textoDia, textoDuracion, textoFecha, textoFechaHora, textoHoras, type Reporte } from './reporte.types.js';
import { nombreSeguro, rutaUnica, textoGradoManual } from './reportes.service.js';

const reporte: Reporte = {
  titulo: 'Prueba de reporte',
  archivo: 'reporte-prueba',
  filtros: ['Periodo: 01/09/2026 al 30/09/2026'],
  columnas: [
    { titulo: 'Persona', ancho: 30, descripcion: 'Apellidos y nombres.' },
    { titulo: 'Ingreso', tipo: 'fechaHora', ancho: 16, descripcion: 'Fecha y hora del ingreso.' },
    { titulo: 'Vence', tipo: 'fecha', ancho: 12, descripcion: 'Fecha de vencimiento.' },
    { titulo: 'Cantidad', tipo: 'numero', ancho: 10, descripcion: 'Cuántos.' },
    { titulo: 'Horas', tipo: 'horas', ancho: 14, descripcion: 'Tiempo dentro.' },
  ],
  filas: [
    ['Ñique Céspedes, José', new Date(2026, 8, 30, 14, 5), new Date(Date.UTC(2026, 9, 1)), 3, 61 * 3_600_000 + 60_000],
    ['Sin datos', null, null, null, null],
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

  it('horas exactas al minuto, sin pasar a días', () => {
    expect(textoHoras(61 * 3_600_000 + 60_000)).toBe('61:01');
    expect(textoHoras(52.8 * 3_600_000)).toBe('52:48');
    expect(textoHoras(0)).toBe('0:00');
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
    const cabecera = 7; // título, sistema, 1 filtro, generado, aviso de la leyenda, vacía
    expect(hoja.getRow(cabecera).values).toEqual([undefined, 'Persona', 'Ingreso', 'Vence', 'Cantidad', 'Horas']);
    expect(hoja.autoFilter).toBe(`A${cabecera}:E${cabecera + 2}`);
    // La hora de Lima se guarda tal cual, para que Excel muestre la misma.
    expect((hoja.getRow(cabecera + 1).getCell(2).value as Date).toISOString()).toBe('2026-09-30T14:05:00.000Z');
    expect(hoja.getRow(cabecera + 1).getCell(1).value).toBe('Ñique Céspedes, José');
    // Horas: duración de Excel (en días) que se muestra como "61:01" y se puede sumar.
    const horas = hoja.getRow(cabecera + 1).getCell(5);
    // Al leerla, ExcelJS la devuelve como fecha desde el 30/12/1899 (el día 0 de Excel).
    const dias = ((horas.value as Date).getTime() - Date.UTC(1899, 11, 30)) / 86_400_000;
    expect(dias).toBeCloseTo((61 * 60 + 1) / 1440, 8);
    expect(horas.numFmt).toBe('[h]:mm');
    expect(hoja.getRow(hoja.rowCount).getCell(1).value).toBe('Total: 2');
  });

  it('última hoja "Leyenda": cada columna con lo que significa', async () => {
    const libro = new ExcelJS.Workbook();
    await libro.xlsx.load((await generarExcel(reporte, new Date(2026, 8, 30, 18, 0))) as unknown as ArrayBuffer);
    expect(libro.worksheets.map((h) => h.name)).toEqual(['Prueba de reporte', 'Leyenda']);
    const hoja = libro.worksheets[1];
    expect(hoja.getRow(4).values).toEqual([undefined, 'Columna', 'Qué significa']);
    expect(hoja.getRow(5).values).toEqual([undefined, 'Persona', 'Apellidos y nombres.']);
    expect(hoja.getRow(9).values).toEqual([undefined, 'Horas', 'Tiempo dentro.']);
  });
});

describe('reporte con varias tablas (horas-hombre)', () => {
  const conSecciones: Reporte = {
    ...reporte,
    secciones: [
      { titulo: 'Detalle por persona', nota: 'Una línea que explica la tabla.', columnas: reporte.columnas, filas: reporte.filas },
      {
        titulo: 'Tercera hoja',
        columnas: [
          { titulo: 'Persona', ancho: 30, descripcion: 'Otra descripción (no se repite).' },
          { titulo: 'Solo aquí', ancho: 10, descripcion: 'Columna de la tercera hoja.' },
        ],
        filas: [],
      },
    ],
  };

  it('la leyenda junta las columnas de todas las tablas, sin repetir', () => {
    expect(leyenda(conSecciones).map(([titulo]) => titulo)).toEqual(['Persona', 'Ingreso', 'Vence', 'Cantidad', 'Horas', 'Solo aquí']);
    expect(leyenda(conSecciones)[0][1]).toBe('Apellidos y nombres.');
  });

  it('Excel: cada tabla en su hoja, con su título y la nota', async () => {
    const libro = new ExcelJS.Workbook();
    await libro.xlsx.load((await generarExcel(conSecciones, new Date(2026, 8, 30, 18, 0))) as unknown as ArrayBuffer);
    expect(libro.worksheets.map((h) => h.name)).toEqual(['Prueba de reporte', 'Detalle por persona', 'Tercera hoja', 'Leyenda']);
    const detalle = libro.worksheets[1];
    expect(detalle.getRow(1).getCell(1).value).toBe('Detalle por persona');
    expect(detalle.getRow(3).getCell(1).value).toBe('Una línea que explica la tabla.');
    expect(detalle.getRow(5).values).toEqual([undefined, 'Persona', 'Ingreso', 'Vence', 'Cantidad', 'Horas']);
    expect(detalle.getRow(6).getCell(1).value).toBe('Ñique Céspedes, José');
    const vacia = libro.worksheets[2];
    expect(vacia.getRow(vacia.rowCount).getCell(1).value).toBe('Sin registros.');
  });

  it('PDF: las tablas una debajo de otra', async () => {
    const pdf = await generarPdf(conSecciones, new Date(2026, 8, 30, 18, 0));
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
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
  it('deja solo letras sin tilde, números, "_", "-" y "."', () => {
    expect(nombreSeguro('DEMO S.A.C.')).toBe('DEMO_S.A.C');
    expect(nombreSeguro('Ruta: a/b\\c*?"<>|')).toBe('Ruta_a_b_c');
    expect(nombreSeguro('  Pérez, José\t(123)  ')).toBe('Perez_Jose_123');
    expect(nombreSeguro('Muñoz Ñique')).toBe('Munoz_Nique');
    expect(nombreSeguro('Inducción SSMA v2')).toBe('Induccion_SSMA_v2');
    expect(nombreSeguro('...')).toBe('sin_nombre');
  });

  it('no repite rutas: agrega _2, _3… sin distinguir mayúsculas', () => {
    const usados = new Set<string>();
    expect(rutaUnica('archivos/a/SCTR_v1.pdf', usados)).toBe('archivos/a/SCTR_v1.pdf');
    expect(rutaUnica('archivos/a/sctr_v1.pdf', usados)).toBe('archivos/a/sctr_v1_2.pdf');
    expect(rutaUnica('archivos/a/SCTR_v1.pdf', usados)).toBe('archivos/a/SCTR_v1_3.pdf');
  });
});

describe('Excel: verificación manual con el grado', () => {
  it('con número, sin número, y las de antes (sin nada)', () => {
    expect(textoGradoManual({ gradoManual: 0, manualSinNumero: false, resultado: 'autorizado' })).toBe(': 0,000 mg/L');
    expect(textoGradoManual({ gradoManual: 0.125, manualSinNumero: false, resultado: 'denegado' })).toBe(': 0,125 mg/L');
    expect(textoGradoManual({ gradoManual: null, manualSinNumero: true, resultado: 'autorizado' })).toBe(': marcó apto, sin número');
    expect(textoGradoManual({ gradoManual: null, manualSinNumero: true, resultado: 'denegado' })).toBe(': marcó alcohol, sin número');
    expect(textoGradoManual({ gradoManual: null, manualSinNumero: false, resultado: 'autorizado' })).toBe('');
  });
});
