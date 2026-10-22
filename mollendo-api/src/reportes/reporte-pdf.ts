import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import pdfmake from 'pdfmake';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces.js';
import { leyenda, textoFecha, textoFechaHora, textoHoras, type Celda, type Columna, type Reporte } from './reporte.types.js';

// Fuente Roboto que trae pdfmake (acentos y ñ). Solo se permite leer esa
// carpeta y ninguna URL: el PDF no carga nada más.
const carpetaFuentes = join(dirname(createRequire(import.meta.url).resolve('pdfmake/package.json')), 'fonts', 'Roboto');
pdfmake.setFonts({
  Roboto: {
    normal: join(carpetaFuentes, 'Roboto-Regular.ttf'),
    bold: join(carpetaFuentes, 'Roboto-Medium.ttf'),
    italics: join(carpetaFuentes, 'Roboto-Italic.ttf'),
    bolditalics: join(carpetaFuentes, 'Roboto-MediumItalic.ttf'),
  },
});
pdfmake.setLocalAccessPolicy((ruta: string) => ruta.startsWith(carpetaFuentes));
pdfmake.setUrlAccessPolicy(() => false);

const MARCA = '#465fff';
const GRIS = '#667085';
/** A4 horizontal: 842 pt de ancho menos los márgenes. */
const ANCHO_UTIL = 842 - 2 * 28;

function texto(valor: Celda, columna: Columna): string {
  if (valor === null || valor === '') return '—';
  if (valor instanceof Date) return columna.tipo === 'fecha' ? textoFecha(valor) : textoFechaHora(valor);
  if (columna.tipo === 'horas' && typeof valor === 'number') return textoHoras(valor);
  if (typeof valor === 'object') return valor.texto;
  return String(valor);
}

/**
 * PDF del reporte en A4 horizontal: título, filtros y fecha arriba; la tabla con
 * la cabecera repetida en cada página y filas alternadas; el resumen, las otras
 * tablas y la leyenda (qué significa cada columna) al final; y el número de
 * página en el pie.
 */
export async function generarPdf(reporte: Reporte, generado: Date): Promise<Buffer> {
  const secciones: Content[] = (reporte.secciones ?? []).flatMap((s): Content[] => [
    { text: s.titulo, fontSize: 12, bold: true, margin: [0, 16, 0, 2] },
    ...(s.nota ? [{ text: s.nota, color: GRIS, margin: [0, 0, 0, 6] as [number, number, number, number] }] : []),
    s.filas.length > 0 ? tablaPdf(s.columnas, s.filas) : { text: 'Sin registros.', italics: true, color: GRIS },
  ]);
  secciones.push(
    { text: 'Leyenda', fontSize: 12, bold: true, margin: [0, 16, 0, 2] },
    { text: 'Qué significa cada columna del reporte.', color: GRIS, margin: [0, 0, 0, 6] },
    tablaPdf(
      [
        { titulo: 'Columna', ancho: 22, descripcion: '' },
        { titulo: 'Qué significa', ancho: 100, descripcion: '' },
      ],
      leyenda(reporte),
    ),
  );
  const tabla = tablaPdf(reporte.columnas, reporte.filas);
  return generarDocumento(reporte, generado, tabla, secciones);
}

/** Tabla con la cabecera repetida en cada página y filas alternadas. */
function tablaPdf(columnas: Columna[], filas: Celda[][]): Content {
  const totalAncho = columnas.reduce((suma, c) => suma + c.ancho, 0);
  // Cada celda tiene 4 pt de relleno a cada lado.
  const anchos = columnas.map((c) => (c.ancho / totalAncho) * ANCHO_UTIL - 8);

  return {
    table: {
      headerRows: 1,
      // Una fila no se parte entre dos páginas (quedaba la mitad de la empresa en la página siguiente).
      dontBreakRows: true,
      widths: anchos,
      body: [
        columnas.map((c) => ({ text: c.titulo, bold: true, color: '#ffffff', fillColor: MARCA })),
        ...filas.map((fila) =>
          fila.map((valor, i) => ({
            text: texto(valor, columnas[i]),
            alignment: columnas[i].tipo === 'numero' || columnas[i].tipo === 'horas' ? ('right' as const) : ('left' as const),
          })),
        ),
      ],
    },
    layout: {
      hLineWidth: (i: number) => (i === 1 ? 0 : 0.5),
      vLineWidth: () => 0,
      hLineColor: () => '#e4e7ec',
      fillColor: (fila: number) => (fila > 0 && fila % 2 === 0 ? '#f9fafb' : null),
      paddingTop: () => 4,
      paddingBottom: () => 4,
    },
  };
}

async function generarDocumento(reporte: Reporte, generado: Date, tabla: Content, secciones: Content[]): Promise<Buffer> {
  const documento: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [28, 28, 28, 36],
    info: { title: reporte.titulo, creator: 'Sistema de Control de Accesos - TMAM' },
    defaultStyle: { font: 'Roboto', fontSize: 8, color: '#1d2939' },
    content: [
      { text: reporte.titulo, fontSize: 15, bold: true },
      { text: 'Sistema de Control de Accesos - Terminal Monte Azul Mollendo', color: GRIS, margin: [0, 2, 0, 0] },
      ...reporte.filtros.map((f) => ({ text: f, color: GRIS })),
      { text: `Generado el ${textoFechaHora(generado)}`, color: GRIS, margin: [0, 0, 0, 10] },
      reporte.filas.length > 0 ? tabla : { text: 'Sin registros para los filtros elegidos.', italics: true, color: GRIS },
      ...(reporte.resumen.length
        ? [{ text: reporte.resumen.join('   ·   '), bold: true, margin: [0, 10, 0, 0] as [number, number, number, number] }]
        : []),
      ...secciones,
    ],
    footer: (pagina: number, paginas: number) => ({
      columns: [
        { text: reporte.titulo, color: GRIS },
        { text: `Página ${pagina} de ${paginas}`, alignment: 'right', color: GRIS },
      ],
      margin: [28, 10, 28, 0],
      fontSize: 7,
    }),
  };

  return pdfmake.createPdf(documento).getBuffer();
}
