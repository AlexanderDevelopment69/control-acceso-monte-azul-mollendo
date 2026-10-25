#!/usr/bin/env bash
# Carga un respaldo en el servidor: REEMPLAZA la base de datos (y, con un
# respaldo diario, los documentos y fotos). Antes guarda un respaldo de lo que hay.
#
#   bash ~/mollendo/deploy/nube/restaurar.sh <archivo>
# <archivo>: un respaldo diario  mollendo-AAAAMMDD-HHMM.tar.gz  (base + documentos y fotos)
#            o uno previo a una actualización  antes-de-actualizar-…sql.gz  (solo base)
# Puede estar en backups/ o en cualquier carpeta. Agregar -s para no preguntar.
set -euo pipefail

CARPETA="$(cd "$(dirname "$0")" && pwd)"
PROYECTO="${MOLLENDO_PROYECTO:-mollendo}"
dc() { sudo docker compose -p "$PROYECTO" "$@"; }
SIN_PREGUNTAR=no
[ "${1:-}" = "-s" ] && { SIN_PREGUNTAR=si; shift; }
ARCHIVO="${1:-}"
[ -n "$ARCHIVO" ] || { echo "Uso: restaurar.sh [-s] <archivo de respaldo>"; ls -1t "$CARPETA/backups" 2>/dev/null | head -5; exit 1; }
[ -f "$ARCHIVO" ] || ARCHIVO="$CARPETA/backups/$ARCHIVO"
[ -f "$ARCHIVO" ] || { echo "No existe el archivo $1"; exit 1; }
ARCHIVO="$(cd "$(dirname "$ARCHIVO")" && pwd)/$(basename "$ARCHIVO")"
cd "$CARPETA"

if [ "$SIN_PREGUNTAR" = no ]; then
  read -r -p "Se reemplazarán los datos actuales con $(basename "$ARCHIVO"). Escriba SI para seguir: " r
  [ "$r" = "SI" ] || { echo "Cancelado"; exit 1; }
fi

echo "== 1/5 Respaldo de lo que hay ahora"
PREVIO="backups/antes-de-restaurar-$(date +%Y%m%d-%H%M).sql.gz"
dc exec -T db pg_dump -U mollendo mollendo_control_acceso </dev/null | gzip | sudo tee "$PREVIO" >/dev/null
echo "$PREVIO"

TEMPORAL="$(mktemp -d)"
trap 'sudo rm -rf "$TEMPORAL"' EXIT
case "$ARCHIVO" in
  *.tar.gz) sudo tar -xzf "$ARCHIVO" -C "$TEMPORAL"; SQL="$TEMPORAL/base-de-datos.sql" ;;
  *.sql.gz) sudo cat "$ARCHIVO" | gunzip -c > "$TEMPORAL/base-de-datos.sql"; SQL="$TEMPORAL/base-de-datos.sql" ;;
  *) echo "Formato no reconocido (se espera .tar.gz o .sql.gz)"; exit 1 ;;
esac
sudo test -s "$SQL" || { echo "El respaldo no trae la base de datos"; exit 1; }

echo "== 2/5 Detener lo que escribe en la base"
dc stop api portal backup >/dev/null

echo "== 3/5 Base de datos"
dc exec -T db dropdb -U mollendo --if-exists mollendo_control_acceso
dc exec -T db createdb -U mollendo mollendo_control_acceso
sudo cat "$SQL" | dc exec -T db psql -q -v ON_ERROR_STOP=1 -U mollendo -d mollendo_control_acceso >/dev/null

echo "== 4/5 Documentos y fotos"
if sudo test -d "$TEMPORAL/archivos"; then
  sudo docker run --rm -v "${PROYECTO}_documentos:/datos" -v "$TEMPORAL/archivos:/respaldo:ro" alpine \
    sh -c 'rm -rf /datos/* && cp -a /respaldo/. /datos/'
  echo "Restaurados"
else
  echo "Este respaldo es solo de la base: los documentos y fotos actuales se conservan."
fi

echo "== 5/5 Arrancar (si el respaldo es de una versión anterior, la API actualiza la base sola)"
dc start api portal backup >/dev/null
for i in $(seq 1 60); do
  curl -fsS http://localhost:3001/api/v1/health >/dev/null 2>&1 && { echo "API en línea"; break; }
  [ "$i" -eq 60 ] && echo "AVISO: la API no respondió en 5 minutos"
  sleep 5
done
dc ps --format '{{.Service}}: {{.Status}}'
echo "LISTO. Si algo salió mal, se puede volver atrás con: bash $CARPETA/restaurar.sh $PREVIO"
