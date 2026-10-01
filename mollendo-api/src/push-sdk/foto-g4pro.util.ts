import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

/**
 * El G4 Pro exige la foto en JPG de máximo 20 KB, entre 358×441 y 1080×1920
 * píxeles (ver Opciones_Integracion_G4Pro.md sección 9, punto 8 -- el manual
 * de la carpeta de equipos no trae el diagrama, esto viene de la ficha
 * técnica real). Las fotos que suben los administradores no respetan ese
 * límite, así que hay que reconvertirlas antes de mandarlas por DATA UPDATE
 * BIOPHOTO.
 */
const TAMANO_MAXIMO_BYTES = 20 * 1024;
const ANCHO_OBJETIVO = 480;
const ALTO_OBJETIVO = 600; // dentro del rango 358x441 a 1080x1920, relación similar a la mínima

/** Convierte la foto a JPG dentro del límite de tamaño del G4 Pro y la devuelve en base64. */
export async function convertirFotoParaG4Pro(rutaArchivo: string): Promise<string> {
  const original = await readFile(rutaArchivo);
  let calidad = 85;
  let jpg = await sharp(original)
    .resize(ANCHO_OBJETIVO, ALTO_OBJETIVO, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: calidad })
    .toBuffer();

  while (jpg.length > TAMANO_MAXIMO_BYTES && calidad > 20) {
    calidad -= 15;
    jpg = await sharp(original)
      .resize(ANCHO_OBJETIVO, ALTO_OBJETIVO, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: calidad })
      .toBuffer();
  }

  if (jpg.length > TAMANO_MAXIMO_BYTES) {
    throw new Error(
      `No se pudo comprimir la foto por debajo de ${TAMANO_MAXIMO_BYTES} bytes (quedó en ${jpg.length} bytes)`,
    );
  }

  return jpg.toString('base64');
}
