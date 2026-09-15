-- CreateEnum
CREATE TYPE "estado_empresa" AS ENUM ('activa', 'inactiva');

-- CreateEnum
CREATE TYPE "estado_cuenta" AS ENUM ('invitado', 'activo', 'baja');

-- CreateEnum
CREATE TYPE "caso_puesto" AS ENUM ('visita', 'personal_propio', 'contratista', 'tercero');

-- CreateEnum
CREATE TYPE "tipo_documento_identidad" AS ENUM ('DNI', 'CE', 'PASAPORTE');

-- CreateEnum
CREATE TYPE "estado_persona" AS ENUM ('activo', 'inactivo');

-- CreateEnum
CREATE TYPE "tipo_validacion_documento" AS ENUM ('fecha_vencimiento', 'si_no', 'vigente_por_actividad');

-- CreateEnum
CREATE TYPE "estado_aprobacion_documento" AS ENUM ('pendiente', 'aprobado', 'rechazado');

-- CreateEnum
CREATE TYPE "estado_solicitud_visita" AS ENUM ('programada', 'completada', 'cancelada');

-- CreateEnum
CREATE TYPE "tipo_movimiento" AS ENUM ('ingreso', 'salida');

-- CreateEnum
CREATE TYPE "resultado_acceso" AS ENUM ('autorizado', 'denegado');

-- CreateEnum
CREATE TYPE "accion_auditoria" AS ENUM ('crear', 'modificar', 'aprobar', 'eliminar');

-- CreateTable
CREATE TABLE "empresa" (
    "id" SERIAL NOT NULL,
    "ruc" VARCHAR(11) NOT NULL,
    "razon_social" VARCHAR(200) NOT NULL,
    "correo_contacto" VARCHAR(150) NOT NULL,
    "telefono_contacto" VARCHAR(20),
    "estado" "estado_empresa" NOT NULL DEFAULT 'activa',
    "contrato_vigencia_inicio" DATE,
    "contrato_vigencia_fin" DATE,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255),
    "estado_cuenta" "estado_cuenta" NOT NULL DEFAULT 'invitado',
    "token_invitacion" VARCHAR(255),
    "token_expira" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puesto" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "caso" "caso_puesto" NOT NULL,

    CONSTRAINT "puesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persona" (
    "id" SERIAL NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "puesto_id" INTEGER,
    "tipo_documento_identidad" "tipo_documento_identidad" NOT NULL,
    "numero_documento" VARCHAR(20) NOT NULL,
    "nombres" VARCHAR(150) NOT NULL,
    "apellidos" VARCHAR(150) NOT NULL,
    "area" VARCHAR(100),
    "estado" "estado_persona" NOT NULL DEFAULT 'activo',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_documento" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo_validacion" "tipo_validacion_documento" NOT NULL,

    CONSTRAINT "tipo_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisito_por_puesto" (
    "puesto_id" INTEGER NOT NULL,
    "tipo_documento_id" INTEGER NOT NULL,
    "obligatorio" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "requisito_por_puesto_pkey" PRIMARY KEY ("puesto_id","tipo_documento_id")
);

-- CreateTable
CREATE TABLE "documento_persona" (
    "id" SERIAL NOT NULL,
    "persona_id" INTEGER NOT NULL,
    "tipo_documento_id" INTEGER NOT NULL,
    "fecha_emision" DATE,
    "fecha_vencimiento" DATE,
    "archivo_url" VARCHAR(500),
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "estado_aprobacion" "estado_aprobacion_documento" NOT NULL DEFAULT 'pendiente',
    "version" INTEGER NOT NULL DEFAULT 1,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documento_persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitud_visita" (
    "id" SERIAL NOT NULL,
    "persona_id" INTEGER NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "persona_visitada" VARCHAR(150) NOT NULL,
    "motivo" VARCHAR(300) NOT NULL,
    "fecha_hora_programada" TIMESTAMP(3) NOT NULL,
    "estado" "estado_solicitud_visita" NOT NULL DEFAULT 'programada',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitud_visita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evento_acceso" (
    "id" SERIAL NOT NULL,
    "persona_id" INTEGER NOT NULL,
    "tipo_movimiento" "tipo_movimiento" NOT NULL,
    "resultado" "resultado_acceso" NOT NULL,
    "denegado_por_baja" BOOLEAN NOT NULL DEFAULT false,
    "denegado_por_alcohol" BOOLEAN NOT NULL DEFAULT false,
    "denegado_por_documentos" BOOLEAN NOT NULL DEFAULT false,
    "denegado_sin_ingreso_previo" BOOLEAN NOT NULL DEFAULT false,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "torniquete_id" VARCHAR(50),

    CONSTRAINT "evento_acceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "tabla_afectada" VARCHAR(50) NOT NULL,
    "registro_id" INTEGER NOT NULL,
    "accion" "accion_auditoria" NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresa_ruc_key" ON "empresa"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE INDEX "usuario_empresa_id_idx" ON "usuario"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "puesto_nombre_caso_key" ON "puesto"("nombre", "caso");

-- CreateIndex
CREATE INDEX "persona_empresa_id_idx" ON "persona"("empresa_id");

-- CreateIndex
CREATE INDEX "persona_puesto_id_idx" ON "persona"("puesto_id");

-- CreateIndex
CREATE INDEX "persona_numero_documento_idx" ON "persona"("numero_documento");

-- CreateIndex
CREATE UNIQUE INDEX "persona_tipo_documento_identidad_numero_documento_key" ON "persona"("tipo_documento_identidad", "numero_documento");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_documento_nombre_key" ON "tipo_documento"("nombre");

-- CreateIndex
CREATE INDEX "documento_persona_persona_id_idx" ON "documento_persona"("persona_id");

-- CreateIndex
CREATE INDEX "documento_persona_persona_id_tipo_documento_id_vigente_idx" ON "documento_persona"("persona_id", "tipo_documento_id", "vigente");

-- CreateIndex
CREATE INDEX "solicitud_visita_persona_id_idx" ON "solicitud_visita"("persona_id");

-- CreateIndex
CREATE INDEX "solicitud_visita_fecha_hora_programada_idx" ON "solicitud_visita"("fecha_hora_programada");

-- CreateIndex
CREATE INDEX "evento_acceso_persona_id_fecha_hora_idx" ON "evento_acceso"("persona_id", "fecha_hora");

-- CreateIndex
CREATE INDEX "auditoria_tabla_afectada_registro_id_idx" ON "auditoria"("tabla_afectada", "registro_id");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona" ADD CONSTRAINT "persona_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona" ADD CONSTRAINT "persona_puesto_id_fkey" FOREIGN KEY ("puesto_id") REFERENCES "puesto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisito_por_puesto" ADD CONSTRAINT "requisito_por_puesto_puesto_id_fkey" FOREIGN KEY ("puesto_id") REFERENCES "puesto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisito_por_puesto" ADD CONSTRAINT "requisito_por_puesto_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "tipo_documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento_persona" ADD CONSTRAINT "documento_persona_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento_persona" ADD CONSTRAINT "documento_persona_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "tipo_documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_visita" ADD CONSTRAINT "solicitud_visita_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_visita" ADD CONSTRAINT "solicitud_visita_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_acceso" ADD CONSTRAINT "evento_acceso_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
