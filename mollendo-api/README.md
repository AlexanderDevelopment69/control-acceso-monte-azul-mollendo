# mollendo-api

Backend del Sistema de Control de Accesos · Terminal Monte Azul Mollendo (TMAM), alcance base.

- Reglas de negocio (motor de validación del ingreso), datos del personal, empresas, documentos y fotos.
- API REST bajo `/api/v1` para el portal y para los equipos de garita (con la clave de equipo `X-API-Key`).
- Eventos de ingreso y salida en tiempo real (Socket.IO, `/ws/eventos`).
- Dashboard de indicadores y reportes en Excel o PDF.

Hecho con NestJS 12 sobre Node.js 22, Prisma 7 y PostgreSQL 16. Los reportes se generan con ExcelJS y pdfmake; el de documentos también como ZIP con sus archivos (archiver).

## Desarrollo

Requisitos: Node.js 22, npm 12 y una base PostgreSQL 16.

```bash
npm install
cp .env.example .env      # completar los valores
npx prisma migrate deploy # crea o actualiza las tablas
npm run db:seed           # cuentas iniciales (Administrador y Vigilancia)
npm run start:dev         # http://localhost:3001 (documentación en /api/docs)
```

Variables principales (ver `.env.example`):

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` y sus duraciones | Sesiones del portal |
| `PORT`, `CORS_ORIGIN` | Puerto del servidor y orígenes permitidos |
| `DOCUMENTOS_STORAGE_PATH` | Carpeta de documentos y fotos |
| `ADMIN_SEED_*`, `VIGILANCIA_SEED_*` | Cuentas que crea `db:seed` |
| `DEVICE_API_KEY` | Clave de los equipos de garita |

La zona horaria es la de Lima (`src/common/zona-horaria.ts`); los días de los filtros, la vigencia de los documentos y los reportes se calculan con ella.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run start:dev` | Servidor de desarrollo con recarga |
| `npm run build` | Compilación de producción (`dist/`) |
| `npm test` | Pruebas automáticas (Vitest) |
| `npm run lint` | Revisión del código (oxlint) |
| `npm run db:seed` | Crea las cuentas iniciales |
| `npm run simular` | Simulador de garita: envía ingresos y salidas al backend (`-- --limpiar` los borra) |

## Datos de demostración

Para mostrar el sistema sin datos reales:

- `npx tsx prisma/datos-demo.ts`: 6 empresas DEMO y 56 personas con foto y documentos, por la API, y los ingresos y salidas de hoy.
- `npx tsx prisma/historial-demo.ts`: 30 días de ingresos y salidas del personal DEMO, directo en la base (para los gráficos del Dashboard).
- `prisma/limpiar-demo.sh`: borra todo lo DEMO (en el servidor).

Detalle y variables en la guía de despliegue (sección 8b).

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/auth`, `src/usuarios` | Inicio de sesión, sesiones, cambio de contraseña y cuentas |
| `src/empresas`, `src/personas`, `src/documentos`, `src/tipos-documento` | Empresas, personal, fotos y documentos |
| `src/eventos-acceso` | Ingresos y salidas, motor de validación y espera del terminal facial (habilitación por DNI, una persona a la vez) |
| `src/integraciones` | Equipos de garita: relés USB de los molinetes (`rele-usb.service.ts`) y registro y habilitación de personas en el G4 Pro |
| `src/push-sdk` | Protocolo PUSH del G4 Pro (variante de control de acceso): rutas `/iclock/*`, cola de comandos y resultados |
| `src/lectores-dni` | Lectores de DNI por RS232 (Syble XB-7705H) |
| `tools/rele-usb.c` | Programa que envía los comandos HID al módulo de relés (se compila en la imagen Docker) |
| `src/panel` | Panel de vigilancia, Dashboard, estado del sistema y canal en tiempo real |
| `src/reportes` | Reportes en Excel y PDF |
| `src/auditoria` | Registro de cambios |
| `prisma` | Esquema, migraciones, cuentas iniciales, simulador y datos de demostración |

## Despliegue

En la mini PC corre en un contenedor de Docker (`Dockerfile`) y aplica las migraciones al arrancar. La guía completa está en `../docs/despliegue/Registro_Despliegue_MiniPC.md`.
