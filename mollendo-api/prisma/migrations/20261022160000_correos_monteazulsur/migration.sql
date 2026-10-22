-- Cuentas por defecto con el dominio de Monte Azul Sur (22/10/2026): admin@mollendo.local -> admin@monteazulsur.com.pe
-- y vigilancia@mollendo.local -> vigilancia@monteazulsur.com.pe. Mismas contraseñas; solo si el correo nuevo no existe. Las sesiones
-- abiertas de esas cuentas se cierran (se entra con el correo nuevo).
UPDATE "usuario" SET "correo" = 'admin@monteazulsur.com.pe', "password_cambiado_en" = date_trunc('second', now() AT TIME ZONE 'UTC')
WHERE "correo" = 'admin@mollendo.local' AND NOT EXISTS (SELECT 1 FROM "usuario" WHERE "correo" = 'admin@monteazulsur.com.pe');

UPDATE "usuario" SET "correo" = 'vigilancia@monteazulsur.com.pe', "password_cambiado_en" = date_trunc('second', now() AT TIME ZONE 'UTC')
WHERE "correo" = 'vigilancia@mollendo.local' AND NOT EXISTS (SELECT 1 FROM "usuario" WHERE "correo" = 'vigilancia@monteazulsur.com.pe');

-- La empresa interna (OTP/MAS) tenía de contacto el correo del administrador.
UPDATE "empresa" SET "correo_contacto" = 'admin@monteazulsur.com.pe' WHERE "correo_contacto" = 'admin@mollendo.local';
