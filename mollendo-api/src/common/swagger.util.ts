/** ¿Se publica la documentación de la API (/api/docs)? En desarrollo sí; en producción solo con SWAGGER=true. */
export function swaggerActivo(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.SWAGGER === 'true';
}
