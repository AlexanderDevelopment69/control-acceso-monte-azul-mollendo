-- Motivo y fecha de la reactivación del personal (obligatorio desde el 22/10/2026), para su ficha.
ALTER TABLE "persona" ADD COLUMN "motivo_reactivacion" VARCHAR(300);
ALTER TABLE "persona" ADD COLUMN "fecha_reactivacion" TIMESTAMP(3);
