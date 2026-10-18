-- "Facial primero" con permiso fijo en el G4 Pro (pedido de TMAM, 17/10/2026): la espera ya no
-- se guarda por persona (el equipo no dice quién aprobó); los ingresos quedan marcados.
ALTER TABLE "ingreso_pendiente" DROP COLUMN "facial_primero";
ALTER TABLE "ingreso_pendiente" DROP COLUMN "alcohol_aprobado_en";
ALTER TABLE "evento_acceso" ADD COLUMN "facial_primero" BOOLEAN NOT NULL DEFAULT false;
