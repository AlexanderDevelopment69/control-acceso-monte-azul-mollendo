#!/usr/bin/env bash
# Actualiza el Controlador (PC) a una versión nueva. El .env, la lista del
# personal para salidas sin conexión y la copia de respaldos no se tocan.
#
# En la PC del proyecto: bash deploy/empaquetar.sh && scp mollendo.tgz <usuario>@<controlador>:
# En el Controlador:     bash ~/mollendo/deploy/controlador/actualizar.sh
#   (o, desde la PC:  ssh <usuario>@<controlador> 'bash -s' < deploy/controlador/actualizar.sh)
set -euo pipefail

BASE="${MOLLENDO_BASE:-$HOME/mollendo}"
PAQUETE="${1:-$HOME/mollendo.tgz}"
[ -f "$PAQUETE" ] || { echo "Falta el paquete $PAQUETE (crearlo con deploy/empaquetar.sh y copiarlo)"; exit 1; }

cd "$BASE"
rm -rf mollendo-api mollendo-portal
tar -xzf "$PAQUETE" && rm -f "$PAQUETE"

cd deploy/controlador
sudo docker compose up -d --build 2>&1 | grep -vE '^ *#|^\s*$' | tail -4
sudo docker image prune -af >/dev/null 2>&1 || true
sudo docker builder prune -f --keep-storage 3GB >/dev/null 2>&1 || true
sleep 15
sudo docker compose ps --format '{{.Service}}: {{.Status}}'
sudo docker logs mollendo-controlador 2>&1 | tail -6 | cut -c1-200
df -h / | tail -1
