import os from 'node:os';
import path from 'node:path';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    // Lo que las pruebas guardan en disco (p. ej. el último estado del controlador)
    // va a una carpeta temporal, no al storage/ de la API de desarrollo.
    env: { DOCUMENTOS_STORAGE_PATH: path.join(os.tmpdir(), 'mollendo-pruebas', 'documentos') },
  },
});
