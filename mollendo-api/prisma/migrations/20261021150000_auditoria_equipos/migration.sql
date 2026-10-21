-- Registro de desconexiones de equipos en la Auditoría.
ALTER TYPE "accion_auditoria" ADD VALUE IF NOT EXISTS 'desconexion';
ALTER TYPE "accion_auditoria" ADD VALUE IF NOT EXISTS 'reconexion';
