-- CreateTable
CREATE TABLE "configuracion_smtp" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "host" VARCHAR(200) NOT NULL,
    "puerto" INTEGER NOT NULL DEFAULT 587,
    "seguro" BOOLEAN NOT NULL DEFAULT false,
    "usuario" VARCHAR(200),
    "password" VARCHAR(255),
    "remitente" VARCHAR(200) NOT NULL,
    "actualizado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_smtp_pkey" PRIMARY KEY ("id")
);
