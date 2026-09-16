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

const nextConfig: NextConfig = {
  /* config options here */
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
