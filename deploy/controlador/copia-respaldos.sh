#!/bin/sh
# Copia de los respaldos del servidor en el Controlador (PC): si se pierde el
# servidor, los datos siguen aquí. Corre en el contenedor "copia-respaldos"
# (ver docker-compose.yml de esta carpeta, perfil "copia").
#
# Cada día a la HORA_COPIA (por defecto 05:00, una hora después del respaldo del
# servidor) trae los respaldos nuevos a /copia/respaldos. Solo lee: la clave que
# usa (copia/clave) en el servidor solo sirve para leer la carpeta de respaldos
# (ver deploy/nube/autorizar-copia.sh). Borra aquí los de más de DIAS_COPIA días
# (por defecto 30).
#   Copiar en el momento:  docker compose run --rm copia-respaldos ahora

HORA="${HORA_COPIA:-05:00}"
DIAS="${DIAS_COPIA:-30}"
case "$DIAS" in '' | *[!0-9]* | 0) DIAS=30 ;; esac
ORIGEN="${COPIA_ORIGEN:?Falta COPIA_ORIGEN (usuario@servidor)}"
DESTINO=/copia/respaldos

command -v rsync >/dev/null || apk add --no-cache -q rsync openssh-client tzdata >/dev/null
mkdir -p "$DESTINO"

copiar() {
  if rsync -rt --partial --exclude '*.parcial' \
      -e "ssh -i /copia/clave -o UserKnownHostsFile=/copia/known_hosts -o StrictHostKeyChecking=accept-new -o ConnectTimeout=30" \
      "$ORIGEN:" "$DESTINO/"; then
    echo "$(date '+%d/%m %H:%M') Copia al día: $(ls "$DESTINO" | wc -l) respaldos, $(du -sh "$DESTINO" | cut -f1)"
  else
    echo "$(date '+%d/%m %H:%M') ERROR: no se pudo copiar los respaldos del servidor"
  fi
  find "$DESTINO" -maxdepth 1 -type f -mtime +"$DIAS" -delete
}

segundos_hasta_la_hora() {
  ahora=$(date +'%H %M %S' | awk '{ print $1 * 3600 + $2 * 60 + $3 }')
  objetivo=$(echo "$HORA" | awk -F: '{ print $1 * 3600 + $2 * 60 }')
  espera=$((objetivo - ahora))
  [ "$espera" -le 0 ] && espera=$((espera + 86400))
  echo "$espera"
}

if [ "${1:-}" = "ahora" ]; then
  copiar
  exit 0
fi

echo "Copia diaria de los respaldos de $ORIGEN a las $HORA, se guardan $DIAS días"
copiar
while true; do
  sleep "$(segundos_hasta_la_hora)"
  copiar
  sleep 60
done
