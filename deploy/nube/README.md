# Entorno NUBE — servidor en la nube

Portal, API, base de datos y respaldos en el servidor en la nube: **Azure `74.163.89.6`** (de TMAM, desde el 16/10/2026; antes se usó AWS `54.147.214.38` para pruebas). Los lectores de DNI y los relés están en el Controlador (PC) del punto de acceso ([`../controlador`](../controlador/README.md)), que se conecta a este servidor. El G4 Pro también se conecta directo aquí.

En el servidor todo vive en `~/mollendo`, y los comandos `docker compose` se ejecutan en `~/mollendo/deploy/nube`:

```
~/mollendo/
  mollendo-api/  mollendo-portal/   código (se reemplaza en cada actualización)
  deploy/nube/   docker-compose.yml · .env (claves; nunca borrar) · backups/ (nunca borrar)
```

## Índice

1. [Archivos de esta carpeta](#archivos-de-esta-carpeta)
2. [Requisitos](#requisitos)
3. [Instalar todo desde cero](#instalar-todo-desde-cero)
4. [Actualizar a una versión nueva](#actualizar-a-una-versión-nueva)
5. [Respaldos](#respaldos)
6. [Servidor actual (Azure)](#servidor-actual-azure)
   - [HTTPS (dominio)](#https-dominio)
7. [Notas del `.env`](#notas-del-env)
8. [Verificar](#verificar)
9. [Si algo falla](#si-algo-falla)

## Archivos de esta carpeta

**Los que se ejecutan:**

| Archivo | Qué hace | Cuándo se usa |
|---|---|---|
| `instalar.sh` | Instala todo el sistema en el servidor | Una vez, en un servidor nuevo |
| `actualizar.sh` | Pone una versión nueva del programa (antes saca un respaldo) | Cada versión nueva |
| `restaurar.sh` | Recupera los datos de un respaldo | Solo si se pierden datos |
| `autorizar-copia.sh` | Permite que el Controlador (PC) copie los respaldos | Solo con la copia automática (opcional) |

**Los de configuración** (no se ejecutan; los usan los scripts):

| Archivo | Qué es |
|---|---|
| `docker-compose.yml` | Los programas que corren en el servidor: base de datos, API, portal, HTTPS (`caddy`) y respaldo diario (`backup`); además `muestra`, un enlace público temporal apagado por defecto |
| `Caddyfile` | Configuración del HTTPS: el portal abre en https://accesos.monteazulsur.com.pe con certificado |
| `.env.example` | Modelo del archivo de claves. El `.env` real lo crea `instalar.sh` en el servidor y nunca se sube al proyecto |
| `README.md` | Esta guía |

En el servidor, además: `.env` (las claves; nunca borrar) y `backups/` (los respaldos; nunca borrar).

## Requisitos

- **La PC:** Git Bash, la carpeta del proyecto, las llaves `~/.ssh/id_ed25519` (servidor) y `~/.ssh/controlador_pc_key` (Controlador (PC)) y Tailscale conectado.
- **El servidor:** Ubuntu, usuario `atenasac` con `sudo`. Puertos abiertos en Azure (grupo de seguridad de red → reglas de entrada; los administra TMAM): `22`, `80`, `443` y `3001`. El dominio `accesos.monteazulsur.com.pe` apuntando a `74.163.89.6` (Cloudflare, "DNS only"). Si el internet del terminal tiene IP pública fija, el `3001` puede abrirse solo para `190.119.170.73/32`: ver [seguridad, 4.2](../../docs/seguridad/Seguridad.md#42-restringir-el-puerto-3001-por-ip).
- **El Controlador (PC):** Ubuntu con internet, usuario `ma-admin` con `sudo`, Tailscale `100.78.153.33`; lectores de DNI y relés conectados por USB.

## Instalar todo desde cero

Siempre en este orden. Los comandos "en la PC" se ejecutan en Git Bash, en la carpeta del proyecto.

**Paso 0. Crear el paquete del programa** (en la PC; tal como está la carpeta, sin documentos):

```bash
bash deploy/empaquetar.sh
```

**Paso 1. Servidor.**

```bash
# En la PC
scp -i ~/.ssh/id_ed25519 mollendo.tgz atenasac@74.163.89.6:
ssh -i ~/.ssh/id_ed25519 atenasac@74.163.89.6

# En el servidor
mkdir -p ~/mollendo && tar -xzf ~/mollendo.tgz -C ~/mollendo && rm ~/mollendo.tgz
bash ~/mollendo/deploy/nube/instalar.sh
```

Responder: dominio `accesos.monteazulsur.com.pe`, serie del G4 Pro `HSR3263100192`, IP pública del terminal `190.119.170.73`. Antes de salir, anotar la clave de equipos para el paso 2:

```bash
grep DEVICE_API_KEY ~/mollendo/deploy/nube/.env
exit
```

**Paso 2. Controlador (PC).**

```bash
# En la PC
scp -i ~/.ssh/controlador_pc_key mollendo.tgz ma-admin@100.78.153.33:
ssh -i ~/.ssh/controlador_pc_key ma-admin@100.78.153.33

# En el Controlador (PC)
mkdir -p ~/mollendo && tar -xzf ~/mollendo.tgz -C ~/mollendo && rm ~/mollendo.tgz
bash ~/mollendo/deploy/controlador/instalar.sh
exit
```

Responder: servidor `https://accesos.monteazulsur.com.pe`, la clave de equipos del paso 1, copia de respaldos Enter (sin copia), y cuál lector es el de ingreso y cuál el de salida. Relés nuevos: ver [`../controlador`](../controlador/README.md).

**Paso 3. G4 Pro.** En el equipo, *Cloud Service Settings*: servidor `accesos.monteazulsur.com.pe`, puerto `3001`. En el portal, **Sistema y APIs** → **Sincronizar**.

**Paso 4. Comprobar.** Entrar a https://accesos.monteazulsur.com.pe con `admin@monteazulsur.com.pe` (contraseña inicial: `ADMIN_SEED_PASSWORD` del `.env` del servidor). En **Sistema y APIs**: servidor y base de datos "En línea"; Controlador (PC), lectores, relés y G4 Pro "Conectado". Cambiar las contraseñas iniciales (también la de `vigilancia@monteazulsur.com.pe`).

## Actualizar a una versión nueva

En la PC. Primero el servidor, después el Controlador (PC). Los datos, el `.env` y los respaldos no se tocan; el servidor saca antes un respaldo de la base y al final limpia el disco.

```bash
bash deploy/empaquetar.sh

scp -i ~/.ssh/id_ed25519 mollendo.tgz atenasac@74.163.89.6:
ssh -i ~/.ssh/id_ed25519 atenasac@74.163.89.6 'bash -s' < deploy/nube/actualizar.sh

scp -i ~/.ssh/controlador_pc_key mollendo.tgz ma-admin@100.78.153.33:
ssh -i ~/.ssh/controlador_pc_key ma-admin@100.78.153.33 'bash -s' < deploy/controlador/actualizar.sh
```

## Respaldos

El servidor saca solo un respaldo completo todos los días a las 04:00 (base, documentos y fotos) y guarda 30 días en `~/mollendo/deploy/nube/backups`; antes de cada actualización, uno de la base (`antes-de-actualizar-…`).

**Sacar uno en el momento** (en el servidor):

```bash
cd ~/mollendo/deploy/nube && sudo docker compose run --rm -T backup ahora
```

**Guardar una copia en la PC** (con el `.env`, que tiene las claves; guardarlo en un lugar seguro):

```bash
scp -i ~/.ssh/id_ed25519 "atenasac@74.163.89.6:~/mollendo/deploy/nube/backups/mollendo-*.tar.gz" .
scp -i ~/.ssh/id_ed25519 atenasac@74.163.89.6:~/mollendo/deploy/nube/.env env-servidor
```

**Recuperar un respaldo** (en el servidor; pide escribir `SI`, reemplaza los datos actuales y antes guarda lo que había en `antes-de-restaurar-…`):

```bash
ls ~/mollendo/deploy/nube/backups
bash ~/mollendo/deploy/nube/restaurar.sh mollendo-AAAAMMDD-HHMM.tar.gz
```

**Reinstalar el servidor con los datos de un respaldo** (si se perdió el servidor):

```bash
# En la PC
bash deploy/empaquetar.sh
scp -i ~/.ssh/id_ed25519 mollendo.tgz mollendo-AAAAMMDD-HHMM.tar.gz atenasac@74.163.89.6:
ssh -i ~/.ssh/id_ed25519 atenasac@74.163.89.6 'mkdir -p ~/mollendo/deploy/nube'
scp -i ~/.ssh/id_ed25519 env-servidor atenasac@74.163.89.6:~/mollendo/deploy/nube/.env
ssh -i ~/.ssh/id_ed25519 atenasac@74.163.89.6

# En el servidor
tar -xzf ~/mollendo.tgz -C ~/mollendo && rm ~/mollendo.tgz
bash ~/mollendo/deploy/nube/instalar.sh
bash ~/mollendo/deploy/nube/restaurar.sh ~/mollendo-AAAAMMDD-HHMM.tar.gz
```

Con el `.env` guardado se conservan las claves y el Controlador (PC) no necesita cambios. Sin él, `instalar.sh` crea claves nuevas: reinstalar también el Controlador (PC) con la clave de equipos nueva (paso 2).

**Copia automática en el Controlador (PC)** (opcional, no activada): cada día a las 05:00 trae los respaldos del servidor. Se activa respondiendo `atenasac@74.163.89.6` a la pregunta de copia de su instalador y, en el servidor, con la clave que muestra al terminar:

```bash
bash ~/mollendo/deploy/nube/autorizar-copia.sh "ssh-ed25519 AAAA… copia-respaldos"
```

## Servidor actual (Azure)

| Dato | Valor |
|---|---|
| Acceso | `ssh -i ~/.ssh/id_ed25519 atenasac@74.163.89.6` (`sudo` sin contraseña) |
| Portal | **https://accesos.monteazulsur.com.pe** (HTTPS con certificado de Let's Encrypt que el contenedor `caddy` saca y renueva solo; `http://` redirige a `https://`). El 3000 ya no se abre desde afuera |
| Equipos | Controlador (PC): `https://accesos.monteazulsur.com.pe`. G4 Pro: servidor `accesos.monteazulsur.com.pe` (o `74.163.89.6`), puerto `3001` (HTTP) |
| Máquina | Ubuntu 26.04, 4 CPU, 7,7 GB de memoria, 124 GB de disco, hora de Lima |
| Instalado | 16/10/2026, limpio (sin datos de prueba). Respaldos diarios a las 04:00, se guardan 30 días |

Las contraseñas iniciales quedaron en `~/mollendo/deploy/nube/.env` (`ADMIN_SEED_PASSWORD`, `VIGILANCIA_SEED_PASSWORD`): cambiarlas desde el portal después de entrar.

### HTTPS (dominio)

- El dominio `accesos.monteazulsur.com.pe` apunta a `74.163.89.6` (registro A en Cloudflare, en **"DNS only"**, nube gris: si se pasa a "Proxied", Caddy no puede renovar el certificado).
- `caddy` (ver `Caddyfile`) atiende 80 y 443: reenvía `/api/v1` a la API (con la IP real del usuario en `X-Forwarded-For`) y lo demás al portal. Certificado de Let's Encrypt desde el 16/10/2026, se renueva solo antes de vencer.
- En `.env`: `DOMINIO=accesos.monteazulsur.com.pe` y `CORS_ORIGIN=https://accesos.monteazulsur.com.pe`.
- El 3001 sigue abierto en HTTP para el G4 Pro (no está confirmado que este modelo funcione con HTTPS).

## Notas del `.env`

> No cambiar `DB_PASSWORD` después de instalar: la base la guarda al crearse.
>
> `G4PRO_SN_PERMITIDOS` es obligatoria: sin ella `docker compose` no arranca. El servidor solo atiende a esos terminales (las rutas del G4 Pro no llevan clave).
>
> `G4PRO_IPS_PERMITIDAS`: la IP pública de la sede (desde donde llega el G4 Pro; hoy `190.119.170.73`). Con ella, aunque alguien conozca el número de serie, no puede hacerse pasar por el equipo (pedir los datos del personal o abrir el molinete). Además, el puerto 3001 solo atiende al G4 Pro: el portal y el inicio de sesión van siempre por HTTPS.
>
> `ALCOHOLIMETRO_USB` **no va en el `.env`**: solo sirve para simular el alcoholímetro desconectado (`sudo ALCOHOLIMETRO_USB=ffff/0000 docker compose up -d --no-deps api`; volver con `sudo docker compose up -d --no-deps api`). Ver `docs/g4pro/Depuracion_y_Pruebas_G4Pro.md`, sección 8.
>
> **El G4 dejó de conectarse** (Sistema y APIs lo muestra desconectado) y en `sudo docker compose logs api | grep "Terminal rechazado"` dice "la IP no está en G4PRO_IPS_PERMITIDAS": la sede cambió de IP. Poner la nueva (la que figura en ese mensaje) en `.env` y `sudo docker compose up -d api`. Para salir del paso, dejarla vacía. Swagger (`/api/docs`) queda apagado; para verlo un momento, `SWAGGER=true` en `.env` y `sudo docker compose up -d`.

## Verificar

```bash
cd ~/mollendo/deploy/nube
sudo docker compose ps                        # api, portal, caddy, backup "Up" y db "healthy"
curl -s http://localhost:3001/api/v1/health   # {"status":"ok","database":"up",...}
ls backups                                    # respaldo diario a las 04:00
```

En el portal, **Sistema y APIs**: backend y base de datos "En línea"; Controlador (PC) y G4 Pro "Conectado" cuando el punto de acceso está en línea.

## Si algo falla

| Síntoma | Qué hacer |
|---|---|
| El portal no abre desde afuera | `curl -I http://localhost:3000` en el servidor; si responde, revisar las reglas de entrada del grupo de seguridad de red en Azure |
| `api` se reinicia y el log dice "Authentication failed" | Se cambió `DB_PASSWORD`: volver a la original y `sudo docker compose up -d` |
| Se cambió el `.env` y no toma efecto | `sudo docker compose up -d` (recrea los contenedores con el `.env` nuevo) |
| `instalar.sh` o `actualizar.sh`: "La API no respondió en 5 minutos" | `cd ~/mollendo/deploy/nube && sudo docker compose logs --tail 50 api` muestra el error |
| El portal no abre con https (error de certificado) | El dominio no apunta a este servidor o los puertos 80 y 443 están cerrados: revisar Cloudflare ("DNS only") y Azure; luego `sudo docker compose restart caddy` |
| Disco lleno | `df -h /`; liberar con `sudo docker image prune -af && sudo docker builder prune -f` (`actualizar.sh` ya lo hace en cada versión) |
| Ver qué pasa | `sudo docker compose logs -f api` |

Enlace público temporal (`muestra`) y más: [guía, secciones 6 a 8](../../docs/despliegue/Guia_Despliegue_y_Operacion.md). Qué es cada variable: [`.env.example`](.env.example) y anexo B de la guía.
