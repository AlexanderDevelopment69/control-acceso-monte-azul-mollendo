-- Verificación manual: grado del alcoholímetro de repuesto (mg/L) o "sin número", y la causa de la activación.
ALTER TABLE "evento_acceso" ADD COLUMN "grado_manual" DOUBLE PRECISION;
ALTER TABLE "evento_acceso" ADD COLUMN "manual_sin_numero" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "periodo_verificacion_manual" ADD COLUMN "causa" VARCHAR(20);
