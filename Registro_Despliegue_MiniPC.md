# Guía de despliegue en la mini PC

Proyecto: Sistema de Control de Accesos · Terminal Monte Azul Mollendo (TMAM) · Alcance base
Última actualización: 28/09/2026

Esta guía explica, paso a paso, cómo desplegar el sistema (portal web, backend y base de datos) en la mini PC, cómo actualizarlo y cómo operarlo. Está pensada para que la siga cualquier persona con acceso al servidor, aunque no haya participado en el desarrollo. Al final (anexo A) está el registro del primer despliegue.

> **Esta guía no incluye contraseñas ni claves, porque se versiona en git.** Están solo en el servidor, en `~/mollendo/.env`; quien tenga acceso SSH puede verlas con `cat ~/mollendo/.env`. Para desplegar o actualizar no hace falta conocerlas.

---

## Contenido

1. [Cómo está armado](#1-cómo-está-armado)
2. [Requisitos](#2-requisitos)
3. [Primer despliegue (servidor nuevo)](#3-primer-despliegue-servidor-nuevo)
4. [Verificar que funciona](#4-verificar-que-funciona)
5. [Actualizar a una versión nueva](#5-actualizar-a-una-versión-nueva)
6. [Operación del día a día](#6-operación-del-día-a-día)
7. [Respaldos](#7-respaldos)
8. [Solución de problemas](#8-solución-de-problemas)
8b. [Datos de demostración](#8b-datos-de-demostración)
8c. [Lectores de DNI](#8c-lectores-de-dni)
8d. [Relés de los molinetes](#8d-relés-de-los-molinetes)
8e. [Terminal facial G4 Pro](#8e-terminal-facial-g4-pro)
9. [Seguridad y recomendaciones](#9-seguridad-y-recomendaciones)
- [Anexo A. Registro del primer despliegue (28/09/2026)](#anexo-a-registro-del-primer-despliegue-28092026)
- [Anexo B. Variables del archivo .env](#anexo-b-variables-del-archivo-env)

---

## 1. Cómo está armado

Todo corre en **contenedores de Docker**. En el sistema operativo solo se instala Docker: nada de Node.js, PostgreSQL ni otros programas directo en el servidor.

| Contenedor | Qué hace | Puerto publicado |
|---|---|---|
| `db` | Base de datos PostgreSQL 16. Los datos están en el volumen `mollendo_db_data` | ninguno (solo red interna) |
| `api` | Backend (NestJS). Al arrancar aplica las migraciones pendientes de la base de datos | `3001`: equipos físicos y Swagger |
| `portal` | Portal web (Next.js). Reenvía al backend las llamadas a la API y el tiempo real | `3000`: el que se abre en el navegador |
| `backup` | Respaldo diario de la base de datos en `~/mollendo/backups`. Guarda 14 días | ninguno |

```
                 Navegador (administrador / vigilante)
                              │  http://<IP de la mini PC>:3000
                              ▼
┌──────────────────────── mini PC (Docker) ────────────────────────┐
│                                                                   │
│   ┌──────────┐  /api/v1, /api/docs,   ┌──────────┐     ┌──────┐   │
│   │  portal  │ ─────────────────────► │   api    │ ──► │  db  │   │
│   │  :3000   │  tiempo real (socket)  │  :3001   │     │:5432 │   │
│   └──────────┘                        └────┬─────┘     └──┬───┘   │
│                                            │              │       │
│                              volumen documentos     ┌─────┴────┐  │
│                              (archivos y fotos)     │  backup  │  │
│                                                     └──────────┘  │
└───────────────────────────────────────────────────────────────────┘
        ▲ :3001 (con la clave X-API-Key)
        │
   Equipos físicos (cuando se integren)
```

- Los documentos y fotos subidos se guardan en el volumen `mollendo_documentos`.
- Si un contenedor se cae, se reinicia solo. Al encender la mini PC, todo arranca solo.
- Los contenedores usan la hora de Lima.

**Archivos del proyecto que intervienen:**

| Archivo | Para qué sirve |
|---|---|
| `docker-compose.prod.yml` | Define los 4 contenedores, los volúmenes y los puertos |
| `deploy.env.example` | Plantilla del archivo `.env` con las claves |
| `mollendo-api/Dockerfile` | Cómo se construye la imagen del backend |
| `mollendo-portal/Dockerfile` | Cómo se construye la imagen del portal |
| `mollendo-api/.dockerignore`, `mollendo-portal/.dockerignore` | Qué no se copia a las imágenes (`node_modules`, `.env`, compilados, archivos subidos) |

---

## 2. Requisitos

### 2.1. El servidor (mini PC)

| Requisito | Valor actual |
|---|---|
| Sistema | Ubuntu Server (probado con Ubuntu 26.04 LTS) |
| Memoria / disco | Mínimo 4 GB de RAM y 20 GB libres (tiene 6,8 GB y 98 GB) |
| Usuario | Uno con permisos de `sudo` (hoy: `ma-admin`) |
| Acceso | SSH (puerto 22) |
| Internet | Necesario al construir las imágenes (descarga Docker, imágenes base y dependencias) |
| Puertos libres | `3000` y `3001` |

Direcciones actuales:
- **Tailscale:** `100.78.153.33` (sirve desde cualquier lugar con Tailscale activo)
- **Red local:** `192.168.0.165` (Wi-Fi; puede cambiar si el router la reasigna, ver sección 9)

### 2.2. La PC desde donde se despliega

- **Git** (para empaquetar el código).
- **Cliente SSH** (`ssh` y `scp`). Windows 10/11 ya los trae: se usan desde PowerShell o desde Git Bash.
- Acceso de red al servidor (misma red local o Tailscale conectado).
- El proyecto clonado, con los cambios a desplegar **ya confirmados con commit** (el paquete se arma desde el último commit).

### 2.3. Datos que necesitas

- Usuario y contraseña SSH del servidor.
- Para un primer despliegue: nada más (las claves se generan en el servidor).
- Para una actualización: nada más (las claves ya están en `~/mollendo/.env`).

---

## 3. Primer despliegue (servidor nuevo)

Solo se hace una vez. Si el sistema ya está desplegado, ve a la [sección 5](#5-actualizar-a-una-versión-nueva).

Los comandos que empiezan en **la PC** se ejecutan en tu computadora; los que empiezan en **el servidor**, dentro de la sesión SSH.

### Paso 1. Conectarse al servidor

En la PC (PowerShell o Git Bash):

```bash
ssh ma-admin@100.78.153.33
```

La primera vez pregunta si confías en el servidor. Comprueba que la huella sea esta y responde `yes`:

```
ED25519 key fingerprint is SHA256:7E0UUb8X7/RlEWjbISN3pl3P5GW23mxXKQVhB2GaWDg
```

Luego escribe la contraseña del usuario (no se ve mientras la escribes).

### Paso 2. Instalar Docker

En el servidor. Es la **única** instalación que se hace en el sistema:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 docker-buildx
sudo systemctl enable --now docker
```

Comprueba:

```bash
docker --version            # Docker version 29.x
docker compose version      # Docker Compose version 2.x
systemctl is-active docker  # active
```

### Paso 3. Zona horaria del servidor

En el servidor (los contenedores ya usan la hora de Lima; esto es para que los respaldos y los logs del sistema también la usen):

```bash
sudo timedatectl set-timezone America/Lima
timedatectl | grep "Time zone"   # Time zone: America/Lima
```

### Paso 4. Crear la carpeta del sistema

En el servidor:

```bash
mkdir -p ~/mollendo/backups
```

### Paso 5. Empaquetar el código

En la PC, en la carpeta raíz del proyecto (donde está `docker-compose.prod.yml`). Asegúrate de que todo lo que quieres desplegar tenga commit:

```bash
git status          # no debe haber cambios pendientes que quieras desplegar
git archive --format=tar.gz -o mollendo.tgz HEAD mollendo-api mollendo-portal deploy docker-compose.prod.yml deploy.env.example
```

Esto crea `mollendo.tgz` (unos 10 MB) con el código del último commit. No incluye `node_modules`, `.env` ni archivos subidos, porque no están en git.

### Paso 6. Copiar el código al servidor

En la PC:

```bash
scp mollendo.tgz ma-admin@100.78.153.33:mollendo/
```

En el servidor:

```bash
cd ~/mollendo
tar -xzf mollendo.tgz
rm mollendo.tgz
ls        # backups  deploy.env.example  docker-compose.prod.yml  mollendo-api  mollendo-portal
```

### Paso 7. Crear el archivo de claves (.env)

En el servidor. Este archivo **nunca** se sube a git ni se copia a otro lado.

1. Genera las claves y crea el archivo de una vez (copia y pega el bloque completo):

   ```bash
   cd ~/mollendo
   cat > .env <<EOF
   DB_PASSWORD=$(openssl rand -hex 24)
   JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
   JWT_REFRESH_SECRET=$(openssl rand -base64 48 | tr -d '\n')
   DEVICE_API_KEY=$(openssl rand -hex 32)
   CORS_ORIGIN=http://100.78.153.33:3000,http://192.168.0.165:3000,http://localhost:3000
   ADMIN_SEED_PASSWORD=$(openssl rand -base64 12 | tr -dc 'A-Za-z0-9')Aa1
   VIGILANCIA_SEED_PASSWORD=$(openssl rand -base64 12 | tr -dc 'A-Za-z0-9')Aa1
   EOF
   chmod 600 .env
   ```

2. Revisa el contenido y **anota las dos contraseñas iniciales** (`ADMIN_SEED_PASSWORD` y `VIGILANCIA_SEED_PASSWORD`), las vas a necesitar para entrar al portal:

   ```bash
   cat .env
   ```

3. Si las IPs del servidor son otras, corrige `CORS_ORIGIN` con `nano .env` (guardar: `Ctrl+O`, `Enter`; salir: `Ctrl+X`).

El detalle de cada variable está en el [anexo B](#anexo-b-variables-del-archivo-env).

> **No cambies `DB_PASSWORD` después del primer arranque.** PostgreSQL la guarda al crear la base; si la cambias en `.env`, el backend ya no podrá conectarse (ver [sección 8](#8-solución-de-problemas)).

### Paso 8. Construir las imágenes

En el servidor (tarda varios minutos la primera vez, porque descarga las imágenes base y las dependencias):

```bash
cd ~/mollendo
sudo docker compose -f docker-compose.prod.yml build
```

Al final debe decir `mollendo-api  Built` y `mollendo-portal  Built`.

### Paso 9. Levantar los contenedores

```bash
sudo docker compose -f docker-compose.prod.yml up -d
```

Espera unos 30 segundos y revisa que el backend haya aplicado las migraciones:

```bash
sudo docker compose -f docker-compose.prod.yml logs api | grep -E "migrations|successfully started"
```

Debe mostrar:

```
All migrations have been successfully applied.
Nest application successfully started
```

### Paso 10. Crear las cuentas iniciales

Solo la primera vez. Crea la empresa interna (OTP/MAS), la cuenta del administrador y la de vigilancia, con las contraseñas del `.env`:

```bash
sudo docker compose -f docker-compose.prod.yml run --rm -T api npm run db:seed
```

Debe terminar con:

```
Cuentas listas:
  Administrador:  admin@mollendo.local / (definida en .env)
  Vigilancia:     vigilancia@mollendo.local / (definida en .env)
```

La base queda **sin personal ni documentos**: el administrador los carga desde el portal.

### Paso 11. Borrar el paquete en la PC

En la PC:

```bash
rm mollendo.tgz
```

Sigue con la verificación.

---

## 4. Verificar que funciona

### 4.1. En el servidor

```bash
cd ~/mollendo
sudo docker compose -f docker-compose.prod.yml ps
```

Los cuatro deben estar `Up` y `db` además `(healthy)`:

```
SERVICE   STATUS                   PORTS
api       Up ...                   0.0.0.0:3001->3001/tcp
backup    Up ...
db        Up ... (healthy)
portal    Up ...                   0.0.0.0:3000->3000/tcp
```

```bash
curl -s http://localhost:3001/api/v1/health
# {"status":"ok","database":"up",...}

ls backups
# mollendo-AAAAMMDD-HHMM.sql.gz   (el primer respaldo se hace al arrancar)
```

### 4.2. En el navegador

| Qué abrir | Qué debe pasar |
|---|---|
| `http://100.78.153.33:3000` (o `http://192.168.0.165:3000` en la red local) | Aparece "Iniciar sesión" |
| Entrar con `admin@mollendo.local` y la contraseña inicial | Entra a "Personal y documentos" |
| Menú **Sistema y APIs** | Backend y base de datos "En línea"; clave de equipos "Configurado" |
| Botón de Swagger en Sistema y APIs (o `http://100.78.153.33:3000/api/docs`) | Abre la documentación de la API |
| Menú **Panel de vigilancia** | Carga sin errores; sin el aviso "El servidor no responde" |
| Menú **Dashboard** | Muestra los indicadores y los gráficos del día (vacíos si todavía no hay ingresos) |
| Menú **Reportes** → "Personal y empresas" → **Descargar Excel** y **Descargar PDF** | Se descargan los dos archivos con el personal registrado |

### 4.3. Después de verificar

1. **Cambia las dos contraseñas iniciales** desde el portal: clic en el usuario (arriba a la derecha) → "Cambiar contraseña". Haz lo mismo entrando con la cuenta de vigilancia.
2. Opcional: borra las contraseñas iniciales del `.env` (`ADMIN_SEED_PASSWORD` y `VIGILANCIA_SEED_PASSWORD`); ya no se usan.

---

## 5. Actualizar a una versión nueva

Para desplegar cambios nuevos del sistema. Los datos (personal, documentos, eventos) **no se pierden**: están en los volúmenes, que no se tocan.

1. **En la PC**, con los cambios ya confirmados con commit, arma el paquete (sin `deploy.env.example`: el `.env` del servidor ya existe):

   ```bash
   git archive --format=tar.gz -o mollendo.tgz HEAD mollendo-api mollendo-portal deploy docker-compose.prod.yml
   scp mollendo.tgz ma-admin@100.78.153.33:mollendo/
   ```

2. **En el servidor**, saca un respaldo antes de actualizar (por si algo sale mal):

   ```bash
   cd ~/mollendo
   sudo docker compose -f docker-compose.prod.yml exec -T db pg_dump -U mollendo mollendo_control_acceso | gzip > backups/antes-de-actualizar-$(date +%Y%m%d-%H%M).sql.gz
   ```

3. **En el servidor**, reemplaza el código. Se borran las carpetas viejas para que no queden archivos que ya no existen en la versión nueva (`.env`, `backups` y los volúmenes no se tocan):

   ```bash
   rm -rf mollendo-api mollendo-portal deploy
   tar -xzf mollendo.tgz && rm mollendo.tgz
   ```

4. **En el servidor**, reconstruye y levanta:

   ```bash
   sudo docker compose -f docker-compose.prod.yml up -d --build
   ```

   Si la versión nueva trae migraciones de base de datos, el backend las aplica solo al arrancar. Revisa:

   ```bash
   sudo docker compose -f docker-compose.prod.yml logs api | grep -E "migrations|successfully started|Error"
   ```

5. Verifica como en la [sección 4](#4-verificar-que-funciona). Mientras se reconstruye, el portal deja de responder unos segundos.

6. **En la PC**: `rm mollendo.tgz`.

**Si la actualización falla**, vuelve a la versión anterior repitiendo estos pasos con el commit anterior (`git archive ... <commit-anterior> ...`). Si una migración dañó datos, restaura el respaldo del paso 2 ([sección 7.3](#73-restaurar-un-respaldo)).

---

## 6. Operación del día a día

Todos los comandos se ejecutan en el servidor, dentro de `~/mollendo`. Para no repetir el nombre del archivo, puedes definir un atajo en la sesión:

```bash
cd ~/mollendo
alias dc='sudo docker compose -f docker-compose.prod.yml'
```

| Para… | Comando |
|---|---|
| Ver el estado de los contenedores | `dc ps` |
| Ver el log del backend en vivo (salir con `Ctrl+C`) | `dc logs -f api` |
| Ver el log del portal | `dc logs --tail 100 portal` |
| Reiniciar todo | `dc restart` |
| Reiniciar solo el backend | `dc restart api` |
| Detener todo (el portal deja de funcionar) | `dc stop` |
| Volver a arrancar | `dc up -d` |
| Uso de disco de Docker | `sudo docker system df` |
| Entrar a la base de datos (consola SQL; salir con `\q`) | `dc exec db psql -U mollendo -d mollendo_control_acceso` |

> **Nunca uses `docker compose down -v`**: la opción `-v` borra los volúmenes, es decir, **toda la base de datos y los documentos subidos**. `dc down` (sin `-v`) sí es seguro: detiene y elimina los contenedores, pero no los datos.

### Restablecer una contraseña olvidada

Si alguien olvidó su contraseña y no puede entrar (no hay recuperación por correo). Reemplaza `NuevaClave2026` y el correo:

```bash
cd ~/mollendo
H=$(sudo docker compose -f docker-compose.prod.yml exec -T api node -e "require('bcryptjs').hash(process.argv[1], 10).then(console.log)" 'NuevaClave2026' </dev/null)
echo "UPDATE usuario SET password_hash = :'h', password_cambiado_en = now() WHERE correo = 'admin@mollendo.local';" \
  | sudo docker compose -f docker-compose.prod.yml exec -T db psql -U mollendo -d mollendo_control_acceso -v h="$H"
```

Debe responder `UPDATE 1`. La persona entra con la contraseña nueva y conviene que la cambie desde el portal. Las sesiones que tenía abiertas se cierran.

---

## 7. Respaldos

### 7.1. Respaldo automático

El contenedor `backup` (script `deploy/respaldo.sh`) hace **un respaldo completo por día a las 00:00** (hora de Lima) en `~/mollendo/backups/mollendo-AAAAMMDD-HHMM.tar.gz`. Cada paquete contiene:

| Dentro del paquete | Qué es |
|---|---|
| `base-de-datos.sql` | Copia completa de la base de datos: personal, empresas, documentos registrados, eventos, auditoría, usuarios |
| `archivos/` | Los archivos subidos: documentos (PDF, imágenes, Word) y fotos del personal |

- Al arrancar el contenedor (por ejemplo, después de un corte de luz), si no hay un respaldo de las últimas 24 horas, hace uno en ese momento.
- Después de cada respaldo, borra los diarios de más de **14 días** y los previos a actualizaciones (`antes-de-actualizar-*`) de más de 14 días, conservando siempre el más reciente.
- La hora se cambia con `HORA_RESPALDO=HH:MM` en el `.env` (y `dc up -d backup`).
- **Sistema y APIs** muestra la fecha y el tamaño del último respaldo automático, en rojo ("Atrasado") si tiene más de 26 horas.

```bash
ls -lh ~/mollendo/backups
sudo docker compose -f docker-compose.prod.yml logs backup | tail   # "Respaldo mollendo-... (tamaño)"
```

Los respaldos anteriores a este cambio (28/09/2026) son `.sql.gz` y solo tienen la base de datos.

### 7.2. Respaldo manual

Solo la base de datos (rápido; es el que se saca antes de cada actualización):

```bash
cd ~/mollendo
sudo docker compose -f docker-compose.prod.yml exec -T db pg_dump -U mollendo mollendo_control_acceso | gzip > backups/antes-de-actualizar-$(date +%Y%m%d-%H%M).sql.gz
```

Completo (base de datos y archivos), igual al automático, en el momento:

```bash
cd ~/mollendo
sudo docker compose -f docker-compose.prod.yml run --rm -T backup ahora
```

### 7.3. Restaurar un respaldo

Restaurar **reemplaza** los datos actuales. Hazlo solo si es necesario y, antes, saca un respaldo manual de lo que hay (7.2). Reemplaza `mollendo-AAAAMMDD-HHMM.tar.gz` por el archivo que quieres restaurar.

```bash
cd ~/mollendo
alias dc='sudo docker compose -f docker-compose.prod.yml'
R=mollendo-AAAAMMDD-HHMM.tar.gz

# 1. Descomprimir en una carpeta temporal
mkdir -p /tmp/restaurar && tar -xzf backups/$R -C /tmp/restaurar

# 2. Base de datos (nadie escribe mientras se restaura)
dc stop api portal
dc exec -T db dropdb -U mollendo mollendo_control_acceso
dc exec -T db createdb -U mollendo mollendo_control_acceso
dc exec -T db psql -q -U mollendo -d mollendo_control_acceso < /tmp/restaurar/base-de-datos.sql

# 3. Archivos (documentos y fotos)
sudo docker run --rm -v mollendo_documentos:/datos -v /tmp/restaurar/archivos:/respaldo:ro alpine \
  sh -c 'rm -rf /datos/* && cp -a /respaldo/. /datos/'

# 4. Volver a arrancar y limpiar
dc start api portal
rm -rf /tmp/restaurar
```

Para un respaldo `.sql.gz` (solo base de datos), el paso 2 es `gunzip -c backups/ARCHIVO.sql.gz | dc exec -T db psql -q -U mollendo -d mollendo_control_acceso` y no hay paso 3. Luego verifica como en la sección 4.

### 7.4. Copiar los respaldos fuera de la mini PC

Los respaldos quedan en el mismo disco que la base de datos: si el disco falla, se pierden los dos. Cópialos con regularidad a otra computadora o a un disco externo. Desde la PC:

```bash
scp -r ma-admin@100.78.153.33:mollendo/backups ./respaldos-mollendo
```

---

## 8. Solución de problemas

Primero mira siempre el estado y el log: `dc ps` y `dc logs --tail 100 api`.

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| El navegador no abre `http://<IP>:3000` | El contenedor `portal` no está arriba, o no hay conexión con el servidor | `dc ps`; si no está `Up`, `dc up -d`. Prueba en el servidor `curl -I http://localhost:3000`. Si responde, el problema es de red (Tailscale desconectado, otra red, IP cambiada). |
| El portal abre pero dice que no puede contactar al backend | `api` detenido o reiniciándose | `dc ps` y `dc logs --tail 100 api`. |
| `api` se reinicia una y otra vez; el log dice `P1000` o "Authentication failed" | Se cambió `DB_PASSWORD` en `.env` después de crear la base | Vuelve a poner la contraseña original en `.env` y `dc up -d`. |
| El log de `api` muestra un error de migración | Una migración nueva falló | No borres nada. Restaura el respaldo previo a la actualización (7.3) y vuelve a la versión anterior (sección 5). Revisa la migración en la PC de desarrollo. |
| `build` falla en `npm ci` con "package.json and package-lock.json are not in sync" | El `package-lock.json` no corresponde al `package.json` | En la PC: `npm install` en `mollendo-api` o `mollendo-portal`, confirma el `package-lock.json` con commit y vuelve a empaquetar. Los Dockerfile usan npm 12.0.2, la misma versión con la que se generó el lockfile. |
| `build` falla por falta de conexión | El servidor no tiene internet | Construir necesita internet. Revisa la red del servidor (`curl -I https://registry.npmjs.org`). |
| "port is already allocated" al levantar | Otro programa usa el puerto 3000 o 3001 | `sudo ss -tlnp \| grep -E ':3000\|:3001'` para ver cuál. |
| El Panel de vigilancia no muestra eventos en vivo | La conexión de tiempo real no llega al backend | Revisa que `api` esté arriba. Recarga la página con `Ctrl+F5`. |
| Un comando `dc run ...` dentro de un script "se come" las líneas siguientes | `docker compose run` lee la entrada estándar | Usa `run -T` (como en esta guía) o agrega `</dev/null`. |
| El disco se llena | Imágenes viejas de actualizaciones anteriores | `sudo docker image prune -f` (borra solo imágenes sin uso; no toca datos). |
| Nadie puede entrar al portal | Contraseña olvidada | [Restablecer una contraseña](#restablecer-una-contraseña-olvidada). |

---

## 8b. Datos de demostración

Para mostrar el sistema funcionando sin datos reales, se puede cargar un conjunto de demostración: **6 empresas, 56 personas** (con foto y documentos; algunas con documentos vencidos o por vencer, 3 de baja y 1 sin documentos) y **los ingresos y salidas de hoy** (unos 65). Todo es identificable y se borra sin tocar datos reales:

- empresas con RUC `2099999990x` y razón social que empieza con "DEMO";
- personas con número de documento que empieza con `99`;
- eventos con el molinete "DEMO".

**Cargar** (desde la PC, en `mollendo-api`, con el servidor accesible):

```bash
API_URL=http://100.78.153.33:3000/api/v1 \
ADMIN_PASSWORD='<contraseña del administrador>' \
DEVICE_API_KEY='<DEVICE_API_KEY del .env del servidor>' \
npx tsx prisma/datos-demo.ts
```

Sin `DEVICE_API_KEY` carga empresas y personas, pero no los ingresos y salidas. Si ya hay datos DEMO, no hace nada.

**Historial de 30 días (opcional, para el Dashboard):** `prisma/historial-demo.ts` agrega los ingresos y salidas de los últimos 30 días del personal DEMO (unos 2 250 eventos, con las mismas reglas del molinete y doce personas que se quedan dentro más de 24 horas). Como la API registra cada evento con la hora actual, este script escribe directo en la base de datos: necesita `DATABASE_URL` hacia la base, así que se usa en una PC de desarrollo (en `mollendo-api`: `npx tsx prisma/historial-demo.ts`). Sus eventos también llevan el molinete "DEMO" y se borran con el mismo procedimiento.

**Carga masiva (opcional, para probar con volumen):** `prisma/carga-masiva-demo.ts` agrega 480 personas DEMO más (números `995xxxxx`, repartidas en las empresas DEMO; `CANTIDAD=` para otra cantidad y `PREFIJO=996`, `997`… para sumar otra tanda sin borrar la anterior: `docker compose -f docker-compose.prod.yml exec -T -e PREFIJO=996 -e CANTIDAD=1500 api npx tsx prisma/carga-masiva-demo.ts`) con sus documentos (algunas de baja, sin documentos, con documentos vencidos o por vencer) y sus ingresos y salidas de los últimos 30 días y de hoy. Escribe directo en la base de datos, **sin pasar por la API**: no registra a nadie en el G4 Pro. Sin fotos y con documentos sin archivo. Se corre dentro del contenedor de la API (en `~/mollendo`):

```bash
docker compose -f docker-compose.prod.yml cp mollendo-api/prisma/carga-masiva-demo.ts api:/app/prisma/
docker compose -f docker-compose.prod.yml exec -T api npx tsx prisma/carga-masiva-demo.ts
```

Se borra con el mismo `limpiar-demo.sh` (son personas de las empresas DEMO y eventos del molinete "DEMO").

**Movimientos hasta hoy (opcional):** `prisma/movimientos-demo.ts` completa los ingresos y salidas del personal DEMO desde el último día con movimientos DEMO hasta hoy, a la hora actual (salta los días en que la persona ya tiene movimientos) y registra la salida de hoy de una parte de quienes entraron hace más de una hora (`SALIDAS_HOY=0.35` por defecto), para tener datos del día en el Dashboard y el Panel.

**Archivo de los documentos de la carga masiva (opcional):** esos documentos se crean sin archivo ("Ver" dice "El archivo del documento no está disponible"). `prisma/archivos-demo.ts` les asigna un PDF de una página ("Documento de prueba"): se guarda una vez (`demo-documento-prueba.pdf`, 753 bytes) y cada documento recibe un enlace duro en la carpeta de su persona, así ocupa lo de un archivo y borrar o reemplazar un documento no afecta a los demás. Solo toca documentos de empresas DEMO sin archivo. Se copia y se corre igual que los otros scripts DEMO. Se copia y se corre igual que la carga masiva (`... cp mollendo-api/prisma/movimientos-demo.ts api:/app/prisma/` y `... exec -T api npx tsx prisma/movimientos-demo.ts`); no pasa por la API ni por el G4 Pro. **No sincronizar el G4 Pro mientras estén cargadas**: registraría a ~480 personas DEMO en el equipo.

**En un servidor con un G4 Pro real (por ejemplo AWS):** no cargues fotos ni ingresos por la API. Cada foto se registra en el equipo y cada ingreso por DNI queda pendiente de verificación, así que el siguiente rostro real se le asignaría a una persona DEMO. Para cargar los datos de prueba sin tocar el equipo:

1. Personas y documentos sin fotos ni eventos: `SIN_FOTOS=1` y sin `DEVICE_API_KEY`.
2. Historial con el día de hoy hasta la hora actual, escrito directo en la base: `INCLUIR_HOY=1`. Con un túnel SSH (`ssh -L 13001:localhost:3001 -L 15432:<IP del contenedor db>:5432 …`) se usa `API_URL=http://localhost:13001/api/v1` y `DATABASE_URL=postgresql://mollendo:<DB_PASSWORD>@localhost:15432/mollendo_control_acceso`.

**Borrar** (en el servidor, dentro de `~/mollendo`): borra las empresas, personas, documentos, fotos, eventos y auditoría DEMO, y los tipos de documento que queden sin uso.

```bash
sudo sh mollendo-api/prisma/limpiar-demo.sh
```

> Antes de empezar a usar el sistema con datos reales, **borra los datos de demostración**.

### Enlace público temporal (para una muestra)

Para que cualquiera pueda ver el portal desde internet, sin Tailscale ni estar en la red local, hay un contenedor opcional `muestra` (túnel rápido de Cloudflare, sin cuenta). Está **apagado por defecto** y no afecta a los demás contenedores. En el servidor, dentro de `~/mollendo`:

```bash
# Encender
sudo docker compose -f docker-compose.prod.yml --profile muestra up -d muestra
# Ver el enlace (https://….trycloudflare.com)
sudo docker compose -f docker-compose.prod.yml logs muestra | grep trycloudflare
# Apagar (el enlace deja de funcionar)
sudo docker compose -f docker-compose.prod.yml --profile muestra rm -sf muestra
```

- El enlace **cambia cada vez** que se enciende.
- Cualquiera con el enlace llega a la pantalla de inicio de sesión (y a Swagger en `/api/docs`). Para entrar necesita usuario y contraseña: **no compartas las contraseñas reales**; para una muestra, usa datos de demostración y cambia las contraseñas después.
- Apágalo cuando termine la muestra.

---

## 8c. Lectores de DNI

Los lectores **Syble XB-7705H** leen el **código de barras del reverso del DNI** y envían el número seguido de un salto de línea (`48058719` + CR LF). Se conectan a la mini PC por **RS232**: el cable del lector tiene un conector DB9, que va a un **adaptador USB-serial** (ATEN), y una punta USB que solo da energía.

### Configurar el lector (una vez)

El lector viene de fábrica en modo USB (teclado): así pita al leer, pero no envía nada por RS232. Se configura mostrándole los códigos del **folleto que viene en la caja** ("2D Barcode Scanner User Manual"), tapando los de al lado:

1. **Factory Default** (columna "Basic Configuration").
2. **RS232** (sección "Interface").
3. **115200** (sección "Baud Rate"). Es la velocidad que espera el sistema.
4. Desenchufar la punta USB de energía, esperar 5 s y volver a enchufarla.

### Configurar el servidor

En `~/mollendo/.env`, la ruta fija del adaptador (no cambia aunque se conecten otros USB). Se ve con `ls /dev/serial/by-id/`:

```bash
LECTOR_DNI_INGRESO_DISPOSITIVO=/dev/serial/by-id/usb-Prolific_Technology_Inc._USB-Serial_Controller_FQCLb114J19-if00-port0
# LECTOR_DNI_SALIDA_DISPOSITIVO=/dev/serial/by-id/...   (el segundo lector, con su propio adaptador)
# LECTOR_DNI_BAUDIOS=115200                              (por defecto)
```

Después: `sudo docker compose -f docker-compose.prod.yml up -d`. Sin estas variables, el sistema no abre ningún puerto (así funciona en un servidor sin lectores, como AWS).

Cómo accede el contenedor: ve el `/dev` del servidor en solo lectura (`/dev-servidor`) y solo tiene permiso para puertos serie USB (`device_cgroup_rules`: ttyUSB y ttyACM). Busca el lector por su ruta fija cada vez que reintenta, así se recupera solo aunque al desconectar y volver a conectar el adaptador Linux le cambie el número (`ttyUSB0` ↔ `ttyUSB1`).

### Comprobar

- En el registro del backend: `Lector de DNI de ingreso conectado en /dev/lector-dni-ingreso (115200 baudios)`, y por cada lectura `DNI leído en ingreso: …`.
- En **Sistema y APIs**: el lector "Cable conectado" con la hora de su última lectura. Indica el cable de datos (adaptador blanco), no la energía del lector: con el cable negro desconectado sigue diciendo "Cable conectado", porque el lector no envía nada hasta que lee un DNI. **Si el lector no pita al pasar un DNI, revisar su alimentación (cable negro).**
- En el **Panel de vigilancia**: cada DNI aparece al instante (un DNI no registrado, como "No registrado").

Si se desconecta el adaptador, el sistema reintenta cada 5 s y se reconecta solo al volver a conectarlo (probado: 30 s después de reconectarlo, con el adaptador pasando de `ttyUSB1` a `ttyUSB0`).

### Qué identifica a cada lector

El sistema reconoce cada lector por el **número de serie de su adaptador USB-serial** (el blanco), no por el puerto USB de la mini PC donde se enchufe:

| Adaptador (número de serie) | Lector |
|---|---|
| `FQCLb114J19` | **Ingreso** |
| `A_BCb14C705` | **Salida** |

**En simple:** el sistema no reconoce al lector, reconoce **el cable blanco** (adaptador) al que está conectado. Cada cable blanco trae de fábrica un número único, como la placa de un auto, y en `.env` quedó anotado qué número es ingreso y cuál salida. Cuando alguien pasa el DNI:

1. el lector envía el número por su cable blanco;
2. la mini PC ve **por cuál cable llegó**;
3. según el cable, lo registra como **ingreso** o como **salida**.

A diferencia de los relés (que venían todos con la misma serie y hubo que cambiársela), los cables blancos ya vienen con números distintos: no hay que configurar nada para distinguirlos.

- Los adaptadores se pueden conectar **en cualquier puerto USB** de la mini PC: el sistema los encuentra igual (también si Linux les cambia el número, `ttyUSB0`, `ttyUSB1`…).
- Lo que importa es que **cada lector siga conectado a su propio adaptador**. Si se intercambian los adaptadores entre los lectores, el de ingreso pasaría a registrar salidas y al revés.
- **Etiquetar cada adaptador** ("INGRESO" / "SALIDA") para que no se crucen al reinstalar.
- Si se **reemplaza un adaptador** por uno nuevo, hay que poner su ruta en `.env` (`LECTOR_DNI_INGRESO_DISPOSITIVO` o `LECTOR_DNI_SALIDA_DISPOSITIVO`, ver `ls /dev/serial/by-id/`) y ejecutar `sudo docker compose -f docker-compose.prod.yml up -d`.
- La punta **negra** (energía) puede ir en cualquier USB: solo alimenta al lector.

### Carné de extranjería y pasaporte (pendiente)

Hoy los lectores **solo reconocen el DNI** (código de barras del reverso: 8 dígitos). El resto del sistema ya acepta otros documentos: el portal los registra y el G4 Pro acepta números de usuario con letras (hasta 24 caracteres, probado el 05/oct/2026).

- **Carné de extranjería:** no se pudo probar porque no se tenía uno. Cuando haya uno:
  1. Pasarlo por el lector de ingreso o de salida.
  2. Si el lector pita, ver lo que envió en el registro del backend: `sudo docker compose -f docker-compose.prod.yml logs --since 5m api | grep "se ignoró una lectura"`. Aparece el contenido del código de barras, por ejemplo `se ignoró una lectura que no es un DNI (9 caracteres): "000123456"`.
  3. Con ese formato, adaptar `extraerDocumento` en `mollendo-api/src/lectores-dni/lector-dni.util.ts` (y su test) para que reconozca el carné y lo registre con su tipo (`CE`).
  4. Si el lector **no pita**, no reconoce ese tipo de código: revisar en su folleto si hay que habilitar la simbología.
- **Pasaporte:** normalmente **no tiene código de barras**, solo las líneas de la zona de lectura mecánica (MRZ), que este lector no lee. Si habrá personal con pasaporte, definir con el cliente otro medio (por ejemplo, que el vigilante registre el ingreso).

Mientras tanto, una persona registrada con carné de extranjería o pasaporte **no puede ingresar pasando su documento por el lector**.

### Cambiar los lectores por otros

A diferencia de los relés, los **adaptadores ya vienen con series distintas de fábrica**, así que no hay que configurar nada para distinguirlos (igual conviene etiquetarlos).

| Cambio | Qué hay que hacer |
|---|---|
| **Mismo modelo** (Syble XB-7705H) | Configurarlo con el folleto: Factory Default → RS232 → 115200 → desenchufar y volver a enchufar la energía. Si se mantiene el adaptador, nada más. |
| **Cambiar el adaptador** (cable blanco) | Poner su ruta nueva en `.env` (`ls /dev/serial/by-id/`) y `sudo docker compose -f docker-compose.prod.yml up -d`. |
| **Otra marca, con salida serial** (RS232 o USB-COM) | **Normalmente sin cambiar el programa**: la mayoría de los lectores de códigos de barras en modo serial envían el número y un salto de línea, como este. Ajustar `LECTOR_DNI_BAUDIOS` si su velocidad no es 115200. Si envía otro formato (prefijos, más datos), se ajusta una sola función: `extraerDocumento` en `mollendo-api/src/lectores-dni/lector-dni.util.ts`. Un lector USB-COM aparece como `ttyACM` y ya está permitido. |
| **Otra marca que solo funcione como teclado** (USB-HID, sin modo serial) | **Hay que agregar código** (el sistema lee puertos serie, no teclados). Mejor elegir lectores con modo **RS232 o USB-COM**. |

Cualquier lector nuevo debe **leer el código de barras del reverso del DNI** (probarlo con un DNI real antes de comprar) y tener **salida serial** (RS232 o USB-COM).

### Lector de salida (o para cambiar un lector)

Instalados en la mini PC (04/10/2026): **ingreso** con el adaptador `...Serial_Controller_FQCLb114J19...` y **salida** con `...Serial_Controller_A_BCb14C705...`. Para instalar el de salida (o reemplazar un lector o su adaptador):

1. **Hardware:** un **segundo adaptador USB-serial** (como el ATEN) para el cable DB9 del lector de salida. Su punta USB de energía va a otro puerto USB de la mini PC.
2. **Configurar el lector** con el folleto, igual que el de ingreso: Factory Default → RS232 → 115200 → desenchufar y volver a enchufar la energía.
3. **Identificar su adaptador** en la mini PC: `ls /dev/serial/by-id/`. Aparece una segunda ruta `usb-...-port0` (cada adaptador tiene su número de serie; la del ingreso es la que termina en `FQCLb114J19-if00-port0`).
4. **Agregar en `~/mollendo/.env`:** `LECTOR_DNI_SALIDA_DISPOSITIVO=/dev/serial/by-id/<la ruta nueva>`.
5. **Aplicar:** `sudo docker compose -f docker-compose.prod.yml up -d`.
6. **Comprobar:** en el registro del backend, `Lector de DNI de salida conectado`. En **Sistema y APIs**, salida "Cable conectado". Al pasar un DNI registrado, el Panel muestra una **salida autorizada**.

Probado con el lector real: un DNI registrado queda como **salida autorizada** y uno no registrado como **salida denegada "No registrado"**, al instante. La salida autorizada activa el relé de salida (sección 8d).

---

## 8d. Relés de los molinetes

Cada molinete se abre con un **módulo de relés USB** (DCTTECH "USBRelay", placa verde con un relé azul HONG WEI y bornera de 3 tornillos), conectado a un USB de la mini PC. Se controla sin drivers. Al autorizar una **salida** (o un **ingreso** que el G4 Pro aprobó), el sistema activa el relé **1 segundo**: suena un clic y se prende un LED rojo; su contacto (NO + COM) va a la bornera J3 del molinete (K1 + COM).

| Molinete | Módulo (número de serie) | Relé |
|---|---|---|
| **Ingreso** | `ING01` | 1 |
| **Salida** | `SAL01` | 1 |
| **Aviso de ingreso denegado** (contacto seco) | `DEN01` | 1 |
| **Aviso de salida denegada** (contacto seco) | `DSA01` | 1 |

**Relés de aviso (desde el 08/10/2026):** dan un contacto seco (NO + COM), un pulso, para conectar una luz, una sirena o un tablero de garita.

- **`DEN01`, ingreso denegado:** por cualquier motivo: no registrado, dado de baja, sin documentos o vencidos, alcohol y "no completó rostro y alcohol". Este último cubre el caso en que el terminal facial **no reconoce el rostro**: el equipo no informa nada, así que el aviso llega al vencer el minuto de espera.
- **`DSA01`, salida denegada:** cuando se pasa por la salida un DNI **no registrado**. La salida no exige estar activo ni tener documentos. Funciona también **sin internet**: el controlador lo activa si el DNI no está en la lista del personal guardada.
- No se activan en ingresos o salidas autorizados.

**Cuándo se activa cada aviso**

| Puerta | Motivo de la denegación | Relé | Cuándo |
|---|---|---|---|
| Ingreso | DNI no registrado | `DEN01` | Al instante, al pasar el DNI |
| Ingreso | Dado de baja | `DEN01` | Al instante |
| Ingreso | Sin documentos o documentos vencidos | `DEN01` | Al instante |
| Ingreso | Alcohol positivo | `DEN01` | Al recibir el resultado del terminal facial |
| Ingreso | Rostro no reconocido / no completó rostro y alcohol | `DEN01` | Al vencer el minuto de espera (el terminal facial no avisa cuando no reconoce) |
| Ingreso | Sin conexión a internet (con controlador) | `DEN01` | Al instante: el controlador no deja ingresar y activa el aviso (el intento no queda en el historial, porque no llega al servidor) |
| Salida | DNI no registrado | `DSA01` | Al instante |
| Salida | DNI no registrado, sin conexión a internet (con controlador) | `DSA01` | Al instante: lo activa el controlador si el DNI no está en la lista del personal guardada |
| Ingreso o salida | Autorizado | — | No se activa |

**Configuración** (sin número de serie, el aviso no se usa). Va en el `.env` de la mini PC como servidor y en `controlador.env` como controlador:

| Variable | Valor | Para qué |
|---|---|---|
| `RELE_AVISO_INGRESO_SERIE` | `DEN01` | Aviso de ingreso denegado (antes `RELE_AVISO_SERIE`, que sigue funcionando) |
| `RELE_AVISO_SALIDA_SERIE` | `DSA01` | Aviso de salida denegada |
| `RELE_AVISO_*_CANAL` | 1 por defecto | Relé del módulo que se usa |
| `RELE_AVISO_PULSO_MS` | por defecto la de los molinetes, 1 s | Duración del pulso de los dos avisos |

- **Con controlador:** el servidor en la nube le manda el aviso al controlador por el mismo canal de las aperturas, indicando la puerta.
- **En "Sistema y APIs":** aparecen en la tarjeta de relés como **"Aviso ingreso denegado"** y **"Aviso salida denegada"**, con la hora del último aviso.
- **Prueba (08/10/2026, con AWS):** los dos módulos llegaron con la serie de fábrica `S2OD2` y se cambiaron a `DEN01` y `DSA01`. Un ingreso y una salida de DNI no registrados en AWS activaron, cada uno, el pulso de su relé en la mini PC.

> El módulo se identifica como "USBRelay2", pero la placa tiene **un solo relé** (el 1). Por eso se usa un módulo por molinete.
>
> **Los módulos vienen de fábrica con la misma serie (`S2OD2`)**, así que el sistema no los distinguiría. Se les cambió la serie (queda guardada en el módulo): `ING01` al de ingreso y `SAL01` al de salida (04/10/2026). Al instalar un módulo nuevo hay que hacer lo mismo (ver "Cambiar la serie de un módulo").

### Configurar el servidor

En `~/mollendo/.env`, el número de serie del módulo de cada molinete:

```bash
RELE_INGRESO_SERIE=ING01
RELE_SALIDA_SERIE=SAL01
# RELE_INGRESO_CANAL=1 / RELE_SALIDA_CANAL=1   (relé del módulo, 1 por defecto)
# RELE_PULSO_MS=1000                           (duración del pulso)
# RELE_USB_HIDRAW_MAJOR=234                    (ver `grep hidraw /proc/devices`)
```

Después: `sudo docker compose -f docker-compose.prod.yml up -d`.

- **Número de serie de un módulo:** con el módulo conectado, `sudo docker compose -f docker-compose.prod.yml exec api sh -c 'for h in /sys/class/hidraw/*; do /app/rele-usb /dev-servidor/$(basename $h) estado; done'` muestra la serie y el estado de cada uno (por ejemplo `S2OD2 0`).
- Los módulos se pueden conectar **en cualquier USB**: el sistema los busca por su número de serie en cada apertura (también si se desconectan y se vuelven a conectar).
- Sin número de serie, un molinete usa el único módulo conectado que no esté asignado al otro.
- **Etiquetar cada módulo** ("INGRESO" / "SALIDA").

### Cambiar la serie de un módulo

Necesario al instalar un módulo nuevo, porque todos vienen con `S2OD2`. Conectar **solo** el módulo nuevo (o identificarlo por la hora en que se conectó: `dmesg -T | grep USBRelay`), ver su `hidrawN` con el comando anterior y ponerle una serie de 5 caracteres:

```bash
sudo docker compose -f docker-compose.prod.yml exec api /app/rele-usb /dev-servidor/hidraw1 serie ING01
```

Volver a leer las series para comprobarlo, poner la serie en `.env` y ejecutar `sudo docker compose -f docker-compose.prod.yml up -d`.

### Cómo funciona

El contenedor `api` trae `rele-usb` (`mollendo-api/tools/rele-usb.c`, se compila al construir la imagen), que envía los comandos HID al módulo, y tiene permiso solo para dispositivos HID en bruto (`hidraw`) además de los puertos serie (`device_cgroup_rules` en `docker-compose.prod.yml`).

### Comprobar

- **Sistema y APIs**, tarjeta **Relés de molinetes**: cada molinete "Conectado" o "No conectado", con su módulo y la última apertura.
- Al pasar un **DNI registrado por el lector de salida**: clic del relé de salida y LED rojo durante 1 s. En el registro del backend: `Molinete de salida abierto: pulso de 1000 ms en el relé 1 del módulo SAL01`.
- **Orden manual** (para probar cada relé sin pasar un DNI): `POST /api/v1/integraciones/torniquete/comando` con `{"torniqueteId":"ingreso","comando":"abrir"}` (o `"salida"`), con la sesión de un Administrador o Vigilancia; también desde Swagger.
- Un DNI **no registrado** se deniega y **no** activa el relé.

### Cómo se distinguen los módulos

- **Para el sistema:** cada módulo lleva guardada su serie (`ING01` / `SAL01`) y el sistema la lee en cada apertura. No importa en qué USB se conecten ni si se desconectan.
- **Para las personas:** los módulos son físicamente idénticos y la serie no está impresa en la placa. Hay que **etiquetarlos** ("INGRESO" / "SALIDA") al instalarlos. Si se pierde la etiqueta: activar un relé con la orden manual (arriba) y ver cuál suena, o conectarlos de a uno y leer su serie.

### Cambiar los relés por otros

| Relé nuevo | Qué hay que cambiar |
|---|---|
| **Del mismo tipo** (USB "USBRelay" / DCTTECH, de 1, 2, 4 u 8 relés) | **Nada en el programa.** Cambiarle la serie (vienen con `S2OD2`) y ponerla en `.env`. Un módulo de **2 relés reales** puede manejar los dos molinetes: la misma serie en `RELE_INGRESO_SERIE` y `RELE_SALIDA_SERIE`, con `RELE_INGRESO_CANAL=1` y `RELE_SALIDA_CANAL=2`. |
| **De otra marca o tipo** (de red Ethernet, Modbus, USB-serie con otros comandos…) | **Agregar su protocolo al programa.** La comunicación con el relé está aislada en `mollendo-api/src/integraciones/rele-usb.service.ts`; se agrega el "idioma" del relé nuevo y el resto (cuándo abrir, Panel, Sistema y APIs) no cambia. Hacen falta su manual o protocolo y una prueba con el equipo real. |

**Recomendación para operación continua:** los módulos actuales son placas sueltas, pensadas para pruebas o proyectos chicos. Para el terminal conviene un **relé industrial de red (Ethernet)**, uno por molinete, como planteaba el diseño original (`Opciones_Integracion_G4Pro.md`):

- va **junto al molinete**, por cable de red, sin depender de que la mini PC esté cerca ni de un cable USB;
- viene en **caja para riel DIN**, más resistente al polvo, la vibración y la humedad;
- si usa **Modbus TCP** (protocolo estándar), el programa queda compatible con varias marcas.

Antes de comprar, revisar el modelo (nombre o manual) para confirmar si funciona con lo que ya existe o cuánto hay que agregar.

### Relé de ingreso

Instalado (`ING01`, 04/10/2026). Se activa cuando el **G4 Pro aprueba el rostro y el alcohol** de un DNI en regla (sección 8e). Probado con el ingreso completo el 04/10/2026.

---

## 8e. Terminal facial G4 Pro

El G4 Pro (con el alcoholímetro DT1700) se conecta **directo a la mini PC** por la red local, con el protocolo PUSH de ZKTeco en su variante de **control de acceso**. No usa ningún software del fabricante. Referencia técnica completa (rutas, comandos, respuestas, códigos): `Protocolo_G4Pro_Referencia.md`.

### Apuntar el G4 Pro a la mini PC

1. La mini PC necesita una **IP fija** en la red local (reservarla en el router; hoy es `192.168.0.165`, por Wi-Fi: conviene pasarla a cable). Se ve con `ip -4 addr`.
2. En el G4 Pro: **Menú → COMM. → Cloud Server Setting**: dirección `192.168.0.165` (la IP de la mini PC), puerto **`3001`**, sin dominio, sin HTTPS y sin proxy. En **Ethernet**, una IP de la misma red (DHCP sirve).
3. A los pocos segundos el equipo se registra solo. En el registro del backend: `Nuevo equipo registrado: HSR3263100192`. En **Sistema y APIs**, "Equipos (G4 Pro)": **En línea**.

### Umbral de alcohol (obligatorio)

En el G4 Pro: **Configuración avanzada → Configuración del proceso de prueba de alcohol**:

- **Detección en estado de ebriedad:** activada.
- **Umbral de embriaguez:** el valor que defina el cliente. **De fábrica venía en 0.0025 g/L (2.5 mg/L)**, tan alto que una lectura positiva (0.000413 g/L, "Supera el valor estándar") **pasó igual**. La guía del DT1700 recomienda 0.02 mg/L (0.00002 g/L).

El G4 Pro no informa el valor medido al sistema, solo si la persona pasó o no: el control de alcohol depende de este umbral.

### Permiso de paso

**Qué es el permiso de paso.** Es la autorización que el G4 Pro guarda para **dejar pasar** a una persona. Estar registrada en el equipo (con su rostro) no alcanza:

- **Con rostro, sin permiso:** el G4 Pro la **reconoce pero la rechaza** ("acceso denegado", `event=23`).
- **Con rostro y con permiso:** la reconoce, le toma la prueba de alcohol y, si sale bien, la **deja pasar** (`event=0`).

**Cómo lo usa el sistema:** registra a todo el personal **sin permiso**; cuando una persona pasa su **DNI en regla**, le da el permiso **solo a ella, por 1 minuto**, y se lo quita al terminar o al vencer el minuto. Así el G4 Pro solo acepta a quien acaba de pasar su DNI (diagrama de ingreso, pasos 4 y 9).

**Por qué no se registra a mano en el equipo:** el G4 Pro le da a quien se registra desde su pantalla un **permiso permanente** (se vio un usuario manual con `userauthorize=50`). Esa persona podría pasar sin DNI y, peor, verificarse mientras otra está habilitada: como el éxito llega sin decir quién fue, el sistema lo atribuiría a la persona del DNI y abriría el molinete. La sincronización borra esos usuarios y quita los permisos sueltos.

### Personas y rostros

- **Nunca registrar personas a mano en el G4 Pro.** Un usuario creado desde la pantalla del equipo recibe **permiso de paso permanente** (se vio: un usuario manual dejó 50 permisos) y queda fuera del control del sistema: podría verificarse mientras otra persona está habilitada y el sistema se lo atribuiría a esa persona. Tampoco usar personas del sistema como **administradores del equipo**: el sistema les vuelve a poner privilegio normal al editarlas.
- **No se registran a mano en el equipo.** Al dar de alta o editar a una persona en el portal, el sistema la carga en el G4 Pro con su **DNI como número de usuario** y su nombre; al subir su foto, se la envía y el equipo la convierte en el rostro que reconoce.
- **Sincronización:** desde **Sistema y APIs → "Sincronización con el G4 Pro"** (botones **Simular** y **Sincronizar ahora**, que pide confirmación), o con `POST /api/v1/integraciones/g4pro/sincronizar` (Administrador) deja el equipo igual al sistema: **borra a los usuarios que el sistema no conoce** (por ejemplo, registrados a mano), **quita los permisos de paso sueltos** y **registra con foto al personal activo que falta**. Se hace sola **todos los días a medianoche** (la hora se cambia con `G4PRO_HORA_SINCRONIZACION` en `.env`, de 0 a 23; con `off` se desactiva y queda solo la manual). **Hoy está desactivada en la mini PC (`off`) mientras existan los datos DEMO**: activarla (quitar la línea o poner `0`) después de borrarlos. Con `?simular=true` solo informa qué haría (`usuariosABorrar`, `agregadas`, `permisosQuitados`). Usarla al instalar un equipo nuevo o reinstalado.
- En **Sistema y APIs**, la tarjeta del G4 Pro muestra cuántos **usuarios** y **rostros** tiene el equipo (y los usuarios **sin rostro**), según la última sincronización o simulación; la tarjeta de sincronización muestra si la diaria está activa y el último resultado, incluidos los **usuarios que el sistema no conoce**. Ese resultado queda guardado en la base de datos (tabla `sincronizacion_g4`, con el historial de todas las sincronizaciones y simulaciones), así que se sigue viendo aunque se reinicie la API o la mini PC.
- **Ojo con los datos de demostración:** la sincronización registra en el equipo a todo el personal **activo**, también al DEMO (con fotos que no son rostros). Borrar los datos DEMO antes de operar (8b).
- La **foto** debe ser de frente, con buena luz y el rostro centrado. Se registran con su número de documento (DNI, carné de extranjería o pasaporte; el equipo acepta letras). **Pero los lectores solo reconocen el DNI**: el personal con carné de extranjería o pasaporte todavía no puede pasar su documento por el lector (pendiente, ver Estado 0.5).
- Ninguna persona tiene **permiso de paso** en el equipo, salvo la que está en su minuto de espera: el sistema se lo da al pasar su DNI en regla y se lo quita al terminar (una persona a la vez; las demás quedan "en cola").

### Dejar el equipo limpio (si alguien registró personas a mano)

Se hace con comandos encolados para el equipo (desde la base de datos, tabla `comando_dispositivo`), probado el 05/oct/2026:

1. Ver los usuarios: `DATA QUERY tablename=user,fielddesc=*,filter=*` (la respuesta queda en el registro del backend: `Respuesta de … (tabledata user)`).
2. Por cada número de usuario (`pin`): `DATA DELETE userauthorize Pin=<pin>`, `DATA DELETE extuser Pin=<pin>` y `DATA DELETE user Pin=<pin>`. **Borrar el usuario no borra su nombre ni sus permisos**: hay que borrarlos aparte.
3. Comprobar con `DATA COUNT user`, `DATA COUNT userauthorize` y `DATA COUNT extuser` (deben dar 0).
4. Volver a registrar al personal desde el sistema: `POST /api/v1/integraciones/g4pro/sincronizar`.

El sistema ya borra las tres tablas cuando le cambia el documento a una persona.

### Comprobar

- En el registro del backend (`sudo docker compose -f docker-compose.prod.yml logs -f api`), al pasar un DNI en regla y completar rostro y alcohol:
  ```
  DNI leído en ingreso: pendiente_verificacion
  G4 Pro: habilitar DNI 48058719
  G4 Pro: deshabilitar DNI 48058719
  Molinete de ingreso abierto: pulso de 1000 ms en el relé 1 del módulo ING01
  ```
- `G4 Pro rechazó a DNI … (event=23)`: el equipo reconoció a una persona que no estaba habilitada (no pasó su DNI, tenía un documento vencido, o es otra persona).
- `rostro no registrado (event=27)`: el equipo no tiene ese rostro (falta la foto, o la foto no sirvió). También llega con huella o tarjeta de personas no registradas.
- Alcohol sobre el umbral: el G4 Pro envía `event=1` y en el Panel queda **denegado por alcohol** (sin abrir el molinete).
- En el **Panel**, una persona habilitada aparece "en espera" con su foto; si no completa rostro y alcohol en 1 minuto, queda **"No completó rostro y alcohol"**.

### Antes de empezar a operar (lista de verificación)

- [ ] **Umbral de alcohol** del G4 Pro fijado según la política del cliente (8e).
- [ ] **Relés cableados** a las borneras J3 de los molinetes y probados con la orden manual (8d).
- [ ] **Datos de demostración borrados** (8b), incluida la persona de prueba "Amiel Bautista" (DNI 48058719), y su usuario borrado del G4 Pro.
- [ ] **Personal real cargado** en el portal, con foto de frente, y registrado en el G4 Pro (`POST /api/v1/integraciones/g4pro/sincronizar`).
- [ ] **Adaptadores y módulos etiquetados** ("INGRESO" / "SALIDA").
- [ ] **IP fija** de la mini PC reservada en el router (el G4 Pro apunta a ella).
- [ ] Prueba completa con una persona real: DNI → rostro → alcohol → molinete de ingreso; y salida.

---

## 8f. Mini PC como controlador (servidor en la nube)

Arquitectura con el servidor (portal, API, base de datos, respaldos) en la nube (AWS hoy, Azure después) y la mini PC en la garita **solo como controlador**: lee los DNI, los manda al servidor por internet y abre los molinetes cuando el servidor lo ordena. El G4 Pro se conecta directo al servidor.

**Cómo funciona**

- Es el **mismo programa** (`mollendo-api`, misma imagen de Docker) arrancado en modo controlador: `node dist/controlador/main.js` (`src/controlador/`). Usa el mismo código de lectores de DNI y relés.
- Cada DNI leído se manda con la clave de equipos a `POST /api/v1/eventos-acceso/ingreso|salida` del servidor.
- La mini PC abre un **canal permanente hacia el servidor** (socket.io, `/ws/controlador`, validado con `DEVICE_API_KEY`): por ahí recibe "abrir el molinete de ingreso/salida" e informa cada 15 s el estado de lectores y relés (se ve en "Sistema y APIs" → "Controlador"). Lo abre la garita hacia afuera: **no hay que abrir puertos en la red del terminal**. Si se corta, se reconecta solo.
- En el servidor, `MOLINETES_REMOTOS=true` en `.env`: la orden de abrir va al controlador (no a un relé local).
- **Sin internet (opción B):** nadie puede entrar; **sí salir**. El controlador guarda la **lista del personal** (documentos de todo el personal registrado, `GET /api/v1/controlador/lista-personal`, se renueva cada 10 min y queda en disco) y deja salir a quien está en él. Esas salidas se guardan y, al volver la conexión, se envían con su hora (`sinConexion: true`, `fechaHora`) sin volver a abrir el molinete.

**Sin internet, en detalle**

- **Cómo se da cuenta el controlador:** cada DNI leído se manda al servidor y se espera la respuesta **hasta 5 segundos**. Si no llega (sin internet, servidor caído o demasiado lento), actúa por su cuenta. El canal permanente se reconecta solo cuando vuelve la conexión.
- **La lista del personal:** se descarga del servidor al conectarse y cada **10 minutos**, y se guarda en el disco de la mini PC (`lista-personal.json`). Así sirve aunque la mini PC se reinicie sin internet.

| Qué pasa sin internet | Molinete | Relé de aviso | ¿Queda en el historial? |
|---|---|---|---|
| DNI por el **ingreso** (cualquiera) | No se abre: nadie entra (los documentos, las bajas y el terminal facial dependen del servidor) | `DEN01` | No: el intento no llega al servidor |
| DNI **registrado** por la **salida** (está en la lista) | Se abre | — | Sí: al volver la conexión se envía con la **hora real** en que ocurrió, sin volver a abrir el molinete (hasta 7 días atrás) |
| DNI **no registrado** por la **salida** | No se abre | `DSA01` | No |

- **Al volver la conexión:**
  - el controlador se reconecta solo;
  - envía las salidas pendientes (`salidas-pendientes.json`);
  - renueva la lista del personal.

  "Sistema y APIs" muestra cuántas salidas faltan enviar.
- **Probado:**
  - **Con AWS apagado** (07/10/2026), el controlador rechazó un ingreso ("sin conexión: no se permite el ingreso") y se reconectó solo al volver.
  - **Con pruebas automáticas:** la salida con y sin lista, el envío posterior con su hora y los avisos DEN01 y DSA01.
  - **Pendiente:** la prueba física completa sin internet (DNI en el ingreso → DEN01; DNI de alguien registrado en la salida → se abre y llega después al historial).

**Instalación en la mini PC** (en `~/mollendo`):

1. `controlador.env` (permisos 600) con `SERVIDOR_URL` (la API en la nube, sin `/api/v1`), `DEVICE_API_KEY` (**la misma** del servidor) y las variables de lectores y relés (`LECTOR_DNI_*_DISPOSITIVO`, `RELE_*_SERIE`; ver `deploy.env.example`).
2. Que la API local de la mini PC (si sigue corriendo) no use los lectores: comentar `LECTOR_DNI_INGRESO_DISPOSITIVO` y `LECTOR_DNI_SALIDA_DISPOSITIVO` en `.env` y poner `MOLINETES_REMOTOS=true`; `docker compose -f docker-compose.prod.yml up -d api`.
3. `docker compose -f docker-compose.controlador.yml --env-file controlador.env up -d --build`
4. Comprobar: `docker compose -f docker-compose.controlador.yml --env-file controlador.env logs --tail 20 controlador` debe decir "Lector de DNI … conectado", "Conectado al servidor" y "Lista del personal actualizada: N personas".

**Prueba del 07/10/2026 (AWS como nube):** controlador en la mini PC conectado a `http://54.147.214.38:3001`; AWS lo ve conectado con los dos lectores y los dos relés (ING01, SAL01) y la lista del personal; una salida registrada en AWS abrió el relé SAL01 de la mini PC; al reiniciar la API de AWS el controlador se reconectó solo. Configuración anterior de la mini PC guardada en `.env.antes-controlador-20261007-0953`.

**Volver a la mini PC como servidor completo:**

```bash
cd ~/mollendo
docker compose -f docker-compose.controlador.yml --env-file controlador.env down
cp .env.antes-controlador-20261007-0953 .env
docker compose -f docker-compose.prod.yml up -d api
```

**Pendiente para el ingreso completo:** el G4 Pro sigue apuntando a la mini PC; para probar un ingreso con el servidor en la nube hay que cambiar en el equipo la dirección del servidor (Cloud Server) a la de la nube, y registrar allí al personal con su foto.

## 8g. Configuraciones de la mini PC y del G4 Pro (para pruebas)

La garita puede trabajar de dos maneras. Para pasar de una a otra hay que cambiar **dos cosas**: cómo arranca la mini PC y a qué servidor apunta el G4 Pro.

### Las dos configuraciones

| | **A. Mini PC como servidor completo** | **B. Mini PC como controlador (servidor en la nube)** |
|---|---|---|
| Portal, API, base de datos | En la mini PC (`docker-compose.prod.yml`) | En la nube (hoy AWS `54.147.214.38`; después Azure) |
| Lectores de DNI y relés | Los maneja la API de la mini PC | Los maneja el **controlador** de la mini PC (`docker-compose.controlador.yml`) |
| G4 Pro apunta a (Cloud Server) | `192.168.0.165`, puerto `3001` | `54.147.214.38`, puerto `3001` (o el dominio de Azure) |
| Desde dónde llega el G4 al servidor | Red local de la garita | Internet, desde la IP pública de la garita (`38.25.53.235` el 07/10/2026) |
| Personal y fotos en el G4 | Los de la base de la mini PC | Los de la base de la nube |

**El G4 Pro habla con un solo servidor**: el que tenga configurado. El otro lo ve "Desconectado" (solo guarda la última vez que lo vio). Al cambiar de servidor, el nuevo le envía los comandos que tenía pendientes; revisarlos antes (`select … from comando_dispositivo where estado = 'pendiente'`).

### Estado actual (08/10/2026): configuración B con AWS

- **Mini PC:**
  - `controlador` corriendo con `controlador.env`: `SERVIDOR_URL=http://54.147.214.38:3001`, la clave de equipos de AWS, lectores y relés.
  - La API local sigue corriendo, pero sin lectores (comentados en `.env`) y con `MOLINETES_REMOTOS=true`.
  - Su configuración anterior está guardada en `.env.antes-controlador-20261007-0953`.
- **AWS:** `MOLINETES_REMOTOS=true` y `G4PRO_HORA_SINCRONIZACION=off` en `.env`. Tiene la persona de prueba **Amiel (48058719)**, con foto y un documento SCTR Salud vigente hasta el 31/12/2027, para probar el ingreso completo.
- **G4 Pro:** apunta a AWS (`54.147.214.38:3001`), cambiado el 08/10/2026.
- **Pendiente:** el ingreso completo con AWS no se completó: el G4 **no reconoció el rostro de Amiel** en dos intentos (todo lo demás funcionó). Probar primero el rostro sin DNI (si lo reconoce, el G4 envía `event=23` con su DNI); si no, reiniciar el G4 y repetir.

### Pasar de B (controlador) a A (servidor completo)

1. **En el G4 Pro** (menú de comunicación → servidor en la nube): dirección `192.168.0.165`, puerto `3001`.
2. **En la mini PC** (`~/mollendo`):

```bash
docker compose -f docker-compose.controlador.yml --env-file controlador.env down
cp .env.antes-controlador-20261007-0953 .env     # lectores activos, sin MOLINETES_REMOTOS
docker compose -f docker-compose.prod.yml up -d api
```

3. **Comprobar** en "Sistema y APIs" de la mini PC:
   - el G4 "En línea";
   - los lectores con "Cable conectado";
   - los relés "Conectado";
   - **sin** la tarjeta "Controlador".

### Pasar de A (servidor completo) a B (controlador)

1. **En la mini PC:**
   - en `.env`, comentar `LECTOR_DNI_INGRESO_DISPOSITIVO` y `LECTOR_DNI_SALIDA_DISPOSITIVO` y poner `MOLINETES_REMOTOS=true`;
   - `docker compose -f docker-compose.prod.yml up -d api`;
   - `docker compose -f docker-compose.controlador.yml --env-file controlador.env up -d --build`.

   Los lectores no pueden estar abiertos por la API y el controlador a la vez.
2. **En el servidor en la nube:** `MOLINETES_REMOTOS=true` en `.env` y reiniciar la API.
3. **En el G4 Pro:** dirección y puerto del servidor en la nube.
4. **Comprobar** en "Sistema y APIs" de la nube:
   - "Controlador: Conectado", con los lectores y relés que informa;
   - "Equipo (G4 Pro): En línea".

### Otras opciones útiles para pruebas

- `PUSH_SDK_DEPURAR=true` en el `.env` del servidor que recibe al G4: anota cada mensaje del equipo en el registro de la API (ver `Protocolo_G4Pro_Referencia.md`). Volver a `false` al terminar.
- Para que una persona pueda pasar por el G4 sin el flujo del DNI (pruebas del equipo), se le da permiso a mano con un comando `DATA UPDATE userauthorize …` y se le quita al terminar con `DATA DELETE userauthorize …` (ver `Protocolo_G4Pro_Referencia.md`, sección 9).

## 9. Seguridad y recomendaciones

1. **Contraseña del servidor**: cámbiala si alguna vez se compartió por chat o correo (`passwd` en el servidor). Lo recomendable es entrar con **llave SSH** y desactivar el acceso por contraseña.
2. **El archivo `~/mollendo/.env`** tiene todas las claves. Debe tener permisos `600` (`chmod 600 .env`) y no copiarse a git, correos ni chats.
3. **Contraseñas del portal**: cambiar las iniciales después del primer ingreso.
4. **IP fija en la red local**: los equipos (G4 Pro, relé) necesitarán una dirección estable. Reservar la IP de la mini PC en el router o conectarla por cable.
5. **UPS** para la mini PC, el switch, el relé y el G4 Pro (ver `Opciones_Integracion_G4Pro.md`, sección 7).
6. **Respaldos fuera de la mini PC**, con regularidad (7.4).
7. **Actualizaciones de Ubuntu**: el sistema tiene las actualizaciones automáticas de seguridad de Ubuntu. Docker se actualiza con ellas.
8. **Integración de equipos**: los lectores de DNI (8c), los relés de los molinetes (8d) y el G4 Pro (8e) funcionan con la mini PC. El rechazo por alcohol está confirmado (`event=1`); falta que el cliente defina el umbral de alcohol del G4 Pro (8e).

---

## Anexo A. Registro del primer despliegue (28/09/2026)

Hecho desde la PC de desarrollo (Windows), por SSH sobre Tailscale.

**Servidor**

| Dato | Valor |
|---|---|
| Nombre | `monteazul` |
| Sistema | Ubuntu 26.04.1 LTS, kernel 7.0 |
| Hardware | 12 núcleos, 6,8 GB de RAM, disco de 98 GB (9 % usado al instalar) |
| Usuario | `ma-admin` (con sudo) |
| IPs | Tailscale `100.78.153.33`; red local `192.168.0.165` (Wi-Fi `wlp87s0f0`) |
| Huella SSH (ED25519) | `SHA256:7E0UUb8X7/RlEWjbISN3pl3P5GW23mxXKQVhB2GaWDg` |
| Estado inicial | Sin Node, PostgreSQL ni Docker; solo Git y Tailscale |

**Qué se hizo**

1. Instalación de Docker 29.1.3 y Docker Compose 2.40.3 (paquetes de Ubuntu).
2. **Incidente (resuelto):** antes de decidir usar contenedores se lanzó una instalación de Node.js, npm y PostgreSQL directo en el sistema. El usuario la rechazó, pero ya se había ejecutado: instaló 542 paquetes (PostgreSQL 18 quedó activo en `127.0.0.1:5432`) y cambió la zona horaria a `America/Lima`. Con autorización del usuario se desinstalaron exactamente esos 542 paquetes (lista tomada de `/var/log/apt/history.log`), se borraron los datos vacíos de PostgreSQL y el usuario `postgres` del sistema. Se verificó que no quedó nada instalado y que el puerto 5432 quedó libre. La zona horaria se dejó en Lima por decisión del usuario.
3. Copia del código con `git ls-files` + `tar` (incluía cambios aún sin commit) y `pscp` de PuTTY. **Desde entonces el método recomendado es `git archive`** (sección 3, paso 5), que parte de un commit y es reproducible.
4. Claves nuevas de producción generadas con `secrets` de Python (distintas a las de desarrollo), guardadas en `~/mollendo/.env` (permisos `600`).
5. Primera construcción: falló `npm ci` porque el `package-lock.json` lo generó npm 12 y la imagen trae npm 10. Se fijó npm 12.0.2 en los dos Dockerfile y se reconstruyó sin errores.
6. `up -d`: el backend aplicó las 9 migraciones sobre la base vacía. Seed: empresa interna, `admin@mollendo.local` y `vigilancia@mollendo.local`. Base sin personal (los datos de prueba de desarrollo no se copiaron).

**Verificación (desde la PC de desarrollo, por Tailscale)**

| Prueba | Resultado |
|---|---|
| Portal `/signin`, `/vigilancia`, `/sistema` | 200 |
| Página inexistente | 404 (en español) |
| Swagger por el portal | 200 |
| API directa `:3001/api/v1/health` | 200 |
| Inicio de sesión del administrador por el portal | Correcto |
| Sistema y APIs | Entorno `production`, base de datos arriba, clave de equipos configurada |
| Tiempo real por el portal | Conecta |
| Respaldo automático | Primer archivo generado |
| Hora de los contenedores | Lima |
| Respaldo manual y restauración en una base temporal | Correcto (base temporal borrada después) |
| Restablecer contraseña (sección 6) | Correcto, probado con la cuenta de vigilancia usando su misma contraseña |

No se probó el acceso desde un navegador en la red local (`192.168.0.165`).

---

## Anexo B. Variables del archivo .env

Archivo `~/mollendo/.env` en el servidor, junto a `docker-compose.prod.yml`. La plantilla es `deploy.env.example`.

| Variable | Obligatoria | Para qué sirve | Cómo generarla |
|---|---|---|---|
| `DB_PASSWORD` | Sí | Contraseña del usuario `mollendo` de PostgreSQL. **No cambiarla después del primer arranque.** | `openssl rand -hex 24` |
| `JWT_SECRET` | Sí | Firma de las sesiones del portal. Si cambia, todos deben volver a iniciar sesión. | `openssl rand -base64 48` |
| `JWT_REFRESH_SECRET` | Sí | Firma de la renovación de sesiones. Distinta de `JWT_SECRET`. | `openssl rand -base64 48` |
| `DEVICE_API_KEY` | Sí | Clave de los equipos físicos (cabecera `X-API-Key` en las rutas de ingreso y salida). Si cambia, hay que actualizarla en los equipos. | `openssl rand -hex 32` |
| `CORS_ORIGIN` | No | Direcciones desde las que se abre el portal, separadas por coma. | Las IPs del servidor con `:3000` |
| `ADMIN_SEED_PASSWORD` | Solo para el seed | Contraseña inicial de `admin@mollendo.local`. Después del seed no se usa. | Cualquier contraseña de 8 o más caracteres |
| `VIGILANCIA_SEED_PASSWORD` | Solo para el seed | Contraseña inicial de `vigilancia@mollendo.local`. | Igual que la anterior |
| `ADMIN_SEED_EMAIL`, `VIGILANCIA_SEED_EMAIL` | No | Cambian los correos de las cuentas iniciales (por defecto `admin@mollendo.local` y `vigilancia@mollendo.local`). | — |

Valores fijos que no van en el `.env` (están en `docker-compose.prod.yml`): la duración de las sesiones (1 hora, renovable 7 días), el puerto del backend (`3001`), la carpeta de documentos y `SWAGGER=true`.
