#!/usr/bin/env bash
# Instala el Controlador (PC) de la garita en un Ubuntu vacío: lectores de DNI,
# relés de los molinetes y la copia de los respaldos del servidor. Se puede
# volver a ejecutar: no cambia un .env que ya exista.
#
# Con una sola línea en el Controlador (PC) (descarga el programa de GitHub; si ya
# está instalado, lo actualiza con actualizar.sh):
#   bash <(curl -fsSL https://raw.githubusercontent.com/AlexanderDevelopment69/control-acceso-monte-azul-mollendo/main/deploy/controlador/instalar.sh)
# O con el paquete de deploy/empaquetar.sh en la carpeta del usuario:
#   mkdir -p ~/mollendo && tar -xzf ~/mollendo.tgz -C ~/mollendo && rm ~/mollendo.tgz
#   bash ~/mollendo/deploy/controlador/instalar.sh
#
# Pide (o en variables, para no preguntar):
#   SERVIDOR_URL    dirección del servidor (https://accesos.monteazulsur.com.pe)
#   DEVICE_API_KEY  la clave de equipos del servidor (DEVICE_API_KEY de su .env)
#   COPIA_ORIGEN    usuario@servidor para la copia de respaldos (Enter = sin copia)
set -euo pipefail

REPOSITORIO="${MOLLENDO_REPOSITORIO:-https://github.com/AlexanderDevelopment69/control-acceso-monte-azul-mollendo}"
BASE="${MOLLENDO_BASE:-$HOME/mollendo}"

# Ejecutado solo (sin el programa al lado): lo descarga de GitHub, sin documentos.
if [ ! -f "$(dirname "$0")/docker-compose.yml" ]; then
  echo "== Descargando el programa de GitHub"
  TEMPORAL="$(mktemp -d)"
  curl -fsSL "$REPOSITORIO/archive/refs/heads/${MOLLENDO_RAMA:-main}.tar.gz" | tar -xz -C "$TEMPORAL" --strip-components=1
  find "$TEMPORAL" -name '*.md' -delete
  rm -rf "$TEMPORAL/mollendo-api/.agents" "$TEMPORAL/mollendo-api/skills-lock.json"
  tar -czf "$HOME/mollendo.tgz" -C "$TEMPORAL" mollendo-api mollendo-portal deploy
  rm -rf "$TEMPORAL"
  if [ -f "$BASE/deploy/controlador/.env" ]; then
    echo "Ya está instalado en $BASE: se actualiza."
    exec bash "$BASE/deploy/controlador/actualizar.sh" "$HOME/mollendo.tgz"
  fi
  mkdir -p "$BASE" && tar -xzf "$HOME/mollendo.tgz" -C "$BASE" && rm -f "$HOME/mollendo.tgz"
  exec bash "$BASE/deploy/controlador/instalar.sh" "$@"
fi

CARPETA="$(cd "$(dirname "$0")" && pwd)"
dc() { sudo docker compose "$@"; }
paso() { printf '\n== %s\n' "$*"; }
cd "$CARPETA"

paso "1/4 Docker y hora de Lima"
if ! command -v docker >/dev/null || ! sudo docker compose version >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo apt-get install -y -qq docker.io docker-compose-v2 docker-buildx >/dev/null
fi
sudo systemctl enable --now docker >/dev/null 2>&1
sudo timedatectl set-timezone America/Lima
echo "Docker $(sudo docker --version | cut -d' ' -f3 | tr -d ,) · hora $(date +%H:%M)"

paso "2/4 Configuración (.env)"
if [ -f .env ]; then
  echo "Ya existe .env: se usa tal como está."
else
  preguntar() { # variable, texto, obligatoria, oculta
    local valor="${!1:-}"
    if [ -z "$valor" ] && [ -t 0 ]; then
      if [ "${4:-}" = oculta ]; then read -r -s -p "$2: " valor; echo >&2; else read -r -p "$2: " valor; fi
    fi
    if [ -z "$valor" ] && [ "$3" = si ]; then echo "Falta $1" >&2; exit 1; fi
    printf '%s' "$valor"
  }
  SERVIDOR_URL="$(preguntar SERVIDOR_URL 'Dirección del servidor (p. ej. https://accesos.monteazulsur.com.pe)' si)"
  DEVICE_API_KEY="$(preguntar DEVICE_API_KEY 'Clave de equipos del servidor (DEVICE_API_KEY, no se muestra)' si oculta)"
  COPIA_ORIGEN="$(preguntar COPIA_ORIGEN 'Copia de respaldos desde usuario@servidor (p. ej. atenasac@74.163.89.6; Enter = sin copia)' no)"

  # Lectores de DNI: adaptadores USB-serie conectados (ingreso el primero, salida el segundo).
  mapfile -t LECTORES < <(ls -1 /dev/serial/by-id/ 2>/dev/null | sed 's|^|/dev/serial/by-id/|')
  echo "Adaptadores USB-serie conectados: ${#LECTORES[@]}"
  for l in "${LECTORES[@]}"; do echo "  $l"; done
  INGRESO="${LECTOR_DNI_INGRESO_DISPOSITIVO:-${LECTORES[0]:-}}"
  SALIDA="${LECTOR_DNI_SALIDA_DISPOSITIVO:-${LECTORES[1]:-}}"
  if [ -t 0 ] && [ ${#LECTORES[@]} -gt 0 ]; then
    read -r -p "Lector de INGRESO [$INGRESO]: " r; INGRESO="${r:-$INGRESO}"
    read -r -p "Lector de SALIDA [$SALIDA]: " r; SALIDA="${r:-$SALIDA}"
  fi

  umask 077
  cat > .env <<EOF
SERVIDOR_URL=$SERVIDOR_URL
DEVICE_API_KEY=$DEVICE_API_KEY
LECTOR_DNI_INGRESO_DISPOSITIVO=$INGRESO
LECTOR_DNI_SALIDA_DISPOSITIVO=$SALIDA
RELE_INGRESO_SERIE=${RELE_INGRESO_SERIE:-ING01}
RELE_SALIDA_SERIE=${RELE_SALIDA_SERIE:-SAL01}
RELE_AVISO_INGRESO_SERIE=${RELE_AVISO_INGRESO_SERIE:-DEN01}
RELE_AVISO_SALIDA_SERIE=${RELE_AVISO_SALIDA_SERIE:-DSA01}
RELE_AVISO_INGRESO_MODO=${RELE_AVISO_INGRESO_MODO:-alterno}
RELE_AVISO_SALIDA_MODO=${RELE_AVISO_SALIDA_MODO:-alterno}
EOF
  if [ -n "$COPIA_ORIGEN" ]; then
    printf 'COMPOSE_PROFILES=copia\nCOPIA_ORIGEN=%s\n' "$COPIA_ORIGEN" >> .env
  fi
  chmod 600 .env && umask 022
  echo "Creado .env (relés ING01, SAL01, DEN01 y DSA01; se cambian en .env)."
fi

COPIA=no
grep -q '^COMPOSE_PROFILES=.*copia' .env && COPIA=si
if [ "$COPIA" = si ]; then
  mkdir -p copia/respaldos
  [ -f copia/clave ] || ssh-keygen -q -t ed25519 -N '' -C copia-respaldos -f copia/clave
  chmod 600 copia/clave
fi

paso "3/4 Construir y levantar (la primera vez tarda varios minutos)"
dc up -d --build 2>&1 | grep -vE '^ *#|^\s*$' | tail -4
sudo docker image prune -f >/dev/null 2>&1 || true

paso "4/4 Estado"
sleep 15
dc ps --format '{{.Service}}: {{.Status}}'
sudo docker logs mollendo-controlador 2>&1 | tail -8 | cut -c1-200
df -h / | tail -1

echo
echo "LISTO. Registro en vivo: sudo docker logs -f mollendo-controlador"
if [ "$COPIA" = si ]; then
  cat <<EOF

Falta un paso para la copia de respaldos: en el SERVIDOR ejecutar
  bash ~/mollendo/deploy/nube/autorizar-copia.sh "$(cat copia/clave.pub)"
y luego aquí:  sudo docker compose run --rm copia-respaldos ahora
Los respaldos quedan en $CARPETA/copia/respaldos.
EOF
fi
