import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';
export declare function opcionesArchivo(tiposPermitidos: string[], tamanoMaximo: number, mensajeTipo: string): MulterOptions;
export declare function guardarArchivo(personaId: number, archivo: Express.Multer.File, prefijo?: string): string;
export declare function borrarArchivo(ruta: string | null | undefined): void;
