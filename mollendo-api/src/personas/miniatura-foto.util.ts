import sharp from 'sharp';

/** Lado de la miniatura en píxeles: alcanza para los recuadros de las listas (hasta 80 px en pantallas de doble densidad). */
const LADO = 160;
/** Miniaturas que se guardan en memoria (unos 5 a 10 KB cada una). */
const MAXIMO_EN_MEMORIA = 500;

/**
 * Miniaturas ya hechas, por ruta de la foto. Una foto nueva se guarda con otro
 * nombre de archivo, así que nunca se sirve una miniatura vieja.
 */
const miniaturas = new Map<string, Buffer>();

/**
 * Foto reducida para las listas del portal (Panel de vigilancia, Monitor del
 * G4 Pro): las fotos se guardan como se subieron (hasta 5 MB) y no conviene
 * descargarlas enteras para un recuadro de 40 px.
 */
export async function miniaturaFoto(ruta: string): Promise<Buffer> {
  const guardada = miniaturas.get(ruta);
  if (guardada) {
    // La más usada pasa al final: se descartan primero las que hace más tiempo no se piden.
    miniaturas.delete(ruta);
    miniaturas.set(ruta, guardada);
    return guardada;
  }
  const jpg = await sharp(ruta)
    .rotate() // respeta la orientación de las fotos tomadas con el celular
    // Al centro, como se ve la foto completa en el portal ("attention" elegía el chaleco, no la cara).
    .resize(LADO, LADO, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 80 })
    .toBuffer();
  miniaturas.set(ruta, jpg);
  if (miniaturas.size > MAXIMO_EN_MEMORIA) miniaturas.delete(miniaturas.keys().next().value!);
  return jpg;
}
