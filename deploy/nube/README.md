# Entorno NUBE — servidor en la nube

Portal, API, base de datos y respaldos en un servidor en la nube (AWS hoy: `54.147.214.38`; Azure después). Los lectores de DNI y los relés de los molinetes están en la mini PC de la garita, que se conecta a este servidor (ver [`../controlador`](../controlador/README.md)). El G4 Pro también se conecta directo a este servidor.

En el servidor todo queda en `~/mollendo`, con el mismo orden que el repositorio. Los comandos `docker compose` se ejecutan **dentro de `~/mollendo/deploy/nube`**, que es donde están el `docker-compose.yml`, el `.env` y la carpeta `backups/`.

```
~/mollendo/
  mollendo-api/  mollendo-portal/      código (se reemplaza en cada actualización)
  deploy/nube/
    docker-compose.yml
    .env                               claves de este servidor (no está en git; nunca borrarlo)
    backups/                           respaldos diarios (nunca borrarlos)
```

## 1. Requisitos (una vez)

- Servidor Ubuntu con acceso SSH. Puertos abiertos: **3000** (portal) y **3001** (API, G4 Pro y controlador).
- Docker es lo único que se instala en el sistema:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 docker-buildx
sudo systemctl enable --now docker
sudo timedatectl set-timezone America/Lima
```

## 2. Primer despliegue

**En la PC**, en la raíz del proyecto, con los cambios confirmados con commit:

```bash
git archive --format=tar.gz -o mollendo.tgz HEAD mollendo-api mollendo-portal deploy
scp mollendo.tgz ubuntu@54.147.214.38:
```

**En el servidor:**

```bash
mkdir -p ~/mollendo && cd ~/mollendo
tar -xzf ~/mollendo.tgz && rm ~/mollendo.tgz
cd deploy/nube
cat > .env <<EOF
DB_PASSWORD=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 48 | tr -d '\n')
DEVICE_API_KEY=$(openssl rand -hex 32)
CORS_ORIGIN=http://54.147.214.38:3000
ADMIN_SEED_PASSWORD=$(openssl rand -base64 12 | tr -dc 'A-Za-z0-9')Aa1
VIGILANCIA_SEED_PASSWORD=$(openssl rand -base64 12 | tr -dc 'A-Za-z0-9')Aa1
MOLINETES_REMOTOS=true
G4PRO_HORA_SINCRONIZACION=off
EOF
chmod 600 .env
cat .env          # anota ADMIN_SEED_PASSWORD y VIGILANCIA_SEED_PASSWORD
sudo docker compose up -d --build
sudo docker compose logs api | grep -E "migrations|successfully started"
sudo docker compose run --rm -T api npm run db:seed      # solo la primera vez: cuentas iniciales
```

Qué significa cada opción del `.env`: [`.env.example`](.env.example) y el anexo B de la guía.

> **No cambies `DB_PASSWORD` después del primer arranque**: la base la guarda al crearse y el backend ya no podría conectarse.

Después:
- En el **G4 Pro** (*Cloud Service Settings*): servidor `54.147.214.38`, puerto `3001`.
- En el **controlador** de la garita: `SERVIDOR_URL=http://54.147.214.38:3001` y la **misma** `DEVICE_API_KEY` de este `.env`.
- Entra al portal y cambia las dos contraseñas iniciales.

## 3. Actualizar a una versión nueva

Los datos (personal, documentos, eventos) están en los volúmenes de Docker y no se tocan.

**En la PC:**

```bash
git archive --format=tar.gz -o mollendo.tgz HEAD mollendo-api mollendo-portal deploy
scp mollendo.tgz ubuntu@54.147.214.38:
```

**En el servidor:**

```bash
cd ~/mollendo/deploy/nube
sudo docker compose exec -T db pg_dump -U mollendo mollendo_control_acceso | gzip > backups/antes-de-actualizar-$(date +%Y%m%d-%H%M).sql.gz
cd ~/mollendo
rm -rf mollendo-api mollendo-portal          # NO borrar deploy/: ahí están el .env y los respaldos
tar -xzf ~/mollendo.tgz && rm ~/mollendo.tgz
cd deploy/nube
sudo docker compose up -d --build
sudo docker compose logs api | grep -E "migrations|successfully started|Error"
```

Si la versión trae migraciones de base de datos, el backend las aplica solo al arrancar.

## 4. Verificar

```bash
cd ~/mollendo/deploy/nube
sudo docker compose ps                         # api, portal, backup y db "Up" (db "healthy")
curl -s http://localhost:3001/api/v1/health    # {"status":"ok","database":"up",...}
ls backups                                     # el primer respaldo se hace al arrancar
```

En el navegador, `http://54.147.214.38:3000` → iniciar sesión → **Sistema y APIs**: backend y base de datos "En línea", controlador y G4 Pro "Conectado" cuando la garita está en línea.

## 5. Comandos útiles

```bash
cd ~/mollendo/deploy/nube
sudo docker compose logs -f api              # registro de la API en vivo
sudo docker compose restart api              # reiniciar la API (p. ej. después de cambiar el .env)
sudo docker compose --profile muestra up -d muestra                   # enlace público temporal
sudo docker compose logs muestra | grep trycloudflare                 # ver el enlace
sudo docker compose --profile muestra rm -sf muestra                  # apagarlo
```

Respaldos, restaurar, solución de problemas y el detalle de cada equipo: [`docs/despliegue/Registro_Despliegue_MiniPC.md`](../../docs/despliegue/Registro_Despliegue_MiniPC.md).

## 6. Pasar desde la estructura anterior (una sola vez)

Hasta octubre de 2026 el servidor usaba `~/mollendo/docker-compose.prod.yml`, con el `.env` y `backups/` en `~/mollendo`. Para pasar a esta carpeta, sin perder datos (los volúmenes conservan su nombre):

```bash
cd ~/mollendo
sudo docker compose -f docker-compose.prod.yml down        # sin -v: los volúmenes no se tocan
rm -rf mollendo-api mollendo-portal deploy docker-compose.prod.yml docker-compose.controlador.yml
tar -xzf ~/mollendo.tgz && rm ~/mollendo.tgz               # paquete nuevo (sección 3, en la PC)
mv .env deploy/nube/.env
mv backups deploy/nube/backups
cd deploy/nube
sudo docker compose up -d --build
```
