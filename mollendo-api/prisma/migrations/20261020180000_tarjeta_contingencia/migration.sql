-- Tarjetas de contingencia (QR en lugar del DNI) y cada vez que se pasan por un lector.
CREATE TABLE "tarjeta_contingencia" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "codigo" VARCHAR(40) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "vence_el" DATE,
    "creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "codigo_cambiado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tarjeta_contingencia_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tarjeta_contingencia_numero_key" ON "tarjeta_contingencia"("numero");
CREATE UNIQUE INDEX "tarjeta_contingencia_codigo_key" ON "tarjeta_contingencia"("codigo");

CREATE TABLE "uso_tarjeta_contingencia" (
    "id" SERIAL NOT NULL,
    "tarjeta_id" INTEGER,
    "tipo_movimiento" "tipo_movimiento" NOT NULL,
    "aceptada" BOOLEAN NOT NULL,
    "detalle" VARCHAR(200) NOT NULL,
    "evento_acceso_id" INTEGER,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uso_tarjeta_contingencia_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "uso_tarjeta_contingencia_fecha_hora_idx" ON "uso_tarjeta_contingencia"("fecha_hora");

ALTER TABLE "uso_tarjeta_contingencia" ADD CONSTRAINT "uso_tarjeta_contingencia_tarjeta_id_fkey" FOREIGN KEY ("tarjeta_id") REFERENCES "tarjeta_contingencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "evento_acceso" ADD COLUMN "tarjeta_contingencia_id" INTEGER;

ALTER TABLE "evento_acceso" ADD CONSTRAINT "evento_acceso_tarjeta_contingencia_id_fkey" FOREIGN KEY ("tarjeta_contingencia_id") REFERENCES "tarjeta_contingencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
