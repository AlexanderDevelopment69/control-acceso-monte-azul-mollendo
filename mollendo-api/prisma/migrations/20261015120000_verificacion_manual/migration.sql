-- Verificación manual (contingencia por falla del equipo facial, decidida el
-- 15/10/2026): periodos de verificación manual, ingresos en espera que decide un
-- vigilante y la marca en cada ingreso (manual, quién decidió, rostro no coincide).
-- AlterTable
ALTER TABLE "evento_acceso" ADD COLUMN     "denegado_rostro_no_coincide" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificacion_manual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificado_por_id" INTEGER;

-- AlterTable
ALTER TABLE "ingreso_pendiente" ADD COLUMN     "manual" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "periodo_verificacion_manual" (
    "id" SERIAL NOT NULL,
    "motivo" VARCHAR(300) NOT NULL,
    "activado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activado_por_id" INTEGER,
    "terminado_en" TIMESTAMP(3),
    "terminado_por_id" INTEGER,

    CONSTRAINT "periodo_verificacion_manual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "periodo_verificacion_manual_terminado_en_idx" ON "periodo_verificacion_manual"("terminado_en");

-- AddForeignKey
ALTER TABLE "evento_acceso" ADD CONSTRAINT "evento_acceso_verificado_por_id_fkey" FOREIGN KEY ("verificado_por_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodo_verificacion_manual" ADD CONSTRAINT "periodo_verificacion_manual_activado_por_id_fkey" FOREIGN KEY ("activado_por_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodo_verificacion_manual" ADD CONSTRAINT "periodo_verificacion_manual_terminado_por_id_fkey" FOREIGN KEY ("terminado_por_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

