-- Perfil de la persona (planta, contratista, subcontratista, conductor, visita,
-- cliente). Solo la clasifica: no cambia la validación del molinete. Las
-- personas ya registradas quedan sin perfil hasta que se les asigne uno.
CREATE TYPE "perfil_persona" AS ENUM ('planta', 'contratista', 'subcontratista', 'conductor', 'visita', 'cliente');

ALTER TABLE "persona" ADD COLUMN "perfil" "perfil_persona";

CREATE INDEX "persona_perfil_idx" ON "persona"("perfil");
