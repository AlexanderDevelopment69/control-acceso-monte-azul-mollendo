#!/usr/bin/env bash
# Instala el sistema en un servidor Ubuntu vacío (portal, API, base de datos,
# HTTPS y respaldos). Se puede volver a ejecutar: no borra datos ni cambia un
# .env que ya exista.
#
# En el equipo, con el paquete de deploy/empaquetar.sh en la carpeta del usuario:
#   mkdir -p ~/mollendo && tar -xzf ~/mollendo.tgz -C ~/mollendo && rm ~/mollendo.tgz
#   bash ~/mollendo/deploy/nube/instalar.sh
#
# Los datos que pide (o en variables, para no preguntar):
#   DOMINIO              dominio del portal, ya apuntando a este servidor
#   G4PRO_SN_PERMITIDOS  número de serie del terminal facial (varios, con coma)
#   G4PRO_IPS_PERMITIDAS IP pública de la sede (opcional; vacía = cualquier IP)
# Después, para cargar los datos de un respaldo: restaurar.sh.
set -euo pipefail

BASE="${MOLLENDO_BASE:-$HOME/mollendo}"

# Ejecutado solo (sin el programa al lado): lo descarga del repositorio que se
# indique en MOLLENDO_REPOSITORIO (dirección de GitHub), sin documentos; si ya
# está instalado, lo actualiza con actualizar.sh.
if [ ! -f "$(dirname "$0")/docker-compose.yml" ]; then
  [ -n "${MOLLENDO_REPOSITORIO:-}" ] || { echo "Falta el programa: copiar y descomprimir mollendo.tgz en ~/mollendo (ver la guía de instalación)"; exit 1; }
  echo "== Descargando el programa"
  TEMPORAL="$(mktemp -d)"
  curl -fsSL "$MOLLENDO_REPOSITORIO/archive/refs/heads/${MOLLENDO_RAMA:-main}.tar.gz" | tar -xz -C "$TEMPORAL" --strip-components=1
  find "$TEMPORAL" -name '*.md' -delete
  rm -rf "$TEMPORAL/mollendo-api/.agents" "$TEMPORAL/mollendo-api/skills-lock.json"
  tar -czf "$HOME/mollendo.tgz" -C "$TEMPORAL" mollendo-api mollendo-portal deploy
  rm -rf "$TEMPORAL"
  if [ -f "$BASE/deploy/nube/.env" ] && [ -f "$BASE/deploy/nube/docker-compose.yml" ]; then
    echo "Ya está instalado en $BASE: se actualiza."
    exec bash "$BASE/deploy/nube/actualizar.sh" "$HOME/mollendo.tgz"
  fi
  mkdir -p "$BASE" && tar -xzf "$HOME/mollendo.tgz" -C "$BASE" && rm -f "$HOME/mollendo.tgz"
  exec bash "$BASE/deploy/nube/instalar.sh" "$@"
fi

CARPETA="$(cd "$(dirname "$0")" && pwd)"
PROYECTO="${MOLLENDO_PROYECTO:-mollendo}"
dc() { sudo docker compose -p "$PROYECTO" "$@"; }
paso() { printf '\n== %s\n' "$*"; }

cd "$CARPETA"

paso "1/6 Docker y hora de Lima"
if ! command -v docker >/dev/null || ! sudo docker compose version >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo apt-get install -y -qq docker.io docker-compose-v2 docker-buildx >/dev/null
fi
sudo systemctl enable --now docker >/dev/null 2>&1
sudo timedatectl set-timezone America/Lima
echo "Docker $(sudo docker --version | cut -d' ' -f3 | tr -d ,) · hora $(date +%H:%M)"

paso "2/6 Configuración (.env)"
if [ -f .env ]; then
  echo "Ya existe .env: se usa tal como está."
else
  preguntar() { # variable, texto, obligatoria
    local valor="${!1:-}"
    if [ -z "$valor" ] && [ -t 0 ]; then read -r -p "$2: " valor; fi
    if [ -z "$valor" ] && [ "$3" = si ]; then echo "Falta $1" >&2; exit 1; fi
    printf '%s' "$valor"
  }
  clave() { openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c "$1"; }
  DOMINIO="$(preguntar DOMINIO 'Dominio del portal (p. ej. accesos.monteazulsur.com.pe)' si)"
  G4PRO_SN_PERMITIDOS="$(preguntar G4PRO_SN_PERMITIDOS 'N.º de serie del terminal facial (p. ej. HSR3263100192)' si)"
  G4PRO_IPS_PERMITIDAS="$(preguntar G4PRO_IPS_PERMITIDAS 'IP pública de la sede (Enter para dejarla vacía)' no)"
  umask 077
  cat > .env <<EOF
DB_PASSWORD=$(clave 40)
JWT_SECRET=$(clave 64)
JWT_REFRESH_SECRET=$(clave 64)
DEVICE_API_KEY=$(clave 48)
G4PRO_SN_PERMITIDOS=$G4PRO_SN_PERMITIDOS
G4PRO_IPS_PERMITIDAS=$G4PRO_IPS_PERMITIDAS
DOMINIO=$DOMINIO
CORS_ORIGIN=https://$DOMINIO
ADMIN_SEED_PASSWORD=$(clave 14)Aa1
VIGILANCIA_SEED_PASSWORD=$(clave 14)Aa1
SOPORTE_SEED_PASSWORD=$(clave 14)Aa1
MOLINETES_REMOTOS=true
G4PRO_HORA_SINCRONIZACION=off
HORA_RESPALDO=04:00
DIAS_RESPALDO=30
EOF
  chmod 600 .env && umask 022
  echo "Creado .env con claves nuevas (no cambiar DB_PASSWORD después)."
fi
mkdir -p backups

paso "3/6 Construir y levantar (la primera vez tarda varios minutos)"
dc up -d --build 2>&1 | grep -vE '^ *#|^\s*$' | tail -6

paso "4/6 Esperar a la API"
for i in $(seq 1 60); do
  if curl -fsS http://localhost:3001/api/v1/health >/dev/null 2>&1; then echo "API en línea"; break; fi
  [ "$i" -eq 60 ] && { echo "La API no respondió en 5 minutos. Ver: sudo docker compose -p $PROYECTO logs api"; exit 1; }
  sleep 5
done

paso "5/6 Cuentas iniciales (si ya existen, no se cambian)"
dc run --rm -T api npm run db:seed </dev/null 2>&1 | tail -2

paso "6/6 Limpieza y estado"
sudo docker image prune -f >/dev/null 2>&1 || true
dc ps --format '{{.Service}}: {{.Status}}'
df -h / | tail -1
cat <<EOF

LISTO. Portal: https://$(grep '^DOMINIO=' .env | cut -d= -f2)
- Contraseñas iniciales y clave de equipos: en $CARPETA/.env
  (ADMIN_SEED_PASSWORD, VIGILANCIA_SEED_PASSWORD, SOPORTE_SEED_PASSWORD; la DEVICE_API_KEY va también en el Controlador (PC)).
- Para cargar un respaldo:  bash $CARPETA/restaurar.sh <archivo>
- Terminal facial: servidor $(grep '^DOMINIO=' .env | cut -d= -f2), puerto 3001.
EOF
