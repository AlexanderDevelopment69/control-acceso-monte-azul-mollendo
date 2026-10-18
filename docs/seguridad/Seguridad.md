# Seguridad del sistema de control de accesos

Revisión de seguridad del 10/10/2026 (API, portal, servidor en la nube y librerías; el servidor pasó de AWS a Azure el 16/10/2026) y segunda revisión del 18/10/2026, lo que se corrigió y lo que queda pendiente. Al final hay una lista de control para revisar en cada despliegue.

> **Estado al 11/10/2026:** el **programa** (API y portal) no tiene problemas de seguridad graves conocidos. Lo que falta para que el sistema en funcionamiento sea seguro es de la **instalación**: cambiar las contraseñas iniciales y guardar los respaldos fuera del servidor (el HTTPS quedó listo el 16/10/2026) (ver [sección 0](#0-estado-actual)).

## Contenido

0. [Estado actual](#0-estado-actual)
1. [Resumen](#1-resumen)
2. [Medidas vigentes](#2-medidas-vigentes)
3. [Correcciones del 10/10/2026](#3-correcciones-del-10102026) y [del 17 y 18/10/2026](#37-correcciones-del-17-y-18102026)
4. [Pendiente](#4-pendiente)
5. [Lista de control por despliegue](#5-lista-de-control-por-despliegue)
6. [Cómo comprobar cada medida](#6-cómo-comprobar-cada-medida)

---

## 0. Estado actual

Al 11/10/2026, después de la revisión de seguridad (10/10) y de la revisión del portal (11/10, ver [`../revisiones/Revision_Portal_2026-10-11.md`](../revisiones/Revision_Portal_2026-10-11.md)).

### 0.1. El programa (API y portal)

Sin problemas graves conocidos. Lo que cubre:

| Área | Cómo está |
|---|---|
| Contraseñas | Cifradas con bcrypt, nunca en texto plano; las nuevas, de al menos 10 caracteres con letras y números (desde el 17/10/2026) |
| Inicio de sesión | Límite de intentos (5 por minuto por correo e IP, 20 por IP); mensaje único "Correo o contraseña incorrectos"; cada intento, bueno o rechazado, queda en la Auditoría con la IP y el motivo |
| Sesiones | En cookies que el código de la página no puede leer (`HttpOnly`, `Secure`, `SameSite=Strict`); 1 hora, renovables hasta 7 días; se cortan al instante (también el panel en vivo) al dar de baja la cuenta o cambiar la contraseña |
| Permisos | Cada ruta de la API exige sesión y rol; el vigilante no ve documentos ni pantallas de administrador aunque escriba la dirección |
| Equipos | Ingreso, salida y controlador con clave (comparada en tiempo constante); el G4 Pro, solo con su número de serie autorizado y desde la IP de la sede |
| Puerto 3001 | Sin cifrar, solo para el G4 Pro: desde internet atiende únicamente `/iclock`; el inicio de sesión y los datos van siempre por HTTPS |
| Archivos | Solo PDF, imágenes y Word, con tamaño máximo y nombre aleatorio en disco |
| Datos de entrada | Validados en la API; sin inyección SQL (consultas parametrizadas) ni HTML inyectable en el portal |
| Navegador | Cabeceras de seguridad; el portal no se puede mostrar dentro de otro sitio |
| Librerías | Sin vulnerabilidades conocidas en lo que se instala en el servidor |
| Trazabilidad | Auditoría de todos los cambios y de los inicios de sesión |

**Límites conocidos** (ningún sistema es 100 % seguro):

- **El G4 Pro no manda clave:** el protocolo de ZKTeco no lo permite. Se identifica por su número de serie y por la IP de la sede ([3.7](#37-correcciones-del-17-y-18102026)); si la sede cambia de IP, hay que actualizarla ([4.2](#42-restringir-el-puerto-3001-por-ip)).
- **Sin filtro de ataques web (DDoS) delante del servidor:** solo la protección básica de Azure, que no cubre ataques a la página. Recomendado: el proxy de Cloudflare ([4.3](#43-otros)).
- **Renovación de sesión de 7 días sin lista de revocación:** si alguien robara el token de renovación de un navegador, podría usarlo hasta que venza, salvo que se cambie la contraseña o se dé de baja la cuenta. Es el diseño habitual; se podría endurecer guardando las sesiones en la base para revocarlas una por una.
- **Sin verificación en dos pasos (2FA)** para el administrador.
- **Revisión de código, no prueba de penetración:** si el cliente la exige, debe hacerla un tercero especializado.

### 0.2. La instalación

| Prioridad | Pendiente | Quién | Estado |
|---|---|---|---|
| 🔴 | **Contraseñas iniciales sin cambiar en Azure** (instalado el 16/10/2026; antes, lo mismo en AWS): `admin@mollendo.local` y `vigilancia@mollendo.local` entran con la contraseña generada al instalar, que está en texto plano en el `.env` del servidor. En Azure, además, se compartieron por chat el 16/10/2026: **cambiarlas cuanto antes**. Cambiarlas desde el portal (menú del usuario → "Cambiar contraseña") y después borrar `ADMIN_SEED_PASSWORD` y `VIGILANCIA_SEED_PASSWORD` del `.env` (solo sirven para crear las cuentas la primera vez) | Administrador del portal; luego soporte | Pendiente |
| ✅ | **HTTPS** ([4.1](#41-https)): `https://accesos.monteazulsur.com.pe` con Let's Encrypt (16/10/2026) | Soporte | Hecho |
| 🟠 | **Respaldos fuera del servidor:** hoy los respaldos diarios están en el mismo disco del servidor de Azure; si se pierde o se compromete, se pierden datos y respaldos. Opciones: Azure Backup de la máquina virtual (desde el portal de Azure) o copiar cada respaldo a un Azure Storage (Blob) | Quien administre Azure (TMAM) | Pendiente |
| ✅ | **Puerto 3001 solo para la IP del terminal** ([4.2](#42-restringir-el-puerto-3001-por-ip)): en la API, con `G4PRO_IPS_PERMITIDAS=190.119.170.73` (IP fija de la sede) | Soporte | Hecho el 18/10/2026. Opcional además: la misma regla en el grupo de seguridad de red de Azure (TMAM) |
| 🟠 | **Proxy de Cloudflare** (nube naranja) contra ataques web y DDoS ([4.3](#43-otros)) | TMAM (maneja el DNS en Cloudflare) | Pendiente |
| 🟠 | **Actualizar la mini PC** cuando vuelva a estar en línea: no tiene las correcciones del 10 y 11/10/2026 (`deploy/controlador/README.md`, sección 5) | Soporte | Pendiente |

## 1. Resumen

| # | Hallazgo | Riesgo | Estado |
|---|---|---|---|
| 1 | Las rutas `/iclock/*` del G4 Pro no llevan clave (el protocolo de ZKTeco no la manda) y en la nube el puerto 3001 da a internet: cualquiera que conociera el número de serie podía enviar un "rostro y alcohol OK" falso mientras una persona esperaba tras pasar su DNI, o registrar equipos falsos | Alto | ✅ Corregido: solo se atienden los números de serie de `G4PRO_SN_PERMITIDOS`. Recomendado además: restringir el puerto 3001 por IP ([4.2](#42-restringir-el-puerto-3001-por-ip)) |
| 2 | Next.js con una vulnerabilidad crítica de *request smuggling* en `rewrites` (el portal los usa); postcss, sharp y nanoid con vulnerabilidades altas | Alto | ✅ Corregido: Next 16.1.6 → 16.4.0 y demás librerías actualizadas sin cambio de versión mayor. `npm audit --omit=dev`: 0 vulnerabilidades |
| 3 | El login no limitaba los intentos (se podían probar contraseñas sin freno) | Medio | ✅ Corregido: 5 intentos por minuto por correo e IP, 20 por minuto por IP |
| 4 | Swagger (`/api/docs`) público en la nube: mostraba todas las rutas de la API | Bajo | ✅ Corregido: apagado en la nube (`SWAGGER=false` por defecto) |
| 5 | Sin cabeceras de seguridad; el portal anunciaba `X-Powered-By: Next.js` | Bajo | ✅ Corregido: `helmet` en la API y cabeceras en el portal |
| 6 | La clave de equipos se comparaba con `!==` (en teoría, medible por tiempo de respuesta) | Muy bajo | ✅ Corregido: comparación en tiempo constante |
| 7 | Sin HTTPS: contraseñas y datos viajan sin cifrar | Alto | ✅ Corregido el 16/10/2026: `https://accesos.monteazulsur.com.pe`, `http://` redirige a `https://`, HSTS de 1 año; el 3000 ya no se abre desde afuera ([4.1](#41-https)) |
| 8 | Sesión del portal en `localStorage`: un código malicioso en la página podría leerla | Medio | ✅ Corregido el 17/10/2026: cookies `HttpOnly`, `Secure`, `SameSite=Strict` ([3.7](#37-correcciones-del-17-y-18102026)) |
| 9 | Contraseñas de 8 caracteres sin más reglas; el inicio de sesión no dejaba rastro de los intentos | Medio | ✅ Corregido el 17/10/2026: al menos 10 caracteres con letras y números; Auditoría de cada intento con IP y motivo |
| 10 | Las rutas del G4 Pro se protegían solo con el número de serie, que viaja sin cifrar: quien lo conociera podía pedir los comandos pendientes (nombres, DNI y fotos del personal) o mandar un aprobado falso | Alto | ✅ Corregido el 18/10/2026: además, solo desde la IP de la sede (`G4PRO_IPS_PERMITIDAS`) |
| 11 | La API completa respondía por el puerto 3001 sin cifrar (también el inicio de sesión) | Alto | ✅ Corregido el 18/10/2026: desde internet, el 3001 solo atiende `/iclock` |
| 12 | `compression` con fuga de memoria (DoS); `mysql2` y `deepmerge-ts` dentro de Prisma | Medio | ✅ Corregido el 18/10/2026: `compression` 1.8.2, Prisma 7.10.1 |

---

## 2. Medidas vigentes

**Cuentas y sesiones**

- Contraseñas guardadas con bcrypt (nunca en texto plano). Las nuevas (crear usuario, restablecer, cambiar la propia): al menos 10 caracteres, con letras y números (`PasswordSegura`). Las ya guardadas siguen valiendo hasta que se cambien.
- Sesión firmada (JWT) de 1 hora, renovable hasta 7 días con un token aparte (`JWT_REFRESH_SECRET`, distinto de `JWT_SECRET`). El portal la guarda en cookies `HttpOnly` (`mollendo_sesion`, ruta `/api/v1`; `mollendo_renovacion`, solo `/api/v1/auth`), `Secure` con HTTPS y `SameSite=Strict`: el código de la página no puede leerlas y el navegador no las manda desde otros sitios. `Authorization: Bearer` sigue sirviendo para scripts.
- En **cada pedido** se comprueba que la cuenta siga activa: dar de baja a un usuario lo saca de inmediato. Al cambiar la contraseña se cierran las demás sesiones.
- Límite de intentos de inicio de sesión (sección 3). Mensaje único "Correo o contraseña incorrectos" (no revela qué correos existen ni si la cuenta está de baja).
- Cada inicio de sesión queda en la Auditoría: los correctos ("inicio de sesión") y los rechazados ("inicio rechazado"), con la IP y, si se rechazó, el correo escrito y el motivo.
- **Canal en vivo** (`/ws/eventos`, Panel de vigilancia y Dashboard): al conectarse se comprueba lo mismo que en la API (token válido, rol, cuenta activa, sin cambio de contraseña posterior). Al dar de baja una cuenta o cambiar/restablecer su contraseña, el servidor corta sus conexiones abiertas (evento interno `usuario.sesiones-cerradas`).

**Permisos**

- Todas las rutas exigen sesión por defecto (guarda global `JwtAuthGuard`); las públicas se marcan una por una con `@Public()`.
- Cada ruta declara sus roles (`RolesGuard`), aplicados en la API y no solo en el portal. El vigilante no puede descargar documentos (la API responde 403).
- Solo dos rutas aceptan cualquier rol con sesión: cambiar la propia contraseña y la lista de tipos de documento.

**Equipos**

- Ingreso, salida, la lista del personal y el canal del controlador (WebSocket) exigen la clave de equipos (`X-API-Key` / `DEVICE_API_KEY`), comparada en tiempo constante.
- El G4 Pro (`/iclock/*`) solo es atendido si su número de serie está en `G4PRO_SN_PERMITIDOS` (sección 3) **y** llega desde una IP de `G4PRO_IPS_PERMITIDAS` ([3.7](#37-correcciones-del-17-y-18102026)).

**Archivos**

- Solo PDF, JPG, PNG, WEBP y Word, con tamaño máximo. Se validan antes de escribirse en disco.
- Se guardan con nombre aleatorio (UUID) dentro de `persona-{id}/`: el nombre que manda el usuario nunca forma parte de la ruta.
- Se sirven con el tipo según la extensión guardada, no según lo que declaró quien los subió.

**Datos de entrada**

- Validación en la API (`class-validator`, `whitelist` + `forbidNonWhitelisted`: se rechazan campos no esperados).
- Base de datos con Prisma (consultas parametrizadas: sin inyección SQL).
- El portal no inserta HTML sin escapar (`dangerouslySetInnerHTML` no se usa).

**Servidor (Azure; la revisión original fue en AWS)**

- SSH solo con llave: sin contraseña y root solo con llave (comprobado en Azure el 16/10/2026).
- Puertos publicados: 22, 80 y 443 (HTTPS) y 3001 (G4 Pro: desde internet solo atiende `/iclock`). El 3000 (portal) solo en la propia máquina. La base de datos (5432) no está publicada.
- Actualizaciones de seguridad del sistema automáticas (`unattended-upgrades`).
- `.env` con permisos `600`; claves largas generadas al azar (ver anexo B de la guía de despliegue).
- Respaldo diario y antes de cada actualización.
- Ningún `.env` ni llave en el repositorio ni en su historial.

**Auditoría**

- Se registra quién creó, modificó o eliminó cada dato y cuándo, y cada inicio de sesión (correcto o rechazado) con su IP.

---

## 3. Correcciones del 10/10/2026

### 3.1. Números de serie permitidos del G4 Pro

- Variable `G4PRO_SN_PERMITIDOS`: números de serie separados por coma (sin importar mayúsculas ni espacios).
- Guarda `SerieG4Guard` en todas las rutas `/iclock/*` (`mollendo-api/src/common/guards/serie-g4.guard.ts`): un número de serie que no está en la lista recibe **403** y queda en el registro (`Terminal rechazado: SN=… desde <IP>`, una vez por número de serie e IP).
- Vacía = se acepta cualquiera (solo desarrollo y la mini PC en la red local). **En la nube es obligatoria**: `docker compose` no arranca sin ella.
- "Sistema y APIs" → tarjeta "Clave de equipos físicos" muestra qué terminales se aceptan, o avisa en ámbar si falta la lista.
- Dónde ver el número de serie: etiqueta del equipo, o "Sistema y APIs" → "Equipos de acceso" → Equipo (G4 Pro).
- Si se cambia el equipo, hay que agregar el número de serie nuevo y reiniciar la API (`docker compose up -d`).

> Límite: el número de serie no es secreto (está en la etiqueta). Esto evita que cualquiera de internet hable con el servidor como si fuera el terminal, pero quien conozca el número de serie todavía podría intentarlo. Por eso se recomienda además restringir el puerto 3001 por IP ([4.2](#42-restringir-el-puerto-3001-por-ip)).

### 3.2. Librerías del portal

- `npm audit fix` sin cambios de versión mayor: Next 16.4.0, postcss 8.5.23, sharp, nanoid y otras. Compilación de producción comprobada (`next build`).
- Quedan 5 avisos en herramientas de desarrollo (eslint y similares) que solo se corrigen con versiones mayores. No se despliegan.
- En la API, los avisos de Prisma (CLI), mysql2, exceljs y uuid no afectan: son herramientas de compilación o funciones que el sistema no usa, y el "arreglo" que propone npm es bajar a versiones antiguas.

### 3.3. Límite de intentos de inicio de sesión

- `@nestjs/throttler` solo en `POST /auth/login` (`mollendo-api/src/auth/limite-intentos.ts`):
  - **5 intentos por minuto** con un mismo correo desde una misma IP (no bloquea a los demás usuarios de la misma oficina);
  - **20 intentos por minuto** desde una misma IP, sumando todos los correos.
- Al pasarse responde **429** "Demasiados intentos de inicio de sesión. Espere un minuto y vuelva a intentarlo.", que el portal muestra tal cual. Esos intentos no prueban la contraseña ni quedan en la Auditoría.
- Los envíos sin correo o sin contraseña no cuentan (se rechazan por datos incompletos): tocar "Ingresar" con el formulario vacío no bloquea a nadie.
- **Por el portal la API no ve la IP del usuario:** Next.js reenvía `/api/v1` sin `X-Forwarded-For`, así que todos llegan con la IP del contenedor del portal (y esa cabecera no se puede tomar del navegador, porque se falsearía). Por eso:
  - el límite **por correo** rige siempre (por el portal, 5 por minuto para cada correo, venga de donde venga);
  - el límite **por IP** se aplica solo cuando la IP es real y se omite para IPs internas (`esIpInterna`), para que los intentos de uno no bloqueen el login de todos.
- Con el proxy HTTPS (Caddy, [4.1](#41-https)), las llamadas a `/api/v1` llegan a la API con `X-Forwarded-For`: la API confía en esa cabecera cuando viene de una red privada (`trust proxy`), así que los dos límites usan la IP real también desde el portal.
- Efecto secundario aceptado: quien conozca un correo puede bloquear su inicio de sesión desde **su misma IP** durante un minuto con 5 intentos fallidos. Se descartó un bloqueo de la cuenta por varios minutos sin importar la IP (18/10/2026), porque cualquiera podría dejar sin acceso a otro usuario a propósito. Si hiciera falta frenar intentos desde muchas IPs, la opción recomendada es pedir "No soy un robot" (Cloudflare Turnstile) después de unos fallos.
- Los contadores están en memoria: se reinician si se reinicia la API.

### 3.4. Swagger

- `SWAGGER: ${SWAGGER:-false}` en `deploy/nube/docker-compose.yml`. En la mini PC (red local) y en desarrollo sigue activo.
- "Sistema y APIs" muestra "Desactivada en este servidor por seguridad" en lugar del enlace.
- Para revisarla un momento: `SWAGGER=true` en `.env`, `docker compose up -d`, y luego volver a `false`.

### 3.5. Cabeceras de seguridad

- **API** (`helmet`): `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Strict-Transport-Security` (tendrá efecto con HTTPS), sin `X-Powered-By`. Sin CSP (la API no sirve páginas, salvo Swagger) y con `Cross-Origin-Resource-Policy: cross-origin` (el portal descarga fotos y archivos desde otro puerto).
- **Portal** (`next.config.ts`): `X-Frame-Options: DENY` y `Content-Security-Policy: frame-ancestors 'none'` (no se puede mostrar dentro de otro sitio), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` sin cámara, micrófono ni ubicación, y sin `X-Powered-By`.

### 3.6. Clave de equipos en tiempo constante

- `claveEquiposValida()` (`mollendo-api/src/common/seguridad/equipos.util.ts`) compara los hash SHA-256 con `timingSafeEqual`. La usan `ApiKeyGuard` y el canal del controlador.

### 3.7. Correcciones del 17 y 18/10/2026

**Inicio de sesión (17/10/2026)**

- Sesión en cookies `HttpOnly` en lugar de `localStorage` (`mollendo-api/src/auth/cookies-sesion.ts`). Rutas: `POST /auth/login` y `POST /auth/refresh-token` dejan las cookies; `POST /auth/cerrar-sesion` las borra; `GET /cuenta` dice quién tiene la sesión; `GET /auth/estado` (pública) solo dice qué cookies trae el navegador, sin validarlas, para no pedir `/cuenta` sin sesión (el 401 salía en rojo en la consola del navegador). El canal en vivo se autentica con la cookie. CORS con `credentials`.
- Contraseñas nuevas: al menos 10 caracteres, con letras y números (`mollendo-api/src/auth/password-segura.decorator.ts`); el portal y el manual lo dicen.
- Auditoría de inicios de sesión: acciones `inicio_sesion` e `inicio_sesion_fallido`, columnas `ip` y `detalle` ("correo · motivo": correo no registrado, contraseña incorrecta, cuenta de baja). Se ven en la página Auditoría y en su reporte.
- El formulario revisa antes de enviar (correo vacío o mal escrito, contraseña vacía) y los envíos sin datos no cuentan en el límite de intentos.

**Equipos y puerto 3001 (18/10/2026)**

- **IP de la sede para el G4 Pro:** variable `G4PRO_IPS_PERMITIDAS` (IPs separadas por coma; en Azure, `190.119.170.73`, fija según el usuario). `SerieG4Guard` exige el número de serie **y** que la conexión venga de esa IP. La IP se toma de la conexión (`socket.remoteAddress`), no de `X-Forwarded-For`, que cualquiera puede escribir. Rechazo: **403** y en el registro `Terminal rechazado: SN=… desde <IP> (la IP no está en G4PRO_IPS_PERMITIDAS)`. Vacía = cualquier IP (se avisa al arrancar la API).
- **El 3001 solo para el G4 Pro:** `atendidoPorPuertoDirecto` (`mollendo-api/src/common/seguridad/equipos.util.ts`, aplicado en `main.ts`): un pedido que llega directo desde internet solo se atiende si es `/iclock`; el resto responde **404**, salvo un navegador que abre una página (`GET` que acepta HTML): a ese se le redirige al portal por HTTPS (el primer origen `https://` de `CORS_ORIGIN`; `portalParaNavegador`). Lo que viene de la red interna se atiende normal: el proxy HTTPS (Caddy), el portal, la propia máquina y la red local de la mini PC.
- **Librerías:** `compression` 1.8.2 (fuga de memoria con conexiones cortadas) y `prisma`, `@prisma/client` y `@prisma/adapter-pg` 7.10.1 (`allowScripts` en `package.json` actualizado a esa versión). Quedan 2 avisos moderados en `exceljs` → `uuid`: la falla solo ocurre con un uso de `uuid` que exceljs no hace, y el "arreglo" de npm es bajar a exceljs 3.

> **Si el G4 deja de conectarse** después de un cambio de internet en la sede: `sudo docker compose logs api | grep "Terminal rechazado"` muestra la IP nueva. Ponerla en `G4PRO_IPS_PERMITIDAS` (`.env`) y `sudo docker compose up -d api` (ver `deploy/nube/README.md`).

---

## 4. Pendiente

### 4.1. HTTPS

**Hecho el 16/10/2026.** Sin HTTPS, quien esté en la misma red (o en el camino) puede ver contraseñas, sesiones y datos. Así quedó:

1. El dominio `accesos.monteazulsur.com.pe` (registro A en Cloudflare, "DNS only") apunta a `74.163.89.6`.
2. Contenedor `caddy` (`deploy/nube/Caddyfile`) con certificado de Let's Encrypt que se renueva solo; reenvía `/api/v1` a la API (con `X-Forwarded-For`) y lo demás al portal. HSTS de 1 año.
3. 80 y 443 abiertos en Azure; el 3000 del portal solo en la propia máquina.
4. `CORS_ORIGIN=https://accesos.monteazulsur.com.pe`; el controlador se conecta por `https://accesos.monteazulsur.com.pe`.
5. **Pendiente:** el G4 Pro sigue por HTTP en el puerto 3001 (no está confirmado que este modelo funcione con HTTPS). Lo que envía (resultados de rostro y alcohol, comandos) no lleva contraseñas, y el servidor solo acepta su número de serie desde la IP de la sede. Por el 3001 ya no se puede iniciar sesión ni leer datos.

### 4.2. Restringir el puerto 3001 por IP

**Hecho el 18/10/2026 en la API** ([3.7](#37-correcciones-del-17-y-18102026)): el puerto 3001 solo lo usa el G4 Pro (el controlador y el portal llegan por HTTPS). La IP de la sede es fija (`190.119.170.73`).

- Para saber la IP de la sede: desde su red, `curl -s ifconfig.me`; o en el servidor, `sudo tcpdump -nn -q -c 5 -i eth0 "tcp dst port 3001"`.
- **Opcional, además:** la misma regla en Azure → la máquina → Redes → grupo de seguridad de red → regla de entrada del puerto `3001`: origen `190.119.170.73/32` en lugar de "Any" (lo hace TMAM). Así esos pedidos ni siquiera llegan al servidor.

### 4.3. Otros

- **Proxy de Cloudflare (nube naranja):** el dominio ya está en Cloudflare, pero en "DNS only" (comprobado el 18/10/2026: apunta directo a `74.163.89.6` y las respuestas no traen `cf-ray`). Con la nube naranja, Cloudflare filtra ataques web, bots y DDoS antes de llegar al servidor, gratis. Lo activa TMAM: registro `accesos` en "Proxied", SSL/TLS en "Full (strict)" y "Always Use HTTPS" apagado (el servidor ya redirige y así el certificado se renueva). Antes, en el servidor: que Caddy confíe en las IP de Cloudflare para seguir viendo la IP real de cada usuario. El G4 no se afecta (entra por IP y puerto 3001).
- **Contraseñas de las 2 cuentas** (administrador y vigilancia): son anteriores a la regla de 10 caracteres (comprobado el 18/10/2026). Cambiarlas desde "Cambiar contraseña".
- **Respaldos legibles por cualquier usuario del servidor** (carpeta `backups/` con permisos 755 y archivos 644): solo importa si alguien más entra al servidor; conviene dejarlos solo para su dueño.
- `ufw` está inactivo en el servidor de Azure: el filtro lo hace el grupo de seguridad de red de Azure (abiertos 22, 80, 443 y 3001; el 3000 solo escucha en la propia máquina). En la mini PC, revisar que solo estén abiertos los puertos necesarios.
- Las 5 alertas de `npm audit` en herramientas de desarrollo del portal (eslint y similares) requieren versiones mayores; no se despliegan.

---

## 5. Lista de control por despliegue

- [ ] `.env` con claves generadas al azar (anexo B de la guía), permisos `600`, nunca en el repositorio.
- [ ] En la nube, `G4PRO_SN_PERMITIDOS` con el número de serie del G4 Pro y `G4PRO_IPS_PERMITIDAS` con la IP de la sede.
- [ ] En la nube, `SWAGGER` sin definir o en `false`.
- [ ] Contraseñas iniciales de `admin` y `vigilancia` cambiadas desde el portal después del primer ingreso, y `ADMIN_SEED_PASSWORD` / `VIGILANCIA_SEED_PASSWORD` borradas del `.env`.
- [ ] Respaldos copiados fuera del servidor.
- [ ] Security Group: solo 22, 80, 443 y 3001 (3001 restringido a la IP de la sede si es posible); la base de datos nunca publicada.
- [ ] SSH solo con llave.
- [ ] `npm audit --omit=dev` sin vulnerabilidades altas o críticas en `mollendo-api` y `mollendo-portal` antes de actualizar.
- [ ] Después de actualizar: las comprobaciones de la sección 6.

---

## 6. Cómo comprobar cada medida

Desde un equipo **fuera de la sede** (reemplazar `<servidor>` por la IP y `<dominio>` por `accesos.monteazulsur.com.pe`):

```bash
# 1. G4: número de serie no permitido, o desde otra IP que la de la sede -> 403
curl -s -o /dev/null -w "%{http_code}\n" -X POST "http://<servidor>:3001/iclock/registry?SN=PRUEBA000"

# 2. Puerto 3001 sin cifrar: el inicio de sesión y los datos no responden -> 404
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Content-Type: application/json" -d '{}' http://<servidor>:3001/api/v1/auth/login
curl -s -o /dev/null -w "%{http_code}\n" http://<servidor>:3001/api/v1/health

# 3. Límite de intentos: el sexto intento seguido con el mismo correo -> 429 (quedan 5 "inicio rechazado" en la Auditoría)
for i in 1 2 3 4 5 6; do
  curl -s -o /dev/null -w "%{http_code} " -H "Content-Type: application/json" \
    -d '{"correo":"prueba@prueba.com","password":"incorrecta"}' https://<dominio>/api/v1/auth/login
done; echo

# 4. Swagger apagado en la nube -> 404
curl -s -o /dev/null -w "%{http_code}\n" https://<dominio>/api/docs

# 5. Cabeceras (portal y API) y cookies de sesión HttpOnly; Secure; SameSite=Strict
curl -s -D - -o /dev/null https://<dominio>/iniciar-sesion | grep -i -E "x-frame|nosniff|referrer|permissions|strict-transport|powered"
curl -s -D - -o /dev/null https://<dominio>/api/v1/health | grep -i -E "x-frame|nosniff|powered"

# 6. ¿Pasa por el proxy de Cloudflare? Con la nube naranja aparece "cf-ray" y la IP no es la del servidor
nslookup <dominio> 1.1.1.1
curl -sI https://<dominio>/iniciar-sesion | grep -i -E "^(server|cf-ray)"
```

En el servidor, los rechazos del G4 quedan en el registro: `docker compose logs api | grep "Terminal rechazado"`.
