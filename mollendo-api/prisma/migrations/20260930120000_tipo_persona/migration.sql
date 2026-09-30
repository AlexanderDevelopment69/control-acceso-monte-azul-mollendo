-- Tipo de persona: distingue a las visitas del resto del personal.
CREATE TYPE "tipo_persona" AS ENUM ('personal', 'visita');

ALTER TABLE "persona" ADD COLUMN "tipo_persona" "tipo_persona" NOT NULL DEFAULT 'personal';

CREATE INDEX "persona_tipo_persona_idx" ON "persona"("tipo_persona");
