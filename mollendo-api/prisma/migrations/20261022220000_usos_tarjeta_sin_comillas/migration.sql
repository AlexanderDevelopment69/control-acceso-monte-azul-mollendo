-- Usos de tarjetas guardados antes de quitar las comillas del sistema (21/10/2026):
-- p. ej. Nadie eligió al personal en el Panel ("Salida sin DNI") -> (Salida sin DNI).
UPDATE "uso_tarjeta_contingencia" SET "detalle" = replace("detalle", '"', '') WHERE "detalle" LIKE '%"%';
