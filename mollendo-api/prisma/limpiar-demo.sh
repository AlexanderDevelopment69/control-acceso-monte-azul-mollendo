#!/bin/sh
# Borra los datos de DEMOSTRACIÓN cargados con prisma/datos-demo.ts:
# empresas con RUC 2099999990x, sus personas, documentos, fotos, eventos y
# auditoría, los eventos del molinete "DEMO" y los tipos de documento que
# quedan sin uso. No toca ningún otro dato.
#
# Uso, en el servidor (dentro de ~/mollendo); ENTORNO es la carpeta de deploy/
# donde corre el sistema (nube por defecto, o todo-en-controlador):
#   sudo sh mollendo-api/prisma/limpiar-demo.sh
#   sudo ENTORNO=todo-en-controlador sh mollendo-api/prisma/limpiar-demo.sh
set -e
cd "$(dirname "$0")/../../deploy/${ENTORNO:-nube}"
DC="docker compose"

# Carpetas de archivos de las personas DEMO (antes de borrar las filas).
IDS=$($DC exec -T db psql -U mollendo -d mollendo_control_acceso -tAc \
  "SELECT string_agg(p.id::text, ' ') FROM persona p JOIN empresa e ON e.id = p.empresa_id WHERE e.ruc LIKE '209999999%'" </dev/null)

$DC exec -T db psql -v ON_ERROR_STOP=1 -U mollendo -d mollendo_control_acceso <<'SQL'
BEGIN;
CREATE TEMP TABLE demo_personas AS
  SELECT p.id FROM persona p JOIN empresa e ON e.id = p.empresa_id WHERE e.ruc LIKE '209999999%';
CREATE TEMP TABLE demo_documentos AS
  SELECT id FROM documento_persona WHERE persona_id IN (SELECT id FROM demo_personas);

DELETE FROM evento_acceso WHERE persona_id IN (SELECT id FROM demo_personas) OR torniquete_id = 'DEMO';
DELETE FROM auditoria WHERE tabla_afectada = 'documento_persona' AND registro_id IN (SELECT id FROM demo_documentos);
DELETE FROM documento_persona WHERE id IN (SELECT id FROM demo_documentos);
DELETE FROM auditoria WHERE tabla_afectada = 'persona' AND registro_id IN (SELECT id FROM demo_personas);
DELETE FROM persona WHERE id IN (SELECT id FROM demo_personas);
DELETE FROM auditoria WHERE tabla_afectada = 'empresa' AND registro_id IN (SELECT id FROM empresa WHERE ruc LIKE '209999999%');
DELETE FROM empresa WHERE ruc LIKE '209999999%';
-- Tipos de documento que ya no usa nadie (los creó la carga DEMO).
DELETE FROM auditoria WHERE tabla_afectada = 'tipo_documento'
  AND registro_id IN (SELECT id FROM tipo_documento WHERE id NOT IN (SELECT DISTINCT tipo_documento_id FROM documento_persona));
DELETE FROM tipo_documento WHERE id NOT IN (SELECT DISTINCT tipo_documento_id FROM documento_persona);
COMMIT;
SQL

# Archivos (documentos y fotos) en el volumen de documentos.
if [ -n "$IDS" ]; then
  DIRS=""
  for id in $IDS; do DIRS="$DIRS /datos/documentos/persona-$id"; done
  docker run --rm -v mollendo_documentos:/datos alpine rm -rf $DIRS
fi
echo "Datos DEMO borrados."
