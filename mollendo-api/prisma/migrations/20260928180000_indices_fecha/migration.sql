-- Listas paginadas del Panel de vigilancia y de Auditoría: se filtran y ordenan por fecha.
CREATE INDEX "evento_acceso_fecha_hora_idx" ON "evento_acceso"("fecha_hora");
CREATE INDEX "auditoria_fecha_hora_idx" ON "auditoria"("fecha_hora");
