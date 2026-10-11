import type { NextConfig } from "next";

// SVGO (que corre dentro de @svgr/webpack) quita el viewBox de un SVG cuando
// su width/height coinciden exactamente con el viewBox, asumiendo que
// siempre se va a mostrar a su tamaño original. Sin viewBox, un ícono no
// puede reescalar su dibujo interno — si luego se le fuerza un tamaño
// distinto (ej. 20x20 en vez de 24x24), el contenido queda recortado por
// los bordes en vez de encogerse. Se desactiva ese plugin para poder
// redimensionar los íconos del sistema sin que se corten.
const svgrSvgoConfig = {
  svgo: true,
  svgoConfig: {
    plugins: [
      {
        name: "preset-default",
        params: { overrides: { removeViewBox: false } },
      },
    ],
  },
};

// Dónde está el backend visto desde el servidor del portal: localhost en
// desarrollo; en los contenedores, el servicio "api" (se fija al compilar la
// imagen, ver mollendo-portal/Dockerfile).
const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  // Servidor autónomo (.next/standalone) para la imagen de Docker.
  output: "standalone",
  // Reenvía las llamadas a la API hacia el backend local. Sirve para poder
  // exponer solo el frontend por un túnel (ej. ngrok en el plan gratis, que
  // solo da un dominio) y que el navegador del cliente llame a la API por
  // ese mismo dominio en vez de necesitar un segundo túnel para el backend.
  // No afecta el desarrollo normal (ahí NEXT_PUBLIC_API_URL ya apunta
  // directo a localhost:3001 y esta regla queda sin uso).
  // Swagger (/api/docs y sus archivos /api/docs/*) se reenvía igual, para
  // que el enlace de "Sistema y APIs" funcione con NEXT_PUBLIC_API_URL=/api/v1.
  // El login pasó de /signin (nombre de la plantilla) a /iniciar-sesion: la
  // dirección vieja sigue funcionando para quien la tenga guardada.
  async redirects() {
    return [{ source: "/signin", destination: "/iniciar-sesion", permanent: true }];
  },

  async rewrites() {
    return [
      { source: "/api/v1/:path*", destination: `${API_INTERNAL_URL}/api/v1/:path*` },
      { source: "/api/docs", destination: `${API_INTERNAL_URL}/api/docs` },
      { source: "/api/docs/:path*", destination: `${API_INTERNAL_URL}/api/docs/:path*` },
    ];
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [{ loader: "@svgr/webpack", options: svgrSvgoConfig }],
    });
    return config;
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: [{ loader: "@svgr/webpack", options: svgrSvgoConfig }],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
