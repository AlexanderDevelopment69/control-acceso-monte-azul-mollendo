-- Más acciones en la Auditoría: apertura del molinete sin DNI, sincronización, descarga de reportes y consulta de archivos.
ALTER TYPE "accion_auditoria" ADD VALUE IF NOT EXISTS 'apertura';
ALTER TYPE "accion_auditoria" ADD VALUE IF NOT EXISTS 'ejecucion';
ALTER TYPE "accion_auditoria" ADD VALUE IF NOT EXISTS 'descarga';
ALTER TYPE "accion_auditoria" ADD VALUE IF NOT EXISTS 'consulta';
