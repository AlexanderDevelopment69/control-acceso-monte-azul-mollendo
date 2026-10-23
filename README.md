# Sistema de Control de Accesos — Terminal Monte Azul Mollendo (TMAM)

Controla el ingreso y la salida del personal por los molinetes de la garita. En el ingreso, el sistema valida el DNI, el rostro, la prueba de alcohol y los documentos de la persona. Incluye un portal web de administración y un panel de vigilancia en tiempo real.

## Qué hay en cada carpeta

| Carpeta / archivo | Qué contiene |
|---|---|
| `mollendo-api/` | Backend (NestJS, Prisma, PostgreSQL). También el **controlador** de la garita (`src/controlador/`), que corre con la misma imagen |
| `mollendo-portal/` | Portal web (Next.js): administración, panel de vigilancia, dashboard, reportes |
| `deploy/` | **Cómo desplegar**: una carpeta por entorno (`nube/`, `controlador/`, `garita/`, `local/`), cada una con su `docker-compose.yml`, su `.env.example` y un README con los pasos. Empezar por [`deploy/README.md`](deploy/README.md) |
| `docs/` | Documentación (ver abajo) |
| `PROGRESO.md` | Estado del avance y bitácora de cambios |

## Documentación (`docs/`)

| Carpeta | Documentos |
|---|---|
| `docs/cliente/` | `Documento_Funcional_Control_Accesos_TMAM.md` (qué hace el sistema), `Contingencias_Equipos_Acceso.md` (qué pasa si falla un equipo), propuesta técnica y costo y plazo (`.docx`) |
| `docs/especificacion/` | Especificación de desarrollo: `_base` (alcance vigente), `_final` (alcance completo, para el futuro) y la primera versión |
| `docs/despliegue/` | `Registro_Despliegue_MiniPC.md`: guía completa de despliegue, operación, respaldos y equipos |
| `docs/revisiones/` | Revisiones del código: `Revision_Portal_2026-10-11.md` (sesión, canal en vivo, formularios) |
| `docs/seguridad/` | `Seguridad.md`: medidas de seguridad vigentes, revisión del 10/10/2026, pendientes (HTTPS, puerto 3001 por IP) y lista de control por despliegue |
| `docs/g4pro/` | `Protocolo_G4Pro_Referencia.md` (referencia técnica vigente del terminal facial) e `Historial_Integracion_G4Pro.md` (diseño, pruebas y hallazgos de la integración) |
| `docs/diagramas/` | Proceso de ingreso y salida (`ingreso.svg`, `salida.svg`, `Diagrama_Ingreso_Salida.html`) y arquitectura (`arquitectura_nube.svg`; el antiguo `arquitectura.svg` es de la etapa con AWS) |
| `docs/equipos/` | Fichas técnicas, manuales y guías de los equipos (alcoholímetro, lector de DNI, terminal facial, molinete) |

## Por dónde empezar

- **Desplegar o levantar el sistema:** [`deploy/README.md`](deploy/README.md).
- **Entender qué hace:** `docs/cliente/Documento_Funcional_Control_Accesos_TMAM.md` y los diagramas de `docs/diagramas/`.
- **Desarrollar:** `mollendo-api/README.md` y `mollendo-portal/README.md`.
