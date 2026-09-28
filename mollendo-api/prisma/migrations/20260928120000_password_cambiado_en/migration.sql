-- Fecha del último cambio de contraseña: los tokens emitidos antes dejan de valer.
ALTER TABLE "usuario" ADD COLUMN "password_cambiado_en" TIMESTAMP(3);
