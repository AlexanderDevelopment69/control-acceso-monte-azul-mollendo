-- Tarjeta de acceso (22/10/2026): abre sola el molinete (visitas, autoridades). Usa la misma tabla que la
-- de contingencia, con su tipo y su propia numeración.
CREATE TYPE "tipo_tarjeta" AS ENUM ('contingencia', 'acceso');

ALTER TABLE "tarjeta_contingencia" ADD COLUMN "tipo" "tipo_tarjeta" NOT NULL DEFAULT 'contingencia';

DROP INDEX "tarjeta_contingencia_numero_key";
CREATE UNIQUE INDEX "tarjeta_contingencia_tipo_numero_key" ON "tarjeta_contingencia"("tipo", "numero");
