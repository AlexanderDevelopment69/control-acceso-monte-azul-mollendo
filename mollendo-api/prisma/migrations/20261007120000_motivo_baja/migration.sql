-- Motivo y fecha de la baja de una persona (obligatorio al darla de baja; se
-- borran al reactivarla). Las bajas anteriores quedan sin motivo.
ALTER TABLE "persona" ADD COLUMN "motivo_baja" VARCHAR(300);
ALTER TABLE "persona" ADD COLUMN "fecha_baja" TIMESTAMP(3);
