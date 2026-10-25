#!/bin/sh
# Respaldo diario del sistema (corre en el contenedor "backup", ver deploy/nube/docker-compose.yml o deploy/garita/docker-compose.yml).
#
# Cada día a la hora HORA_RESPALDO (por defecto 04:00, hora de Lima) guarda en
# /backups un paquete mollendo-AAAAMMDD-HHMM.tar.gz con:
#   base-de-datos.sql   copia completa de PostgreSQL
#   archivos/           documentos (PDF, imágenes, Word) y fotos del personal
# Al arrancar, si del último respaldo al próximo programado pasarían más de 24
# horas (p. ej. no hay ninguno, o se cambió la hora a una más tarde), hace uno en
# ese momento: así "Sistema y APIs" no lo marca como atrasado.
#
# Limpieza (después de cada respaldo), con DIAS_RESPALDO días (por defecto 30):
#   - respaldos diarios (mollendo-*) de más de DIAS_RESPALDO días;
#   - respaldos previos a actualizaciones o restauraciones (antes-de-*) de más de
#     DIAS_RESPALDO días, conservando siempre el más reciente.

HORA="${HORA_RESPALDO:-04:00}"
DIAS="${DIAS_RESPALDO:-30}"
# Un valor que no sea un número entero positivo no debe borrar de más: se usan 14.
case "$DIAS" in '' | *[!0-9]* | 0) echo "DIAS_RESPALDO no válido ($DIAS): se guardan 30 días"; DIAS=30 ;; esac
DESTINO=/backups
ARCHIVOS=/storage # volumen de documentos y fotos (solo lectura)

respaldar() {
  nombre="mollendo-$(date +%Y%m%d-%H%M)"
  temporal=$(mktemp -d)
  if pg_dump -h db -U mollendo mollendo_control_acceso > "$temporal/base-de-datos.sql"; then
    mkdir -p "$temporal/archivos"
    cp -a "$ARCHIVOS/." "$temporal/archivos/" 2>/dev/null
    # Se escribe con otro nombre y se renombra al final: nunca queda un
    # respaldo a medias con el nombre definitivo.
    if tar -czf "$DESTINO/$nombre.tar.gz.parcial" -C "$temporal" . && mv "$DESTINO/$nombre.tar.gz.parcial" "$DESTINO/$nombre.tar.gz"; then
      echo "Respaldo $nombre.tar.gz ($(du -h "$DESTINO/$nombre.tar.gz" | cut -f1))"
    else
      echo "ERROR: no se pudo escribir el respaldo $nombre"
      rm -f "$DESTINO/$nombre.tar.gz.parcial"
    fi
  else
    echo "ERROR: falló la copia de la base de datos (pg_dump)"
  fi
  rm -rf "$temporal"
  limpiar
}

limpiar() {
  find "$DESTINO" -maxdepth 1 -name 'mollendo-*' -mtime +"$DIAS" -delete
  ultimo=$(ls -1t "$DESTINO"/antes-de-* 2>/dev/null | head -n 1)
  find "$DESTINO" -maxdepth 1 -name 'antes-de-*' -mtime +"$DIAS" | while read -r f; do
    [ "$f" != "$ultimo" ] && rm -f "$f"
  done
}

# Segundos que faltan para la próxima HORA (hoy o mañana).
segundos_hasta_la_hora() {
  ahora=$(date +'%H %M %S' | awk '{ print $1 * 3600 + $2 * 60 + $3 }')
  objetivo=$(echo "$HORA" | awk -F: '{ print $1 * 3600 + $2 * 60 }')
  espera=$((objetivo - ahora))
  [ "$espera" -le 0 ] && espera=$((espera + 86400))
  echo "$espera"
}

# Respaldo completo en el momento y salir:
#   docker compose run --rm -T backup ahora      (en la carpeta del entorno)
if [ "${1:-}" = "ahora" ]; then
  respaldar
  exit 0
fi

echo "Respaldo diario a las $HORA, se guardan $DIAS días (hora del contenedor: $(date +%H:%M))"
# Minutos hacia atrás en que debe haber un respaldo para que, con el próximo
# programado, no pasen más de 24 horas entre uno y otro.
ventana=$(( (86400 - $(segundos_hasta_la_hora)) / 60 ))
if [ -z "$(find "$DESTINO" -maxdepth 1 -name 'mollendo-*' -mmin -"$ventana" 2>/dev/null)" ]; then
  respaldar
fi
while true; do
  sleep "$(segundos_hasta_la_hora)"
  respaldar
  sleep 60 # evita repetir el respaldo dentro del mismo minuto
done
