#!/usr/bin/env bash
# Instala en el Controlador (PC) el vigilante del botón "Reiniciar" de Sistema y APIs
# (una sola vez; se puede repetir). El contenedor no puede reiniciar el equipo por sí
# mismo (Docker lo aísla): deja el archivo "reiniciar" en /var/lib/mollendo-reinicio
# y systemd (mollendo-reinicio.path) reinicia el equipo de forma normal.
#   sudo bash ~/mollendo/deploy/controlador/instalar-reinicio.sh
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "Ejecutar con: sudo bash $0"; exit 1; }
ORIGEN="$(cd "$(dirname "$0")/reinicio" && pwd)"

install -d -m 755 /var/lib/mollendo-reinicio
rm -f /var/lib/mollendo-reinicio/reiniciar
# sed quita los finales de línea de Windows (CRLF), por si el paquete se armó en Windows.
sed 's/\r$//' "$ORIGEN/mollendo-reinicio" > /usr/local/sbin/mollendo-reinicio
chmod 755 /usr/local/sbin/mollendo-reinicio
for unidad in mollendo-reinicio.path mollendo-reinicio.service; do
  sed 's/\r$//' "$ORIGEN/$unidad" > "/etc/systemd/system/$unidad"
  chmod 644 "/etc/systemd/system/$unidad"
done
systemctl daemon-reload
systemctl enable --now mollendo-reinicio.path
# Señal para el controlador: con este archivo, el botón puede enviar la orden.
date -Iseconds > /var/lib/mollendo-reinicio/instalado
systemctl is-active mollendo-reinicio.path
echo "Listo: el botón Reiniciar de Sistema y APIs ya puede reiniciar este equipo."
