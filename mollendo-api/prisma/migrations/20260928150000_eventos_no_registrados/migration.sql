-- Los intentos con un documento no registrado también se guardan en el
-- historial (antes solo se mostraban en vivo): sin persona, con el documento leído.
ALTER TABLE "evento_acceso" ALTER COLUMN "persona_id" DROP NOT NULL;
ALTER TABLE "evento_acceso" ADD COLUMN "tipo_documento_identidad" "tipo_documento_identidad";
ALTER TABLE "evento_acceso" ADD COLUMN "numero_documento" VARCHAR(20);
ALTER TABLE "evento_acceso" ADD COLUMN "denegado_no_registrado" BOOLEAN NOT NULL DEFAULT false;

-- Eventos anteriores: el documento de la persona.
UPDATE "evento_acceso" e
SET "tipo_documento_identidad" = p."tipo_documento_identidad", "numero_documento" = p."numero_documento"
FROM "persona" p
WHERE p."id" = e."persona_id";
