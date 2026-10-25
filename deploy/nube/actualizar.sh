#!/usr/bin/env bash
# Actualiza el servidor a una versión nueva: respaldo de la base, código nuevo,
# reconstruir, esperar a la API y limpiar. Los datos, el .env y los respaldos no
# se tocan.
#
# En la PC:      bash deploy/empaquetar.sh && scp mollendo.tgz <usuario>@<servidor>:
# En el servidor: bash ~/mollendo/deploy/nube/actualizar.sh
#   (o, desde la PC:  ssh <usuario>@<servidor> 'bash -s' < deploy/nube/actualizar.sh)
set -euo pipefail

BASE="${MOLLENDO_BASE:-$HOME/mollendo}"
PAQUETE="${1:-$HOME/mollendo.tgz}"
PROYECTO="${MOLLENDO_PROYECTO:-mollendo}"
dc() { sudo docker compose -p "$PROYECTO" "$@"; }

[ -f "$PAQUETE" ] || { echo "Falta el paquete $PAQUETE (crearlo con deploy/empaquetar.sh y copiarlo)"; exit 1; }
cd "$BASE/deploy/nube"

RESPALDO="backups/antes-de-actualizar-$(date +%Y%m%d-%H%M).sql.gz"
dc exec -T db pg_dump -U mollendo mollendo_control_acceso </dev/null | gzip | sudo tee "$RESPALDO" >/dev/null
echo "Respaldo: $RESPALDO ($(sudo du -h "$RESPALDO" | cut -f1))"

cd "$BASE"
rm -rf mollendo-api mollendo-portal
tar -xzf "$PAQUETE" && rm -f "$PAQUETE"

cd deploy/nube
dc up -d --build 2>&1 | grep -vE '^ *#|^\s*$' | tail -6
for i in $(seq 1 60); do
  curl -fsS http://localhost:3001/api/v1/health >/dev/null 2>&1 && break
  [ "$i" -eq 60 ] && echo "AVISO: la API no respondió en 5 minutos"
  sleep 5
done
dc ps --format '{{.Service}}: {{.Status}}'
dc logs api 2>&1 | grep -E 'migrations|successfully started|ERROR' | tail -4 | cut -c1-200

# Limpieza: imágenes viejas y caché de compilación (deja 5 GB para que la próxima sea rápida).
sudo docker image prune -af >/dev/null 2>&1 || true
sudo docker builder prune -f --keep-storage 5GB >/dev/null 2>&1 || true
df -h / | tail -1
