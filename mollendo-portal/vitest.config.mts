import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pruebas automáticas del portal (npm test). Corren en un navegador simulado
// (jsdom), sin la API: cada prueba simula las respuestas que necesita.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [
    {
      // En el portal los íconos .svg son componentes (@svgr/webpack, ver next.config.ts);
      // en las pruebas basta un <svg> vacío con las mismas props.
      name: "iconos-svg",
      enforce: "pre",
      load(id) {
        if (id.endsWith(".svg")) {
          return 'import { createElement } from "react"; export default (props) => createElement("svg", props);';
        }
      },
    },
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
