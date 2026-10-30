# Entorno TODO EN CONTROLADOR — Controlador (PC) como servidor completo (opcional)

> **Hoy no se usa**: se trabaja con [`../nube`](../nube/README.md) + [`../controlador`](../controlador/README.md). Queda documentado por si se vuelve a esta forma.

Todo en el Controlador (PC) del punto de acceso: portal, API, base de datos y respaldos, con los lectores de DNI y los relés conectados por USB al mismo equipo. El G4 Pro se conecta por la red local. No depende de internet.

Los comandos `docker compose` se ejecutan en `~/mollendo/deploy/todo-en-controlador` (ahí están el `.env` y `backups/`).

## Índice

1. [Archivos de esta carpeta](#archivos-de-esta-carpeta)
2. [Requisitos](#requisitos)
3. [Primer despliegue](#primer-despliegue)
4. [Actualizar a una versión nueva](#actualizar-a-una-versión-nueva)
5. [Verificar](#verificar)

## Archivos de esta carpeta

| Archivo | Qué es |
|---|---|
| `docker-compose.yml` | Los programas de la forma "todo en el Controlador (PC)": base de datos, API, portal y respaldo diario |
| `.env.example` | Modelo del archivo de claves y equipos |
| `README.md` | Esta guía |

Hoy no se usa: no tiene scripts de instalación.

## Requisitos

- **La PC:** Git Bash, SSH, Tailscale conectado (o estar en la red de la garita) y la carpeta del proyecto.
- **El Controlador (PC):** Ubuntu Server, usuario con `sudo` (hoy `ma-admin`, Tailscale `100.78.153.33`, red local `172.20.20.197`), con los lectores y los relés conectados por USB. IP fija en la red local (reservada en el router), porque el G4 Pro apunta a ella.
- **Los lectores**, una sola vez: mostrarles los códigos del folleto de su caja *Factory Default*, *RS232*, *115200* y desenchufar y volver a enchufar su energía.

## Primer despliegue

**1. Instalar Docker en el Controlador (PC):**

```bash
ssh ma-admin@100.78.153.33
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2 docker-buildx
sudo systemctl enable --now docker
sudo timedatectl set-timezone America/Lima
exit
```

**2. Empaquetar y subir el código** (en la PC, en la carpeta del proyecto):

```bash
bash deploy/empaquetar.sh
scp mollendo.tgz ma-admin@100.78.153.33:
```

**3. Descomprimir y crear el `.env`** (en el Controlador (PC)):

```bash
mkdir -p ~/mollendo && cd ~/mollendo
tar -xzf ~/mollendo.tgz && rm ~/mollendo.tgz
cd deploy/todo-en-controlador
cat > .env <<EOF
DB_PASSWORD=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 48 | tr -d '\n')
DEVICE_API_KEY=$(openssl rand -hex 32)
G4PRO_SN_PERMITIDOS=HSR3263100192
CORS_ORIGIN=http://100.78.153.33:3000,http://172.20.20.197:3000
ADMIN_SEED_PASSWORD=$(openssl rand -base64 12 | tr -dc 'A-Za-z0-9')Aa1
VIGILANCIA_SEED_PASSWORD=$(openssl rand -base64 12 | tr -dc 'A-Za-z0-9')Aa1
MOLINETES_REMOTOS=false
RELE_INGRESO_SERIE=ING01
RELE_SALIDA_SERIE=SAL01
RELE_AVISO_INGRESO_SERIE=DEN01
RELE_AVISO_SALIDA_SERIE=DSA01
EOF
chmod 600 .env
ls /dev/serial/by-id/          # una ruta por lector
nano .env                      # agregar LECTOR_DNI_INGRESO_DISPOSITIVO=... y LECTOR_DNI_SALIDA_DISPOSITIVO=... con esas rutas
grep SEED_PASSWORD .env        # las dos contraseñas iniciales
```

> No cambiar `DB_PASSWORD` después del primer arranque.

**4. Levantar y crear las cuentas iniciales:**

```bash
sudo docker compose up -d --build
sleep 30                                   # espera a que arranque la API
sudo docker compose logs api | grep -E "migrations|successfully started"
sudo docker compose run --rm -T api npm run db:seed      # solo la primera vez
```

**5. Relés nuevos** (vienen con la serie `S2OD2`): conectar uno a la vez, leer las series y ponerle la suya:

```bash
sudo docker compose exec api sh -c 'for h in /sys/class/hidraw/*; do /app/rele-usb /dev-servidor/$(basename $h) estado; done'
sudo docker compose exec api /app/rele-usb /dev-servidor/hidraw1 serie ING01
sudo docker compose restart api      # al terminar con todos
```

**6. G4 Pro** (*Cloud Service Settings*): servidor `172.20.20.197`, puerto `3001`. Entrar a `http://172.20.20.197:3000` y cambiar las contraseñas iniciales.

## Actualizar a una versión nueva

```bash
# En la PC, en la carpeta del proyecto
bash deploy/empaquetar.sh
scp mollendo.tgz ma-admin@100.78.153.33:

# En el Controlador (PC)
cd ~/mollendo/deploy/todo-en-controlador
sudo docker compose exec -T db pg_dump -U mollendo mollendo_control_acceso | gzip | sudo tee backups/antes-de-actualizar-$(date +%Y%m%d-%H%M).sql.gz >/dev/null
cd ~/mollendo
rm -rf mollendo-api mollendo-portal       # NO borrar deploy/: ahí están el .env y los respaldos
tar -xzf ~/mollendo.tgz && rm ~/mollendo.tgz
cd deploy/todo-en-controlador
sudo docker compose up -d --build
```

## Verificar

`sudo docker compose ps` (api, portal, backup "Up"; db "healthy") y en **Sistema y APIs**: G4 Pro "En línea", lectores y relés "Conectado" y sin la tarjeta "Controlador". Problemas comunes: los mismos de [`../nube`](../nube/README.md) y [`../controlador`](../controlador/README.md) (lectores y relés).

Pasar de este modo a nube + controlador, o al revés: [guía, sección 8g](../../docs/despliegue/Guia_Despliegue_y_Operacion.md).
