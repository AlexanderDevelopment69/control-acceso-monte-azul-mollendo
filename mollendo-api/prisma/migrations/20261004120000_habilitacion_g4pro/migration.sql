-- Habilitación por DNI en el G4 Pro: cuándo se le dio permiso de paso a la
-- persona en espera (null = en cola, esperando que termine la anterior).
ALTER TABLE "ingreso_pendiente" ADD COLUMN "habilitado_en" TIMESTAMP(3);

-- Nuevo motivo de denegación: pasó su DNI pero no completó rostro y alcohol a tiempo.
ALTER TABLE "evento_acceso" ADD COLUMN "denegado_sin_verificacion" BOOLEAN NOT NULL DEFAULT false;
