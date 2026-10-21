-- Contingencia sin lector de DNI: ingreso identificado por rostro o salida abierta desde "Presentes ahora".
ALTER TABLE "evento_acceso" ADD COLUMN "sin_lector" BOOLEAN NOT NULL DEFAULT false;
