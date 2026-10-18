-- "Facial primero" vuelve a la versión con E23 (decisión del usuario, 17/10/2026): la espera
-- es por persona (el G4 Pro dice quién es al rechazarla sin permiso).
ALTER TABLE "ingreso_pendiente" ADD COLUMN "facial_primero" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ingreso_pendiente" ADD COLUMN "alcohol_aprobado_en" TIMESTAMP(3);
