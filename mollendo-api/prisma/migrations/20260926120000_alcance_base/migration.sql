-- Alcance base (Especificacion_Desarrollo_Control_Acceso_Mollendo_base.md):
-- administrador único + vigilancia, sin autoservicio de empresas, sin
-- aprobación de documentos, sin antipassback, sin SMTP.

-- 1. Cuentas de empresa: se eliminan (la auditoría conserva el registro, sin usuario).
UPDATE "auditoria" SET "usuario_id" = NULL
  WHERE "usuario_id" IN (SELECT "id" FROM "usuario" WHERE "rol" = 'empresa');
DELETE FROM "usuario" WHERE "rol" = 'empresa';

-- 2. rol_usuario: administracion -> administrador, sin 'empresa'
ALTER TYPE "rol_usuario" RENAME TO "rol_usuario_old";
CREATE TYPE "rol_usuario" AS ENUM ('administrador', 'vigilancia');
ALTER TABLE "usuario" ALTER COLUMN "rol" TYPE "rol_usuario"
  USING (CASE "rol"::text WHEN 'administracion' THEN 'administrador' ELSE "rol"::text END)::"rol_usuario";
DROP TYPE "rol_usuario_old";

-- 3. estado_cuenta: sin 'invitado' (no hay invitación por correo)
DELETE FROM "usuario" WHERE "estado_cuenta" = 'invitado' OR "password_hash" IS NULL;
ALTER TABLE "usuario" ALTER COLUMN "estado_cuenta" DROP DEFAULT;
ALTER TYPE "estado_cuenta" RENAME TO "estado_cuenta_old";
CREATE TYPE "estado_cuenta" AS ENUM ('activo', 'baja');
ALTER TABLE "usuario" ALTER COLUMN "estado_cuenta" TYPE "estado_cuenta"
  USING ("estado_cuenta"::text)::"estado_cuenta";
ALTER TABLE "usuario" ALTER COLUMN "estado_cuenta" SET DEFAULT 'activo';
DROP TYPE "estado_cuenta_old";

ALTER TABLE "usuario" DROP COLUMN "token_invitacion",
                      DROP COLUMN "token_expira",
                      ALTER COLUMN "password_hash" SET NOT NULL;

-- 4. Documentos: sin aprobación; la vigencia se calcula por fecha
DROP INDEX IF EXISTS "documento_persona_persona_id_tipo_documento_id_vigente_idx";
ALTER TABLE "documento_persona" DROP COLUMN "estado_aprobacion",
                                DROP COLUMN "vigente";
DROP TYPE "estado_aprobacion_documento";
CREATE INDEX "documento_persona_persona_id_tipo_documento_id_version_idx"
  ON "documento_persona"("persona_id", "tipo_documento_id", "version");

-- 5. accion_auditoria: sin 'aprobar'
ALTER TYPE "accion_auditoria" RENAME TO "accion_auditoria_old";
CREATE TYPE "accion_auditoria" AS ENUM ('crear', 'modificar', 'eliminar');
ALTER TABLE "auditoria" ALTER COLUMN "accion" TYPE "accion_auditoria"
  USING (CASE "accion"::text WHEN 'aprobar' THEN 'modificar' ELSE "accion"::text END)::"accion_auditoria";
DROP TYPE "accion_auditoria_old";

-- 6. Eventos: sin antipassback; nuevo motivo "sin puesto asignado"
ALTER TABLE "evento_acceso" DROP COLUMN "denegado_sin_ingreso_previo",
                            ADD COLUMN "denegado_sin_puesto" BOOLEAN NOT NULL DEFAULT false;

-- 7. Sin configuración SMTP
DROP TABLE "configuracion_smtp";
