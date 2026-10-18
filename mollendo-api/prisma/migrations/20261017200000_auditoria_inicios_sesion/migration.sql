-- Inicios de sesión en la auditoría (correctos y rechazados), con la IP y el detalle del intento.
ALTER TYPE "accion_auditoria" ADD VALUE 'inicio_sesion';
ALTER TYPE "accion_auditoria" ADD VALUE 'inicio_sesion_fallido';
ALTER TABLE "auditoria" ADD COLUMN "ip" VARCHAR(45);
ALTER TABLE "auditoria" ADD COLUMN "detalle" VARCHAR(200);
