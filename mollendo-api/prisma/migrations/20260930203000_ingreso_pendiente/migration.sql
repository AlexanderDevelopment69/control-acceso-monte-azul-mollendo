-- El DNI y el resultado facial+alcohol del G4 Pro llegan en dos momentos
-- separados (ver Analisis_Control_Acceso_Mollendo.md sección 6.0). Esta tabla
-- es el puente entre ambos.

-- CreateTable
CREATE TABLE "ingreso_pendiente" (
    "id" SERIAL NOT NULL,
    "persona_id" INTEGER NOT NULL,
    "torniquete_id" VARCHAR(50),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumido_en" TIMESTAMP(3),

    CONSTRAINT "ingreso_pendiente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ingreso_pendiente_persona_id_consumido_en_idx" ON "ingreso_pendiente"("persona_id", "consumido_en");

-- AddForeignKey
ALTER TABLE "ingreso_pendiente" ADD CONSTRAINT "ingreso_pendiente_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;
