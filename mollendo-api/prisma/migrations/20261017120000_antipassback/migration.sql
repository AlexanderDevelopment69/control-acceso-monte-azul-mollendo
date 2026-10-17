-- Antipassback estricto: motivos de denegación y correcciones manuales del vigilante.
ALTER TABLE "evento_acceso" ADD COLUMN "denegado_ya_dentro" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "evento_acceso" ADD COLUMN "denegado_sin_ingreso" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "evento_acceso" ADD COLUMN "correccion_manual" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "evento_acceso" ADD COLUMN "motivo_correccion" VARCHAR(300);
