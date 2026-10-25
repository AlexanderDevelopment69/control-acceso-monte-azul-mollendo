#!/usr/bin/env bash
# Permite que el Controlador (PC) copie los respaldos de este servidor. La clave
# queda limitada a LEER la carpeta de respaldos: no sirve para entrar al
# servidor ni para cambiar nada.
#
#   bash ~/mollendo/deploy/nube/autorizar-copia.sh "ssh-ed25519 AAAA… copia-respaldos"
# (la clave la muestra deploy/controlador/instalar.sh al terminar)
set -euo pipefail

CLAVE="${1:?Uso: autorizar-copia.sh \"<clave pública del Controlador (PC)>\"}"
case "$CLAVE" in ssh-*) ;; *) echo "Eso no parece una clave pública (empieza con ssh-)"; exit 1 ;; esac
RESPALDOS="$(cd "$(dirname "$0")" && pwd)/backups"
command -v rrsync >/dev/null || { sudo apt-get update -qq && sudo apt-get install -y -qq rsync >/dev/null; }

mkdir -p ~/.ssh && chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
# Una sola clave de copia: si ya había una (p. ej. de un Controlador anterior), se reemplaza.
sed -i '/copia-respaldos$/d' ~/.ssh/authorized_keys
CUERPO="$(echo "$CLAVE" | awk '{ print $1, $2 }')"
echo "command=\"rrsync -ro $RESPALDOS\",restrict $CUERPO copia-respaldos" >> ~/.ssh/authorized_keys
echo "Listo: el Controlador (PC) ya puede copiar $RESPALDOS (solo lectura)."
