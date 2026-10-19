-- "Facial primero": quién sopló, según el rastreo del G4 Pro (VerifySuccess.txt, hallado el 19/10/2026).
-- El rtlog del éxito llega con pin=0; con esto se confirma que el DNI sea de quien sopló.
ALTER TABLE "evento_acceso" ADD COLUMN "dni_que_soplo" VARCHAR(24);
ALTER TABLE "evento_acceso" ADD COLUMN "denegado_no_es_quien_soplo" BOOLEAN NOT NULL DEFAULT false;
