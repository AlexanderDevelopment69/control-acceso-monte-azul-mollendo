# Progreso — Sistema de Control de Acceso, Terminal de Mollendo

Referencia funcional completa: `Especificacion_Desarrollo_Control_Acceso_Mollendo.md`.
Este archivo es solo para llevar el estado de avance — no repite el detalle funcional.

Leyenda: `[ ]` pendiente · `[~]` en progreso · `[x]` hecho

---

## 0. Configuración inicial del proyecto

- [x] Estructura monorepo: `/mollendo-api` (NestJS) + `/mollendo-portal` (Next.js, template TailAdmin)
- [x] mollendo-api: NestJS instalado y corriendo (`npm run start:dev`) — probado, arranca en `http://localhost:3001` (puerto configurado en `.env`)
- [x] mollendo-portal: dependencias del template instaladas y corriendo (`npm run dev`) — probado, arranca en `http://localhost:3000`
- [x] Prisma 7.10.0 inicializado en mollendo-api (CLI y client alineados en la misma versión estable; el `latest` de npm apuntaba a un RC de Prisma 8, se evitó a propósito)
- [x] Esquema de base de datos (`schema.prisma`) a partir del script SQL de la especificación — 10 modelos + enums, `prisma validate` y `prisma generate` OK
- [x] Primera migración aplicada (`prisma migrate dev --name init`) — Postgres 16 vía Docker (dentro de WSL Ubuntu), 10 tablas creadas y verificadas
- [x] `.env.example` en mollendo-api y mollendo-portal (sin credenciales reales)
- [ ] Repositorio git inicializado (pendiente — el usuario lo hará manualmente)
- [x] `ConfigModule` (`@nestjs/config`) cargando `.env`, prefijo global `/api/v1`, CORS habilitado hacia mollendo-portal, puerto 3001 (api) / 3000 (portal) sin choque

## 1. mollendo-api — módulos NestJS

- [x] Módulo `auth` (login, activar-cuenta, recuperar/reset password, refresh-token, JWT) — probado end-to-end
- [x] Módulo `empresas` (alta, listado, detalle, editar/estado, invitar) — probado end-to-end
- [x] Módulo `personas` (alta, listado, detalle, editar, dar de baja/reactivar) — probado end-to-end, ownership por empresa
- [x] Módulo `tipos-documento` (catálogo) — probado end-to-end
- [x] Módulo `documentos` (subir/renovar con archivo real a disco, historial, aprobar/rechazar) — probado end-to-end
- [x] Módulo `puestos` (catálogo por caso + matriz de requisitos) — probado end-to-end
- [x] Módulo `solicitudes-visita` (registro, listado, reprogramar/cancelar) — probado end-to-end
- [x] Módulo `eventos-acceso` (ingreso, salida, motor de validación, anti-passback) — probado end-to-end, todos los casos de denegación
- [x] Módulo `integraciones` (webhook alcoholímetro, comando torniquete — **mock/stub**, proveedor real pendiente de definir con el cliente)
- [x] Módulo `panel` (resumen para vigilancia, WebSocket `/ws/eventos`, `/health`) — probado
- [x] Módulo `auditoria` — conectado a empresas/personas/documentos/puestos
- [x] Motor de validación de acceso (lógica crítica) — función pura en `validacion-acceso.engine.ts`, **9 tests unitarios con Vitest** (equivalente a Jest, ver bitácora), todos pasan
- [ ] Pruebas e2e de flujo ingreso/salida (hay smoke test manual end-to-end con curl, pero no un test automatizado e2e todavía)
- [x] Swagger/OpenAPI expuesto en `/api/docs` (solo fuera de producción)
- [x] Envío de correos (SMTP, Mailtrap/Ethereal en desarrollo) — cae a log si no hay SMTP configurado

## 2. mollendo-portal — portal y paneles

- [x] Adaptar layout base del template (sidebar por rol, header con usuario real y logout)
- [x] Login / activación de cuenta / recuperación de contraseña / reset de contraseña
- [x] Panel Administración: alta y gestión de empresas (crear, listar, invitar, activar/desactivar)
- [x] Panel Administración: catálogo de puestos y requisitos por puesto (matriz de checkboxes)
- [x] Panel Administración: catálogo de tipos de documento
- [x] Panel Administración: auditoría (vista completa, solo lectura)
- [x] Portal Empresa: gestión de su propio personal (alta, expediente, dar de baja/reactivar)
- [x] Portal Empresa: carga y aprobación/rechazo de documentos de su personal (subida real de archivo)
- [x] Portal Empresa: registro de solicitudes de visita (crear, cancelar)
- [x] Panel Vigilancia: vista en tiempo real (WebSocket) + resumen (denegaciones, alcohol no conforme, documentos vencidos) + historial
- [x] Panel Vigilancia: indicador de modo contingencia (polling a `/health` cada 15s)
- [ ] **Verificación interactiva en navegador real** — la extensión Claude en Chrome no estaba conectada en esta sesión, así que no se pudo hacer clic a través de los flujos. Se verificó: type-check limpio, lint limpio, todas las rutas devuelven 200 sin errores de render en el servidor, y el HTML servido contiene el contenido esperado. **Falta la prueba real de clic a clic — recomendado antes de dar por cerrado el frontend.**

## 3. Integraciones físicas (dependen de datos del cliente)

- [ ] Definir proveedor de alcoholímetro → implementar webhook real
- [ ] Definir marca/SDK del torniquete → implementar comando real
- [ ] Lector de DNI (código de barras) — integración en el flujo de ingreso

## 4. Infraestructura y despliegue

- [ ] Dockerfile + docker-compose (mollendo-api + mollendo-portal + PostgreSQL) para desarrollo
- [ ] Configuración de entornos (dev / staging / producción)
- [ ] Servidor local de contingencia: réplica Docker + cola de eventos offline + sincronización
- [ ] Backups (servidor + disco externo + nube)
- [ ] Despliegue en Azure o Hostinger (según decisión final de infraestructura)

## 5. Pendiente de confirmar con el cliente (bloquea trabajo relacionado)

- [ ] Catálogo de puestos por caso y documentos exigidos por cada uno
- [ ] Proveedor del alcoholímetro
- [ ] Equipo/marca del torniquete
- [ ] Horario límite para registrar solicitud de visita
- [ ] Proveedor final de infraestructura (Azure vs. Hostinger) y región

---

## Bitácora

- **2026-09-15** — Estructura inicial del monorepo creada y verificada:
  - `/frontend`: template TailAdmin (Next.js 16 + React 19 + TypeScript + Tailwind) movido a la raíz, `npm install` OK, `npm run dev` levanta en `http://localhost:3000`.
  - `/backend`: proyecto NestJS 12 generado con el CLI oficial. Nota: la versión actual de NestJS usa **Vitest + ESM** por defecto en vez de Jest/CommonJS — es funcionalmente equivalente a lo pedido en la spec ("Jest, incluido con NestJS"), se mantuvo el default del CLI en vez de forzar Jest.
  - Prisma 7.10.0 inicializado (CLI y `@prisma/client` fijados en la misma versión estable — el tag `latest` de npm apuntaba a un release candidate de Prisma 8, se evitó a propósito). Esquema completo (`prisma/schema.prisma`) traducido 1:1 desde el script SQL de la spec: 10 modelos, enums para los `CHECK` constraints, índices y relaciones. `prisma validate` y `prisma generate` corren sin errores.
  - `ConfigModule` cargando variables de entorno, prefijo global `/api/v1`, CORS hacia el frontend, puerto 3001 para no chocar con el frontend (3000).
  - `.env.example` creado en ambos proyectos.
  - Incidente resuelto: `npm install` en backend fallaba con `Cannot read properties of null (reading 'edgesOut')` (bug conocido de npm 10.9.8 con dependencias peer circulares de Vitest) — se resolvió actualizando npm global a 12.0.2.
  - `docker-compose.yml` creado en la raíz (servicio `postgres:16-alpine`). Docker no está instalado en Windows directamente — está dentro de la distro WSL Ubuntu del usuario, así que el contenedor se levanta con `wsl -d Ubuntu -- docker compose up -d` desde `/mnt/e/Proyecto Mollendo`. El puerto host se mapeó a **5433** (no 5432) porque ya había otro Postgres del usuario (`battlestackdota2-postgres`) ocupando 5432 — no se tocó ese contenedor.
  - Confirmado: el forwarding de puertos de WSL2 funciona out-of-the-box — npm/Prisma corriendo en Windows se conecta a `localhost:5433` sin configuración adicional.
  - Primera migración aplicada: `prisma migrate dev --name init` → 10 tablas creadas y verificadas con `psql \dt` dentro del contenedor.

- **2026-09-15** — Renombradas las carpetas `backend` → **`mollendo-api`** y `frontend` → **`mollendo-portal`** (nombres más descriptivos, alineados con la terminología de la spec: "Backend/API" y "portal web"). El renombrado se hizo con WebStorm abierto (Refactor → Rename desde la IDE), porque intentarlo por terminal daba "Device or resource busy" — WebStorm mantiene un handle sobre las carpetas del proyecto que bloquea el rename externo. `package.json` (`name`) y `package-lock.json` de ambos proyectos actualizados y resincronizados con `npm install`.

- **2026-09-15** — Implementados y probados de punta a punta los módulos `auth` y `empresas` en mollendo-api:
  - **Prisma 7 requiere un driver adapter explícito** (`@prisma/adapter-pg` + `pg`) — ya no basta con `DATABASE_URL`, el `PrismaClient` generado exige pasarle un `adapter` en el constructor. `PrismaService`/`PrismaModule` (global) creados sobre ese patrón.
  - **Se agregó el campo `rol`** (`RolUsuario`: `administracion` | `empresa` | `vigilancia`) a `Usuario` — no estaba en el script SQL original de la spec (sección 5.1), pero sin él no hay forma de distinguir los tres roles del sistema (sección 3.1) para autorización. Migración `add_usuario_rol` aplicada.
  - Guards globales (`JwtAuthGuard` + `RolesGuard` vía `APP_GUARD` en `AppModule`) en vez de `@UseGuards` repetido por módulo — evita el problema de que `PassportModule` solo era visible dentro de `AuthModule` y no en módulos feature como `EmpresasModule`. Rutas públicas (login, activar-cuenta, etc.) marcadas con `@Public()`.
  - `MailerModule` (nodemailer) — si no hay `SMTP_HOST` configurado (caso de desarrollo sin Mailtrap/Ethereal aún), loguea el correo en vez de fallar, para poder probar los flujos de invitación/recuperación sin SMTP real.
  - Seed inicial (`prisma/seed.ts`, `npm run db:seed`) — crea la empresa interna (OTP/MAS) y el primer usuario de Administración (`ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` en `.env`), único bootstrap posible ya que el resto de cuentas nace por invitación. Se ejecuta con `tsx` (no con `node` directo) porque el código generado por Prisma usa imports `.js` que Node no resuelve a los `.ts` fuente sin un loader.
  - Probado con curl end-to-end: login admin → crear empresa → invitar → activar cuenta con el token del correo (simulado en logs) → login como empresa → 403 al intentar una acción de Administración con rol `empresa` → refresh-token. Todo OK. Datos de prueba borrados de la BD al terminar.

- **2026-09-15** — Completado el resto del backend (`personas`, `tipos-documento`, `puestos`, `documentos`, `solicitudes-visita`, `eventos-acceso` con el motor de validación, `integraciones`, `panel`, `auditoria`) y probado de punta a punta con un flujo curl completo (crear empresa → invitar → activar → crear tipo de documento y puesto con requisito obligatorio → crear persona → intentar ingreso sin documento [denegado] → subir documento [aún denegado, pendiente de aprobar] → aprobar → alcohol no conforme [denegado] → todo conforme [autorizado] → salida [autorizado] → salida de nuevo [denegado, anti-passback] → dar de baja → ingreso [denegado por baja, prioridad sobre lo demás] → panel/resumen → health → solicitud de visita → llamar a eventos-acceso sin api-key [401]). Todos los casos salieron como se esperaba.
  - **Ownership por empresa**: en `personas`, `documentos` y `solicitudes-visita`, un usuario con rol `empresa` solo puede ver/gestionar lo que pertenece a su propia `empresaId` (forzado en el service, no confiando en lo que mande el query/body) — Administración ve todo. `Vigilancia` tiene lectura en `personas`/`documentos` (para poder identificar a alguien durante una denegación) aunque la spec no lo detalla explícitamente en la tabla de roles — es una decisión práctica, no textual de la spec.
  - **Autenticación de equipos físicos**: el lector DNI/alcoholímetro/torniquete no son "usuarios" del portal (no tienen JWT). Se creó `ApiKeyGuard` + variable `DEVICE_API_KEY` para `/eventos-acceso/ingreso`, `/eventos-acceso/salida` y el webhook del alcoholímetro — no estaba especificado así en la spec, era un vacío necesario para que esos endpoints tuvieran algún control de acceso.
  - **Motor de validación** (`validacion-acceso.engine.ts`): función pura sin I/O — recibe si la persona está activa, si el alcohol es conforme, y los documentos requeridos vs. los vigentes+aprobados, y devuelve la decisión con los motivos. 9 tests unitarios cubren: autorizado, baja (prioridad sobre todo lo demás), solo alcohol, solo documentos, ambos motivos a la vez, y sin puesto asignado (autoriza porque no hay reglas que evaluar, dado que el catálogo de puestos sigue pendiente del cliente). Anti-passback (`evaluarSalida`) también es una función pura, con sus propios tests.
  - **Subida de documentos**: implementada de verdad (no un placeholder) — `multer` guarda el archivo en `DOCUMENTOS_STORAGE_PATH/persona-{id}/`, como pide la spec ("disco del propio servidor, no object storage externo"). `storage/` agregado a `.gitignore`.
  - **Integraciones (`alcoholimetro/webhook`, `torniquete/comando`)**: son **stubs** que solo loguean el payload — el proveedor real de ambos sigue sin definirse (spec, sección 12), así que quedan como contrato provisional tal como pide la spec, no conectados todavía a ningún hardware ni SDK real.
  - **WebSocket `/ws/eventos`**: implementado con `@nestjs/websockets` + Socket.IO, autenticado por JWT en el handshake (`administracion`/`vigilancia` únicamente), desacoplado de `eventos-acceso` vía `EventEmitter2` (`@nestjs/event-emitter`) para no crear una dependencia circular entre módulos. No se probó todavía con un cliente WebSocket real, solo se verificó que el servidor arranca y expone el namespace sin errores.
  - `/panel/resumen` cuenta denegaciones del día, alcohol no conforme del día y documentos vencidos (aproximado: no dedupe por "última versión del documento", cuenta filas — aceptable para un widget resumen, no para un reporte legal).
  - Swagger agregado en `/api/docs` (bearer auth + api-key documentados), deshabilitado en producción.
  - Suite completa (`npx vitest run`): 10/10 tests OK. `npm run lint` (oxlint) y `npm run build` (tsc) sin errores.
  - Pendiente real: no hay un test e2e automatizado (solo el smoke test manual con curl de arriba) — sección 10 de la spec lo pide explícitamente, queda para una siguiente pasada.

- **2026-09-15** — Construido el frontend completo (mollendo-portal) sobre el template TailAdmin: base de autenticación y las pantallas de los 3 roles.
  - **Base**: `lib/api/client.ts` (fetch con manejo de JWT, refresh automático en 401, `ApiError`), `lib/api/endpoints.ts` (una función tipada por cada endpoint del backend), `lib/api/types.ts` (tipos espejo de las entidades). `AuthContext` decodifica el JWT en el cliente (sin verificar firma, eso lo hace el backend) para saber `rol`/`empresaId` sin otra llamada. `RequireRole` protege rutas por rol y redirige a `/signin` si no hay sesión.
  - **Sidebar y header** reescritos: navegación filtrada por rol (`AppSidebar`), `UserDropdown` muestra el correo/rol real y cierra sesión de verdad (antes eran datos de ejemplo del template). Se quitó el buscador falso y las notificaciones de ejemplo del header, y la página de `signup` (no aplica — las cuentas nacen por invitación, no hay registro público).
  - **Auth**: `/signin`, `/activar-cuenta`, `/recuperar-password`, `/reset-password` — reescritos sobre los componentes de formulario del template, ahora conectados de verdad al backend.
  - **Administración**: `/empresas` (alta + invitar + activar/desactivar), `/puestos` (alta + modal de matriz de requisitos con checkboxes), `/tipos-documento` (alta + listado), `/auditoria` (solo lectura).
  - **Empresa**: `/personal` (alta de trabajador/visita) y `/personal/[id]` (expediente: datos, dar de baja/reactivar, subir documento con archivo real, aprobar/rechazar), `/visitas` (alta + cancelar solicitud).
  - **Vigilancia**: `/vigilancia` — tarjetas de resumen, feed de eventos en tiempo real vía WebSocket (`socket.io-client`, con el JWT en el handshake), tabla de historial, y un indicador de "modo contingencia" que hace polling a `/health` cada 15s.
  - Todas las páginas hacen el "ownership" visual acorde al backend (ej. una empresa solo ve botones de gestión sobre su propio personal), aunque la autorización real ya está forzada del lado del servidor — esto es solo para no mostrar botones que darían 403.
  - Componente `TableCell` del template ampliado con `colSpan` (no lo soportaba) y `children` opcional (para columnas de acciones sin encabezado de texto) — cambios mínimos, necesarios para reusar la tabla en todas las listas.
  - `npx tsc --noEmit` limpio. `npm run lint`: 4 errores preexistentes del propio template (no tocados en esta sesión) + 1 en `AuthContext.tsx` que es un falso positivo de una regla experimental de React (`set-state-in-effect`) — el patrón de leer `localStorage` después del montaje es el correcto para no romper la hidratación SSR, se dejó así a propósito.
  - **No se pudo probar clic a clic en un navegador real**: la extensión "Claude en Chrome" no estaba conectada en esta sesión. Se verificó en su lugar que las 12 rutas del portal responden 200 sin errores de servidor y que el HTML contiene el contenido esperado — pero no reemplaza una prueba interactiva real (llenar formularios, ver que las tablas pinten datos, probar el WebSocket en vivo, etc.).

- **2026-09-15** — Agregadas cuentas DEMO de Vigilancia y Empresa al seed (`prisma/seed.ts`), para que el usuario pueda probar los 3 roles en el navegador sin tener que pasar por el flujo real de invitación por correo (que requiere leer el token del log porque no hay SMTP configurado en dev). **Estas cuentas demo no deben crearse en producción** — ahí sí corresponde que Vigilancia y Empresa nazcan por invitación real. Credenciales (todas con contraseña `Cambiar123!` por defecto, definibles en `.env`):
  - Administración: `admin@mollendo.local`
  - Vigilancia: `vigilancia@mollendo.local`
  - Empresa (demo, RUC `20000000001` "Empresa Demo SAC"): `empresa@mollendo.local`
  - Las 3 verificadas con login real vía curl.

- **2026-09-15** — A pedido del usuario: nueva sección **"Sistema y APIs"** en el panel de Administración (`/sistema`, solo admin).
  - Backend: `GET /panel/estado-sistema` (admin) — reporta si el backend responde, latencia de la base de datos, y si SMTP/`DEVICE_API_KEY` están configurados (no verifica hardware real, ya que el proveedor de alcoholímetro/torniquete sigue sin definirse). `GET /health` (ya existía, pública) se le agregaron `latenciaMs` y `fecha`.
  - Frontend: tarjetas de estado (backend, base de datos, SMTP, clave de equipos) que se refrescan solas cada 15s, más la **documentación interactiva de Swagger embebida directamente en la página** (`iframe` a `/api/docs`, que ya existía en el backend pero solo era accesible entrando directo por esa URL) con un link para abrirla aparte.
  - Confirmado que Swagger no manda `X-Frame-Options`/CSP restrictiva, así que el iframe funciona sin configuración adicional.
  - Ajustado según feedback del usuario: se quitó el iframe de Swagger (no era necesario embeberlo), se agregó en su lugar una **tabla de APIs de integración** (ingreso, salida, webhook alcoholímetro, comando torniquete) separada de la tarjeta de "Documentación de la API" (que se mantuvo, solo con el link a Swagger). Cada fila de la tabla es **desplegable** (clic para expandir): muestra headers, ejemplo de request, ejemplo de respuesta (casos éxito y error) y una nota de uso — pensado para que cualquiera entienda cómo consumir esas APIs sin tener que ir a Swagger. `TableRow` del template se amplió con `onClick` (no lo soportaba).
  - Animación de despliegue con la técnica de "acordeón fluido" con CSS Grid (`grid-rows-[0fr]` → `grid-rows-[1fr]`, 300ms, contenido con fade-in) en vez de mostrar/ocultar abrupto.
  - **Bug de layout reportado por el usuario, no relacionado con lo anterior**: al desplegar una fila la página se vuelve más alta que el viewport, aparece la barra de scroll vertical, y como esa barra le quita ancho al contenido, todo se corría hacia la izquierda (y volvía a moverse al contraer). Corregido de forma global (no solo en esta página) agregando `scrollbar-gutter: stable` en `html` (`globals.css`) — reserva el espacio de la barra siempre, esté visible o no, así el contenido no se mueve nunca.
  - **Íconos de las tarjetas de estado recortados — causa raíz encontrada con el navegador conectado**: SVGO (que corre dentro de `@svgr/webpack`, usado para importar `.svg` como componentes React) quita el `viewBox` de un ícono cuando su `width`/`height` originales coinciden exactamente con el `viewBox` — una optimización de `preset-default` (`removeViewBox`). Sin `viewBox`, el ícono no tiene cómo reescalar su dibujo interno: al forzarle un tamaño distinto al original (20×20 en vez de sus 24×24 o 24×26 nativos) el contenido se recortaba en los bordes en vez de encogerse. Pasar `width`/`height` explícitos (intento anterior) no alcanzaba porque el problema no era el tamaño del ícono sino la falta de `viewBox` para reescalarlo. Arreglado en `next.config.ts`, desactivando `removeViewBox` en la config de SVGO tanto para el loader de webpack como el de Turbopack — corrige el problema para **todos** los íconos del proyecto que se usen a un tamaño distinto al original, no solo estos 4. Confirmado con el navegador conectado: se inspeccionaron los elementos `<svg>` reales en el DOM (el `viewBox` venía `null` antes del fix, presente después) y se comparó visualmente con capturas de pantalla antes/después.
  - **Inconsistencia de estilo entre íconos, detectada por el usuario después del fix anterior**: casi todo el set de íconos (sidebar incluido) usa la técnica "relleno sólido con silueta hueca" (`fill="currentColor"` + `fill-rule="evenodd"`), pero `BoltIcon` (rayo) es de trazo/línea (`stroke`) — un estilo distinto. Se usaba en 2 lugares: sidebar ("Panel de vigilancia") y tarjeta "Backend". Reemplazado por `CheckCircleIcon` (tarjeta Backend, más apropiado semánticamente para "estado/salud") y `EyeIcon` (sidebar Vigilancia, más apropiado para "vigilancia/monitoreo"), ambos ya en el estilo consistente. De paso, `lock.svg` tenía un `fill="#667085"` fijo en un trazo (no usaba `currentColor`) que no respetaba tema oscuro/claro — corregido.
  - **Pedido final del usuario: que las tarjetas fueran pixel-idénticas al patrón de tarjeta que ya trae el template** (el de `components/ecommerce/EcommerceMetrics.tsx`), no una variante propia. Ajustado `StatusCard`: `rounded-xl` → `rounded-2xl`, `p-5` → `p-5 md:p-6`, caja de ícono `h-11 w-11 rounded-lg` → `h-12 w-12 rounded-xl`, ícono con clase `size-6` (24px, iguial que el template) en vez de props `width={20} height={20}` — ya seguro de usar clases de Tailwind para el tamaño gracias al fix del `viewBox` de la vuelta anterior.
