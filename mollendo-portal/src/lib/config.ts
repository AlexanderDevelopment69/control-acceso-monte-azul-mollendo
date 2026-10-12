/** Dirección de la API (variable NEXT_PUBLIC_API_URL; en desarrollo, la API local). */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

/** La misma dirección sin "/api/v1": base del canal en vivo y de la documentación. */
export const API_BASE = API_URL.replace(/\/api\/v1\/?$/, "");
