# Seguridad del sistema de control de accesos

Revisión de seguridad del 10/10/2026 (API, portal, servidor de AWS y librerías), lo que se corrigió y lo que queda pendiente. Al final hay una lista de control para revisar en cada despliegue.

> **Estado al 11/10/2026:** el **programa** (API y portal) no tiene problemas de seguridad graves conocidos. Lo que falta para que el sistema en funcionamiento sea seguro es de la **instalación**: HTTPS, cambiar las contraseñas iniciales y guardar los respaldos fuera del servidor (ver [sección 0](#0-estado-actual)).

## Contenido

0. [Estado actual](#0-estado-actual)
1. [Resumen](#1-resumen)
2. [Medidas vigentes](#2-medidas-vigentes)
3. [Correcciones del 10/10/2026](#3-correcciones-del-10102026)
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
| Contraseñas | Cifradas con bcrypt, mínimo 8 caracteres, nunca en texto plano |
| Inicio de sesión | Límite de intentos (5 por minuto por correo) |
| Sesiones | 1 hora, renovables hasta 7 días; se cortan al instante (también el panel en vivo) al dar de baja la cuenta o cambiar la contraseña |
| Permisos | Cada ruta de la API exige sesión y rol; el vigilante no ve documentos ni pantallas de administrador aunque escriba la dirección |
| Equipos | Ingreso, salida y controlador con clave (comparada en tiempo constante); el G4 Pro, solo con su número de serie autorizado |
| Archivos | Solo PDF, imágenes y Word, con tamaño máximo y nombre aleatorio en disco |
| Datos de entrada | Validados en la API; sin inyección SQL (consultas parametrizadas) ni HTML inyectable en el portal |
| Navegador | Cabeceras de seguridad; el portal no se puede mostrar dentro de otro sitio |
| Librerías | Sin vulnerabilidades conocidas en lo que se instala en el servidor |
| Trazabilidad | Auditoría de todos los cambios |

**Límites conocidos** (ningún sistema es 100 % seguro):

- **El G4 Pro no manda clave:** el protocolo de ZKTeco no lo permite; el número de serie es la única identificación posible en el código. Por eso se recomienda cerrar el puerto 3001 por IP ([4.2](#42-restringir-el-puerto-3001-por-ip)).
- **Renovación de sesión de 7 días sin lista de revocación:** si alguien robara el token de renovación de un navegador, podría usarlo hasta que venza, salvo que se cambie la contraseña o se dé de baja la cuenta. Es el diseño habitual; se podría endurecer guardando las sesiones en la base para revocarlas una por una.
- **Sin verificación en dos pasos (2FA)** para el administrador.
- **Sesión en `localStorage`** ([4.3](#43-otros)).
- **Revisión de código, no prueba de penetración:** si el cliente la exige, debe hacerla un tercero especializado.

### 0.2. La instalación

| Prioridad | Pendiente | Quién | Estado |
|---|---|---|---|
| 🔴 | **Contraseñas iniciales sin cambiar en AWS:** `admin@mollendo.local` y `vigilancia@mollendo.local` entran con la contraseña generada al instalar, que está en texto plano en el `.env` del servidor (comprobado el 11/10/2026). Cambiarlas desde el portal (menú del usuario → "Cambiar contraseña") y después borrar `ADMIN_SEED_PASSWORD` y `VIGILANCIA_SEED_PASSWORD` del `.env` (solo sirven para crear las cuentas la primera vez) | Administrador del portal; luego soporte | Pendiente |
| 🔴 | **HTTPS** ([4.1](#41-https)) | Cliente (dominio), luego soporte | Esperando el dominio |
| 🟠 | **Respaldos fuera del servidor:** hoy los respaldos diarios están en el mismo disco del servidor de AWS; si se pierde o se compromete, se pierden datos y respaldos. Opciones: copias automáticas del disco (AWS Data Lifecycle Manager, desde la consola) o copiar cada respaldo a un bucket S3 | Quien administre AWS | Pendiente |
| 🟠 | **Puerto 3001 solo para la IP del terminal** ([4.2](#42-restringir-el-puerto-3001-por-ip)) | Quien administre AWS | Pendiente (requiere IP fija) |
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
| 7 | Sin HTTPS: contraseñas y datos viajan sin cifrar | Alto | ⏳ Pendiente: se espera el dominio del cliente ([4.1](#41-https)) |

---

## 2. Medidas vigentes

**Cuentas y sesiones**

- Contraseñas guardadas con bcrypt (nunca en texto plano), mínimo 8 caracteres.
- Sesión firmada (JWT) de 1 hora, renovable hasta 7 días con un token aparte (`JWT_REFRESH_SECRET`, distinto de `JWT_SECRET`).
- En **cada pedido** se comprueba que la cuenta siga activa: dar de baja a un usuario lo saca de inmediato. Al cambiar la contraseña se cierran las demás sesiones.
- Límite de intentos de inicio de sesión (sección 3).
- **Canal en vivo** (`/ws/eventos`, Panel de vigilancia y Dashboard): al conectarse se comprueba lo mismo que en la API (token válido, rol, cuenta activa, sin cambio de contraseña posterior). Al dar de baja una cuenta o cambiar/restablecer su contraseña, el servidor corta sus conexiones abiertas (evento interno `usuario.sesiones-cerradas`).

**Permisos**

- Todas las rutas exigen sesión por defecto (guarda global `JwtAuthGuard`); las públicas se marcan una por una con `@Public()`.
- Cada ruta declara sus roles (`RolesGuard`), aplicados en la API y no solo en el portal. El vigilante no puede descargar documentos (la API responde 403).
- Solo dos rutas aceptan cualquier rol con sesión: cambiar la propia contraseña y la lista de tipos de documento.

**Equipos**

- Ingreso, salida, la lista del personal y el canal del controlador (WebSocket) exigen la clave de equipos (`X-API-Key` / `DEVICE_API_KEY`), comparada en tiempo constante.
- El G4 Pro (`/iclock/*`) solo es atendido si su número de serie está en `G4PRO_SN_PERMITIDOS` (sección 3).

**Archivos**

- Solo PDF, JPG, PNG, WEBP y Word, con tamaño máximo. Se validan antes de escribirse en disco.
- Se guardan con nombre aleatorio (UUID) dentro de `persona-{id}/`: el nombre que manda el usuario nunca forma parte de la ruta.
- Se sirven con el tipo según la extensión guardada, no según lo que declaró quien los subió.

**Datos de entrada**

- Validación en la API (`class-validator`, `whitelist` + `forbidNonWhitelisted`: se rechazan campos no esperados).
- Base de datos con Prisma (consultas parametrizadas: sin inyección SQL).
- El portal no inserta HTML sin escapar (`dangerouslySetInnerHTML` no se usa).

**Servidor (AWS)**

- SSH solo con llave (sin contraseña, sin root).
- Puertos abiertos: 22, 3000 y 3001. La base de datos (5432) no está publicada.
- `.env` con permisos `600`; claves largas generadas al azar (ver anexo B de la guía de despliegue).
- Respaldo diario y antes de cada actualización.
- Ningún `.env` ni llave en el repositorio ni en su historial.

**Auditoría**

- Se registra quién creó, modificó o eliminó cada dato y cuándo.

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
- Al pasarse responde **429** "Demasiados intentos de inicio de sesión. Espera un minuto y vuelve a intentarlo.", que el portal muestra tal cual.
- **Por el portal la API no ve la IP del usuario:** Next.js reenvía `/api/v1` sin `X-Forwarded-For`, así que todos llegan con la IP del contenedor del portal (y esa cabecera no se puede tomar del navegador, porque se falsearía). Por eso:
  - el límite **por correo** rige siempre (por el portal, 5 por minuto para cada correo, venga de donde venga);
  - el límite **por IP** se aplica solo cuando la IP es real (pedidos directos a la API, como los del puerto 3001) y se omite para IPs internas (`esIpInterna`), para que los intentos de uno no bloqueen el login de todos.
- Cuando se ponga el proxy HTTPS ([4.1](#41-https)), configurarlo para que envíe `X-Forwarded-For`: la API ya confía en esa cabecera cuando viene de la propia máquina o de una red privada (`trust proxy`), y los dos límites pasarán a usar la IP real también por el portal.
- Efecto secundario aceptado: quien conozca un correo puede bloquear su inicio de sesión durante un minuto con 5 intentos fallidos.
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

---

## 4. Pendiente

### 4.1. HTTPS

Sin HTTPS, quien esté en la misma red (o en el camino) puede ver contraseñas, sesiones y datos. Se habilitará cuando el cliente tenga su dominio:

1. Apuntar el dominio (registro A) a la IP del servidor.
2. Poner un proxy con certificado automático (Caddy o Nginx + Let's Encrypt) delante del portal y de la API, en un contenedor más, que envíe `X-Forwarded-For` (para el límite de intentos por IP, ver 3.3).
3. Abrir 80 y 443 en el Security Group y cerrar 3000 desde afuera.
4. Cambiar `CORS_ORIGIN` a `https://<dominio>` y la dirección del servidor en el G4 Pro y en el controlador.

### 4.2. Restringir el puerto 3001 por IP

El puerto 3001 lo usan solo el G4 Pro y el controlador (el portal llega a la API por dentro, por el puerto 3000). Si la conexión a internet del terminal tiene **IP pública fija**:

- AWS → EC2 → Security Groups → Inbound rules → regla del puerto `3001`: cambiar el origen `0.0.0.0/0` por `<IP pública del terminal>/32`.
- Así nadie más puede llegar a `/iclock` ni a las rutas con clave de equipos, aunque conozca el número de serie o la clave.
- Para saber la IP: desde la red del terminal, `curl -s ifconfig.me`.

Si la IP no es fija, queda como protección el número de serie permitido (3.1) y la clave de equipos.

### 4.3. Otros

- Las sesiones del portal se guardan en el navegador (`localStorage`). Es aceptable porque el portal no inserta HTML sin escapar; si en el futuro se agrega contenido de terceros, conviene pasar a cookies `HttpOnly`.
- `ufw` está inactivo en el servidor de AWS: el filtro lo hace el Security Group. En la mini PC, revisar que solo estén abiertos los puertos necesarios.
- Las 5 alertas de `npm audit` en herramientas de desarrollo del portal (eslint y similares) requieren versiones mayores; no se despliegan.

---

## 5. Lista de control por despliegue

- [ ] `.env` con claves generadas al azar (anexo B de la guía), permisos `600`, nunca en el repositorio.
- [ ] En la nube, `G4PRO_SN_PERMITIDOS` con el número de serie del G4 Pro.
- [ ] En la nube, `SWAGGER` sin definir o en `false`.
- [ ] Contraseñas iniciales de `admin` y `vigilancia` cambiadas desde el portal después del primer ingreso, y `ADMIN_SEED_PASSWORD` / `VIGILANCIA_SEED_PASSWORD` borradas del `.env`.
- [ ] Respaldos copiados fuera del servidor.
- [ ] Security Group: solo 22, 3000 y 3001 (3001 restringido por IP si es posible); la base de datos nunca publicada.
- [ ] SSH solo con llave.
- [ ] `npm audit --omit=dev` sin vulnerabilidades altas o críticas en `mollendo-api` y `mollendo-portal` antes de actualizar.
- [ ] Después de actualizar: las comprobaciones de la sección 6.

---

## 6. Cómo comprobar cada medida

Desde cualquier equipo (reemplazar `<servidor>`):

```bash
# 1. Número de serie no permitido -> 403
curl -s -o /dev/null -w "%{http_code}\n" -X POST "http://<servidor>:3001/iclock/registry?SN=PRUEBA000"

# 3. Límite de intentos: el sexto intento seguido con el mismo correo -> 429
for i in 1 2 3 4 5 6; do
  curl -s -o /dev/null -w "%{http_code} " -H "Content-Type: application/json" \
    -d '{"correo":"prueba@prueba.com","password":"incorrecta"}' http://<servidor>:3001/api/v1/auth/login
done; echo

# 4. Swagger apagado en la nube -> 404
curl -s -o /dev/null -w "%{http_code}\n" http://<servidor>:3001/api/docs

# 5. Cabeceras
curl -s -D - -o /dev/null http://<servidor>:3000/iniciar-sesion | grep -i -E "x-frame|nosniff|referrer|permissions|powered"
curl -s -D - -o /dev/null http://<servidor>:3001/api/v1/health | grep -i -E "x-frame|nosniff|powered"
```

En el servidor, el rechazo del punto 1 queda en el registro: `docker compose logs api | grep "Terminal rechazado"`.
