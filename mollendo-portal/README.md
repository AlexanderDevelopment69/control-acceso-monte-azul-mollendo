# mollendo-portal

Portal web del Sistema de Control de Accesos · Terminal Monte Azul Mollendo (TMAM), alcance base.

- **Administrador:** registra empresas, personal (con foto) y sus documentos; consulta la auditoría y el estado del sistema.
- **Vigilancia:** ve en tiempo real cada ingreso y salida por los molinetes, con el motivo cuando se deniega.

Hecho con Next.js 16, React 19 y Tailwind CSS 4. Toda la lógica y los datos están en el backend (`../mollendo-api`).

## Desarrollo

Requisitos: Node.js 22 y npm 12, con el backend corriendo en `http://localhost:3001`.

```bash
npm install
npm run dev        # http://localhost:3000
```

Variables (en `.env.local`):

| Variable | Valor | Para qué |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `/api/v1` | El portal llama a la API por su mismo dominio y la reenvía al backend (`next.config.ts`). También se puede usar `http://localhost:3001/api/v1` para llamar al backend directo. |
| `API_INTERNAL_URL` | `http://localhost:3001` (por defecto) | Dónde está el backend visto desde el servidor del portal. En Docker es `http://api:3001`. |

El portal reenvía al backend `/api/v1/*` (incluida la conexión de tiempo real) y `/api/docs` (Swagger).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción (servidor autónomo en `.next/standalone`) |
| `npm run lint` | Revisión del código con ESLint |

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/app/(admin)` | Pantallas con sesión: Personal y documentos, Panel de vigilancia, Auditoría, Sistema y APIs, Manual |
| `src/app/(full-width-pages)` | Inicio de sesión |
| `src/components/personal` | Alta de personal, ficha, documentos y foto |
| `src/components/header` | Menú del usuario y cambio de contraseña |
| `src/lib/api` | Cliente de la API (tokens, renovación de sesión) y endpoints |
| `src/lib/auth` | Sesión, roles y protección de pantallas |

## Despliegue

En la mini PC corre en un contenedor de Docker (`Dockerfile`). La guía completa está en `../Registro_Despliegue_MiniPC.md`.

## Créditos

La base visual (layout, menú y componentes de interfaz) parte de la plantilla libre TailAdmin, con licencia MIT (ver `LICENSE`).
