-- Historial de sincronizaciones con los G4 Pro: "Sistema y APIs" muestra la
-- última aunque la API se reinicie.
CREATE TABLE "sincronizacion_g4" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origen" VARCHAR(10) NOT NULL,
    "simulacion" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "resultado" JSONB NOT NULL,

    CONSTRAINT "sincronizacion_g4_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sincronizacion_g4_fecha_idx" ON "sincronizacion_g4"("fecha");
