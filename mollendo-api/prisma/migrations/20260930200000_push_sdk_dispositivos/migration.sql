-- Protocolo PUSH/ADMS real contra el equipo G4 Pro. Ver
-- Analisis_Control_Acceso_Mollendo.md sección 6.1 para el detalle de cómo
-- se descubrió el requisito de RegistryCode y las tablas rtlog/rtstate.

-- CreateEnum
CREATE TYPE "estado_comando" AS ENUM ('pendiente', 'entregado', 'confirmado');

-- CreateTable
CREATE TABLE "dispositivo_acceso" (
    "id" SERIAL NOT NULL,
    "serial_number" VARCHAR(30) NOT NULL,
    "registry_code" VARCHAR(20) NOT NULL,
    "ip_address" VARCHAR(45),
    "ultima_actividad" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispositivo_acceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comando_dispositivo" (
    "id" SERIAL NOT NULL,
    "dispositivo_id" INTEGER NOT NULL,
    "comando" TEXT NOT NULL,
    "estado" "estado_comando" NOT NULL DEFAULT 'pendiente',
    "return_code" INTEGER,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entregado_en" TIMESTAMP(3),
    "confirmado_en" TIMESTAMP(3),

    CONSTRAINT "comando_dispositivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificacion_dispositivo" (
    "id" SERIAL NOT NULL,
    "dispositivo_id" INTEGER NOT NULL,
    "tabla" VARCHAR(20) NOT NULL,
    "hora_dispositivo" TIMESTAMP(3),
    "event_code" VARCHAR(10),
    "verify_type" VARCHAR(10),
    "concentracion" VARCHAR(20),
    "crudo" TEXT NOT NULL,
    "evento_acceso_id" INTEGER,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verificacion_dispositivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dispositivo_acceso_serial_number_key" ON "dispositivo_acceso"("serial_number");

-- CreateIndex
CREATE INDEX "comando_dispositivo_dispositivo_id_estado_idx" ON "comando_dispositivo"("dispositivo_id", "estado");

-- CreateIndex
CREATE INDEX "verificacion_dispositivo_dispositivo_id_creado_en_idx" ON "verificacion_dispositivo"("dispositivo_id", "creado_en");

-- AddForeignKey
ALTER TABLE "comando_dispositivo" ADD CONSTRAINT "comando_dispositivo_dispositivo_id_fkey" FOREIGN KEY ("dispositivo_id") REFERENCES "dispositivo_acceso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verificacion_dispositivo" ADD CONSTRAINT "verificacion_dispositivo_dispositivo_id_fkey" FOREIGN KEY ("dispositivo_id") REFERENCES "dispositivo_acceso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verificacion_dispositivo" ADD CONSTRAINT "verificacion_dispositivo_evento_acceso_id_fkey" FOREIGN KEY ("evento_acceso_id") REFERENCES "evento_acceso"("id") ON DELETE SET NULL ON UPDATE CASCADE;
