-- Alcance base sin perfiles ni puestos (decisión del cliente, 2026-09-27):
-- el administrador registra empresa, trabajador y documentos, nada más.
-- Regla de ingreso: al menos un documento cargado, ninguno vencido y alcohol conforme.

ALTER TABLE "persona" DROP COLUMN "puesto_id",
                      DROP COLUMN "area";

DROP TABLE "requisito_por_puesto";
DROP TABLE "puesto";
DROP TYPE "caso_puesto";

-- Si un documento vence o no lo define su fecha de vencimiento (vacía = no vence).
ALTER TABLE "tipo_documento" DROP COLUMN "tipo_validacion";
DROP TYPE "tipo_validacion_documento";

-- "Sin puesto" pasa a ser "sin documentos cargados".
ALTER TABLE "evento_acceso" RENAME COLUMN "denegado_sin_puesto" TO "denegado_sin_documentos";
