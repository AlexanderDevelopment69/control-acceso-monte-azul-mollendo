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

# Docker sin sudo si el usuario está en el grupo docker (así no pide contraseña).
if docker info >/dev/null 2>&1; then D="docker"; else D="sudo docker"; fi

cd "$BASE"
# Algunos archivos pueden ser de root (creados por contenedores): si rm no puede, los borra un contenedor.
rm -rf mollendo-api mollendo-portal 2>/dev/null ||
  $D run --rm -v "$BASE:/base" --entrypoint sh alpine:3.22 -c 'rm -rf /base/mollendo-api /base/mollendo-portal'
tar -xzf "$PAQUETE" && rm -f "$PAQUETE"

cd deploy/controlador
$D compose up -d --build </dev/null 2>&1 | grep -vE '^ *#|^\s*$' | tail -4
$D image prune -af >/dev/null 2>&1 || true
$D builder prune -f --keep-storage 3GB >/dev/null 2>&1 || true
sleep 15
$D compose ps --format '{{.Service}}: {{.Status}}'
$D logs mollendo-controlador 2>&1 | tail -6 | cut -c1-200
df -h / | tail -1
