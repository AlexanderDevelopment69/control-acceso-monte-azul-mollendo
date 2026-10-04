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

Instalado (`ING01`, 04/10/2026) y probado con la orden manual. Se activa cuando el **G4 Pro aprueba el rostro y el alcohol** de un DNI en regla. Para probar el ingreso completo en la mini PC, el G4 Pro tiene que apuntar a la IP de la mini PC (hoy apunta a AWS).

---

## 9. Seguridad y recomendaciones

1. **Contraseña del servidor**: cámbiala si alguna vez se compartió por chat o correo (`passwd` en el servidor). Lo recomendable es entrar con **llave SSH** y desactivar el acceso por contraseña.
2. **El archivo `~/mollendo/.env`** tiene todas las claves. Debe tener permisos `600` (`chmod 600 .env`) y no copiarse a git, correos ni chats.
3. **Contraseñas del portal**: cambiar las iniciales después del primer ingreso.
4. **IP fija en la red local**: los equipos (G4 Pro, relé) necesitarán una dirección estable. Reservar la IP de la mini PC en el router o conectarla por cable.
5. **UPS** para la mini PC, el switch, el relé y el G4 Pro (ver `Opciones_Integracion_G4Pro.md`, sección 7).
6. **Respaldos fuera de la mini PC**, con regularidad (7.4).
7. **Actualizaciones de Ubuntu**: el sistema tiene las actualizaciones automáticas de seguridad de Ubuntu. Docker se actualiza con ellas.
8. **Integración de equipos**: los lectores de DNI (8c) y los relés de los molinetes (8d) ya funcionan desde el contenedor `api`. Falta que el G4 Pro apunte a la IP de la mini PC.

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
