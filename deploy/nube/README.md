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
| Portal | **https://accesos.monteazulsur.com.pe** (HTTPS con certificado de Let's Encrypt que el contenedor `caddy` saca y renueva solo; `http://` redirige a `https://`). El 3000 ya no se abre desde afuera |
| Equipos | Controlador de la mini PC: `https://accesos.monteazulsur.com.pe`. G4 Pro: servidor `accesos.monteazulsur.com.pe` (o `74.163.89.6`), puerto `3001` (HTTP) |
| Máquina | Ubuntu 26.04, 4 CPU, 7,7 GB de memoria, 124 GB de disco, hora de Lima |
| Instalado | 16/10/2026, limpio (sin datos de prueba). Respaldos diarios a las 04:00, se guardan 30 días |

Las contraseñas iniciales quedaron en `~/mollendo/deploy/nube/.env` (`ADMIN_SEED_PASSWORD`, `VIGILANCIA_SEED_PASSWORD`): cambiarlas desde el portal después de entrar.

### HTTPS (dominio)

- El dominio `accesos.monteazulsur.com.pe` apunta a `74.163.89.6` (registro A en Cloudflare, en **"DNS only"**, nube gris: si se pasa a "Proxied", Caddy no puede renovar el certificado).
- `caddy` (ver `Caddyfile`) atiende 80 y 443: reenvía `/api/v1` a la API (con la IP real del usuario en `X-Forwarded-For`) y lo demás al portal. Certificado de Let's Encrypt desde el 16/10/2026, se renueva solo antes de vencer.
- En `.env`: `DOMINIO=accesos.monteazulsur.com.pe` y `CORS_ORIGIN=https://accesos.monteazulsur.com.pe`.
- El 3001 sigue abierto en HTTP para el G4 Pro (no está confirmado que este modelo funcione con HTTPS).

## Requisitos

**En tu PC:** Git y SSH (Windows 10/11 ya trae `ssh` y `scp`; usar PowerShell o Git Bash), la llave del servidor (`~/.ssh/id_ed25519`) y el proyecto:

```bash
git clone https://github.com/AlexanderDevelopment69/control-acceso-monte-azul-mollendo.git
cd control-acceso-monte-azul-mollendo
```

**El servidor:** Ubuntu con un usuario con `sudo` y estos puertos abiertos (en Azure: grupo de seguridad de red de la máquina → reglas de entrada; los administra TMAM): `22` (SSH), `3000` (portal) y `3001` (API, G4 Pro y controlador); `80` y `443` para el HTTPS con el dominio. En Azure están abiertos los cinco (comprobado el 16/10/2026). Si el internet del terminal tiene IP pública fija, abre el `3001` solo para esa IP (`<IP>/32`): ver [seguridad, 4.2](../../docs/seguridad/Seguridad.md#42-restringir-el-puerto-3001-por-ip).

## Primer despliegue (servidor vacío)

Todo lo hace `instalar.sh`: instala Docker, pone la hora de Lima, crea el `.env` con claves nuevas, construye, levanta y crea las cuentas iniciales.

**Con una sola línea en el servidor** (descarga el programa de GitHub, sin documentos; si ya está instalado, lo actualiza):

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/AlexanderDevelopment69/control-acceso-monte-azul-mollendo/main/deploy/nube/instalar.sh)
```

Instala lo que está en GitHub: antes, subir los commits (`git push`). **O con el paquete** desde la PC, con los cambios aunque no tengan commit:

```bash
# En tu PC, en la carpeta del proyecto (Git Bash): empaqueta tal como está, sin documentos
bash deploy/empaquetar.sh
scp -i ~/.ssh/id_ed25519 mollendo.tgz atenasac@74.163.89.6:

# En el servidor
mkdir -p ~/mollendo && tar -xzf ~/mollendo.tgz -C ~/mollendo && rm ~/mollendo.tgz
bash ~/mollendo/deploy/nube/instalar.sh
```

Pregunta el dominio, el número de serie del G4 Pro (`HSR3263100192`) y la IP pública de la sede (`190.119.170.73`). Al terminar, en `deploy/nube/.env` están las contraseñas iniciales y la `DEVICE_API_KEY` (va también en el Controlador (PC)).

- **Si se reinstala tras perder el servidor:** copiar antes el `.env` anterior a `~/mollendo/deploy/nube/.env` (así se conservan la `DEVICE_API_KEY` y el resto de las claves) y, después de instalar, cargar el último respaldo con `restaurar.sh` (abajo). Sin el `.env` anterior se crean claves nuevas: hay que poner la `DEVICE_API_KEY` nueva en el `.env` del Controlador (PC).
- **Después:** G4 Pro (*Cloud Service Settings*) con servidor `accesos.monteazulsur.com.pe`, puerto `3001`, y en **Sistema y APIs** "Sincronizar". Entrar al portal con `admin@monteazulsur.com.pe` y cambiar las contraseñas iniciales (también la de `vigilancia@monteazulsur.com.pe`).

> No cambies `DB_PASSWORD` después de instalar: la base la guarda al crearse.
>
> `G4PRO_SN_PERMITIDOS` es obligatoria: sin ella `docker compose` no arranca. El servidor solo atiende a esos terminales (las rutas del G4 Pro no llevan clave).
>
> `G4PRO_IPS_PERMITIDAS`: la IP pública de la sede (desde donde llega el G4 Pro; hoy `190.119.170.73`). Con ella, aunque alguien conozca el número de serie, no puede hacerse pasar por el equipo (pedir los datos del personal o abrir el molinete). Además, el puerto 3001 solo atiende al G4 Pro: el portal y el inicio de sesión van siempre por HTTPS.
>
> `ALCOHOLIMETRO_USB` **no va en el `.env`**: solo sirve para simular el alcoholímetro desconectado (`sudo ALCOHOLIMETRO_USB=ffff/0000 docker compose up -d --no-deps api`; volver con `sudo docker compose up -d --no-deps api`). Ver `docs/g4pro/Depuracion_y_Pruebas_G4Pro.md`, sección 8.
>
> **El G4 dejó de conectarse** (Sistema y APIs lo muestra desconectado) y en `sudo docker compose logs api | grep "Terminal rechazado"` dice "la IP no está en G4PRO_IPS_PERMITIDAS": la sede cambió de IP. Poner la nueva (la que figura en ese mensaje) en `.env` y `sudo docker compose up -d api`. Para salir del paso, dejarla vacía. Swagger (`/api/docs`) queda apagado; para verlo un momento, `SWAGGER=true` en `.env` y `sudo docker compose up -d`.

## Actualizar a una versión nueva

Respaldo de la base, código nuevo, reconstruir, esperar a la API y limpiar el disco (imágenes viejas y caché; el 23/10/2026 ocupaban ~97 GB). Los datos, el `.env` y los respaldos no se tocan.

```bash
# En tu PC
bash deploy/empaquetar.sh
scp -i ~/.ssh/id_ed25519 mollendo.tgz atenasac@74.163.89.6:
ssh -i ~/.ssh/id_ed25519 atenasac@74.163.89.6 'bash -s' < deploy/nube/actualizar.sh
```

## Restaurar un respaldo

```bash
ls ~/mollendo/deploy/nube/backups
bash ~/mollendo/deploy/nube/restaurar.sh mollendo-AAAAMMDD-HHMM.tar.gz
```

Reemplaza la base de datos y los documentos y fotos (pide escribir `SI`). Con un `antes-de-actualizar-….sql.gz` restaura solo la base. Antes guarda lo que hay en `backups/antes-de-restaurar-….sql.gz`, para volver atrás. Las cuentas quedan con las contraseñas que tenían en el respaldo.

## Copia de los respaldos fuera del servidor

El Controlador (PC) trae cada día a las 05:00 los respaldos del servidor (servicio `copia-respaldos`, ver [`../controlador`](../controlador/README.md)). Para autorizarlo, en el servidor, con la clave que muestra su instalador:

```bash
bash ~/mollendo/deploy/nube/autorizar-copia.sh "ssh-ed25519 AAAA… copia-respaldos"
```

Esa clave solo puede leer la carpeta `backups` (no abre una consola ni cambia nada).

## Verificar

```bash
cd ~/mollendo/deploy/nube
sudo docker compose ps                        # api, portal, backup "Up" y db "healthy"
curl -s http://localhost:3001/api/v1/health   # {"status":"ok","database":"up",...}
ls backups                                    # respaldo diario a las 04:00
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
