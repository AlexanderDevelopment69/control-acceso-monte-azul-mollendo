# Entorno NUBE — servidor en la nube

Portal, API, base de datos y respaldos en el servidor en la nube: **Azure `74.163.89.6`** (de TMAM, desde el 16/10/2026; antes se usó AWS `54.147.214.38` para pruebas). Los lectores de DNI y los relés están en la mini PC de la garita ([`../controlador`](../controlador/README.md)), que se conecta a este servidor. El G4 Pro también se conecta directo aquí.

En el servidor todo vive en `~/mollendo`, y los comandos `docker compose` se ejecutan en `~/mollendo/deploy/nube`:

```
~/mollendo/
  mollendo-api/  mollendo-portal/   código (se reemplaza en cada actualización)
  deploy/nube/   docker-compose.yml · .env (claves; nunca borrar) · backups/ (nunca borrar)
```

## Servidor actual (Azure)

| Dato | Valor |
|---|---|
| Acceso | `ssh -i ~/.ssh/id_ed25519 atenasac@74.163.89.6` (`sudo` sin contraseña) |
| Portal | `http://74.163.89.6:3000` (HTTPS cuando TMAM entregue su dominio) |
| Equipos | API `74.163.89.6:3001`: controlador de la mini PC y G4 Pro |
| Máquina | Ubuntu 26.04, 4 CPU, 7,7 GB de memoria, 124 GB de disco, hora de Lima |
| Instalado | 16/10/2026, limpio (sin datos de prueba). Respaldos diarios a las 04:00, se guardan 30 días |

Las contraseñas iniciales quedaron en `~/mollendo/deploy/nube/.env` (`ADMIN_SEED_PASSWORD`, `VIGILANCIA_SEED_PASSWORD`): cambiarlas desde el portal después de entrar.

## Requisitos

**En tu PC:** Git y SSH (Windows 10/11 ya trae `ssh` y `scp`; usar PowerShell o Git Bash), la llave del servidor (`~/.ssh/id_ed25519`) y el proyecto:

```bash
git clone https://github.com/AlexanderDevelopment69/control-acceso-monte-azul-mollendo.git
cd control-acceso-monte-azul-mollendo
```

**El servidor:** Ubuntu con un usuario con `sudo` y estos puertos abiertos (en Azure: grupo de seguridad de red de la máquina → reglas de entrada; los administra TMAM): `22` (SSH), `3000` (portal) y `3001` (API, G4 Pro y controlador); `80` y `443` para el HTTPS con el dominio. En Azure están abiertos los cinco (comprobado el 16/10/2026). Si el internet del terminal tiene IP pública fija, abre el `3001` solo para esa IP (`<IP>/32`): ver [seguridad, 4.2](../../docs/seguridad/Seguridad.md#42-restringir-el-puerto-3001-por-ip).

## Primer despliegue

**1. Instalar Docker en el servidor** (es lo único que se instala en el sistema):

```bash
ssh -i ~/.ssh/id_ed25519 atenasac@74.163.89.6
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2 docker-buildx
sudo systemctl enable --now docker
sudo timedatectl set-timezone America/Lima
exit
```

**2. Empaquetar y subir el código** (en tu PC, en la carpeta del proyecto; se empaqueta el último commit):

```bash
git archive --format=tar.gz -o mollendo.tgz HEAD mollendo-api mollendo-portal deploy
scp -i ~/.ssh/id_ed25519 mollendo.tgz atenasac@74.163.89.6:
```

**3. Descomprimir y crear el `.env`** (en el servidor). El bloque genera claves al azar; cambia `CORS_ORIGIN` si la IP es otra y pon en `G4PRO_SN_PERMITIDOS` el número de serie del G4 Pro (está en su etiqueta; varios, separados por coma):

```bash
mkdir -p ~/mollendo && cd ~/mollendo
tar -xzf ~/mollendo.tgz && rm ~/mollendo.tgz
cd deploy/nube
cat > .env <<EOF
DB_PASSWORD=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 48 | tr -d '\n')
DEVICE_API_KEY=$(openssl rand -hex 32)
G4PRO_SN_PERMITIDOS=HSR3263100192
CORS_ORIGIN=http://74.163.89.6:3000
ADMIN_SEED_PASSWORD=$(openssl rand -base64 12 | tr -dc 'A-Za-z0-9')Aa1
VIGILANCIA_SEED_PASSWORD=$(openssl rand -base64 12 | tr -dc 'A-Za-z0-9')Aa1
MOLINETES_REMOTOS=true
G4PRO_HORA_SINCRONIZACION=off
EOF
chmod 600 .env
cat .env      # anota ADMIN_SEED_PASSWORD, VIGILANCIA_SEED_PASSWORD y DEVICE_API_KEY
```

> No cambies `DB_PASSWORD` después de este paso: la base la guarda al crearse.
>
> `G4PRO_SN_PERMITIDOS` es obligatoria: sin ella `docker compose` no arranca. El servidor solo atiende a esos terminales (las rutas del G4 Pro no llevan clave). Swagger (`/api/docs`) queda apagado; para verlo un momento, `SWAGGER=true` en `.env` y `sudo docker compose up -d`.

**4. Levantar** (la primera vez tarda varios minutos):

```bash
sudo docker compose up -d --build
sleep 30                                   # espera a que arranque la API
sudo docker compose logs api | grep -E "migrations|successfully started"
```

**5. Crear las cuentas iniciales** (solo esta vez):

```bash
sudo docker compose run --rm -T api npm run db:seed
```

**6. Conectar los equipos:**
- G4 Pro (*Cloud Service Settings*): servidor `74.163.89.6`, puerto `3001`. Después, en **Sistema y APIs**, "Sincronizar" para enviarle al personal con su foto.
- Controlador de la garita: en su `.env`, `SERVIDOR_URL=http://74.163.89.6:3001` y la **misma** `DEVICE_API_KEY` (ver [`../controlador`](../controlador/README.md)).

7. Entra a `http://74.163.89.6:3000` con `admin@mollendo.local` y cambia las contraseñas iniciales (también la de `vigilancia@mollendo.local`).

## Actualizar a una versión nueva

Los datos están en volúmenes de Docker y no se tocan.

> Desde la versión del 11/10/2026 el `.env` necesita `G4PRO_SN_PERMITIDOS` (número de serie del G4 Pro). Si tu `.env` es anterior, agrégala antes de levantar: `echo "G4PRO_SN_PERMITIDOS=<número de serie>" >> .env`.

```bash
# En tu PC (con los cambios ya en un commit)
git archive --format=tar.gz -o mollendo.tgz HEAD mollendo-api mollendo-portal deploy
scp -i ~/.ssh/id_ed25519 mollendo.tgz atenasac@74.163.89.6:

# En el servidor
cd ~/mollendo/deploy/nube
sudo docker compose exec -T db pg_dump -U mollendo mollendo_control_acceso | gzip | sudo tee backups/antes-de-actualizar-$(date +%Y%m%d-%H%M).sql.gz >/dev/null
cd ~/mollendo
rm -rf mollendo-api mollendo-portal       # NO borrar deploy/: ahí están el .env y los respaldos
tar -xzf ~/mollendo.tgz && rm ~/mollendo.tgz
cd deploy/nube
sudo docker compose up -d --build
sleep 30                                   # espera a que arranque la API
sudo docker compose logs api | grep -E "migrations|successfully started|Error"
```

## Verificar

```bash
cd ~/mollendo/deploy/nube
sudo docker compose ps                        # api, portal, backup "Up" y db "healthy"
curl -s http://localhost:3001/api/v1/health   # {"status":"ok","database":"up",...}
ls backups                                    # respaldo diario a las 00:00
```

En el portal, **Sistema y APIs**: backend y base de datos "En línea"; controlador y G4 Pro "Conectado" cuando la garita está en línea.

## Si algo falla

| Síntoma | Qué hacer |
|---|---|
| El portal no abre desde afuera | `curl -I http://localhost:3000` en el servidor; si responde, revisar las reglas de entrada del grupo de seguridad de red en Azure |
| `api` se reinicia y el log dice "Authentication failed" | Se cambió `DB_PASSWORD`: volver a la original y `sudo docker compose up -d` |
| Cambié el `.env` y no toma efecto | `sudo docker compose up -d` (recrea los contenedores con el `.env` nuevo) |
| Ver qué pasa | `sudo docker compose logs -f api` |

Respaldos y cómo restaurarlos, enlace público temporal y más: [guía, secciones 6 a 8](../../docs/despliegue/Registro_Despliegue_MiniPC.md). Qué es cada variable: [`.env.example`](.env.example) y anexo B de la guía.

## Pasar desde la estructura anterior (hecho en AWS el 10/10/2026)

Antes se usaba `~/mollendo/docker-compose.prod.yml`, con el `.env` y `backups/` en `~/mollendo`. Con el paquete nuevo ya subido:

```bash
cd ~/mollendo
sudo docker compose -f docker-compose.prod.yml exec -T db pg_dump -U mollendo mollendo_control_acceso | gzip | sudo tee backups/antes-de-reorganizar-$(date +%Y%m%d-%H%M).sql.gz >/dev/null
sudo docker compose -f docker-compose.prod.yml down        # sin -v: los volúmenes no se tocan
mkdir -p ~/mollendo-previo-$(date +%Y%m%d)
sudo mv mollendo-api mollendo-portal deploy docker-compose.prod.yml docker-compose.controlador.yml deploy.env.example ~/mollendo-previo-$(date +%Y%m%d)/
tar -xzf ~/mollendo.tgz && rm ~/mollendo.tgz
mv .env deploy/nube/.env && sudo mv backups deploy/nube/backups
cd deploy/nube && chmod 600 .env && sudo docker compose up -d --build
```
