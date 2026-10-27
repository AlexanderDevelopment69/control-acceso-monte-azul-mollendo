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
# El paquete no lleva documentos (.md); se borran los que dejaron versiones anteriores.
find deploy -name '*.md' -type f -delete

cd deploy/nube
# Cuentas que agregan las versiones nuevas (p. ej. soporte, 25/10/2026): su contraseña inicial va al .env.
if ! grep -q '^SOPORTE_SEED_PASSWORD=' .env; then
  echo "SOPORTE_SEED_PASSWORD=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 14)Aa1" >> .env
  echo "Agregada a .env la contraseña inicial de soporte@monteazulsur.com.pe (SOPORTE_SEED_PASSWORD)"
fi
dc up -d --build 2>&1 | grep -vE '^ *#|^\s*$' | tail -6
for i in $(seq 1 60); do
  curl -fsS http://localhost:3001/api/v1/health >/dev/null 2>&1 && break
  [ "$i" -eq 60 ] && echo "AVISO: la API no respondió en 5 minutos"
  sleep 5
done
# Crea las cuentas que falten; las existentes no se tocan.
dc run --rm -T api npm run db:seed </dev/null 2>&1 | grep -E '^ +(Administrador|Vigilancia|Soporte):' || true
dc ps --format '{{.Service}}: {{.Status}}'
dc logs api 2>&1 | grep -E 'migrations|successfully started|ERROR' | tail -4 | cut -c1-200

# Limpieza: imágenes viejas y caché de compilación (deja 5 GB para que la próxima sea rápida).
sudo docker image prune -af >/dev/null 2>&1 || true
sudo docker builder prune -f --keep-storage 5GB >/dev/null 2>&1 || true
df -h / | tail -1
