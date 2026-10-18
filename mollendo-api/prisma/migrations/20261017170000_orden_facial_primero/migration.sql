-- Orden de ingreso "facial primero" (en prueba): rostro y alcohol en el G4 Pro y, al final, el DNI.
ALTER TABLE "evento_acceso" ADD COLUMN "denegado_sin_facial" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "evento_acceso" ADD COLUMN "denegado_sin_dni" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ingreso_pendiente" ADD COLUMN "facial_primero" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ingreso_pendiente" ADD COLUMN "alcohol_aprobado_en" TIMESTAMP(3);

CREATE TABLE "ajuste_sistema" (
    "id" SERIAL NOT NULL,
    "clave" VARCHAR(50) NOT NULL,
    "valor" VARCHAR(100) NOT NULL,
    "modificado_en" TIMESTAMP(3) NOT NULL,
    "modificado_por" VARCHAR(150),

    CONSTRAINT "ajuste_sistema_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ajuste_sistema_clave_key" ON "ajuste_sistema"("clave");
