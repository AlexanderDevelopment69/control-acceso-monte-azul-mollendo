-- Período de autorización del personal (opcional): fecha de ingreso, fecha de finalización y motivo.
ALTER TABLE "persona" ADD COLUMN "autorizado_desde" DATE;
ALTER TABLE "persona" ADD COLUMN "autorizado_hasta" DATE;
ALTER TABLE "persona" ADD COLUMN "motivo_autorizacion" VARCHAR(300);
-- Motivo de denegación nuevo: fuera del período autorizado.
ALTER TABLE "evento_acceso" ADD COLUMN "denegado_fuera_periodo" BOOLEAN NOT NULL DEFAULT false;
