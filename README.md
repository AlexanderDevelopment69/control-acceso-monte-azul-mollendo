# Sistema de Control de Accesos — Terminal Monte Azul Mollendo (TMAM)

Controla el ingreso y la salida del personal por los molinetes de la garita. En el ingreso, el sistema valida el DNI, el rostro, la prueba de alcohol y los documentos de la persona. Incluye un portal web de administración y un panel de vigilancia en tiempo real.

## Qué hay en cada carpeta

| Carpeta / archivo | Qué contiene |
|---|---|
| `mollendo-api/` | Backend (NestJS, Prisma, PostgreSQL). También el **controlador** de la garita (`src/controlador/`), que corre con la misma imagen |
| `mollendo-portal/` | Portal web (Next.js): administración, panel de vigilancia, dashboard, reportes |
| `deploy/` | **Cómo desplegar**: plantillas de configuración por entorno (nube, controlador, garita) y el script de respaldo. Empezar por [`deploy/README.md`](deploy/README.md) |
| `docker-compose.yml` | PostgreSQL para desarrollo local |
| `docker-compose.prod.yml` | Servidor completo en contenedores (nube o garita) |
| `docker-compose.controlador.yml` | Mini PC de la garita como controlador |
| `docs/` | Documentación (ver abajo) |
| `PROGRESO.md` | Estado del avance y bitácora de cambios |

## Documentación (`docs/`)

| Carpeta | Documentos |
|---|---|
| `docs/cliente/` | `Documento_Funcional_Control_Accesos_TMAM.md` (qué hace el sistema), `Contingencias_Equipos_Garita.md` (qué pasa si falla un equipo), propuesta técnica y costo y plazo (`.docx`) |
| `docs/especificacion/` | Especificación de desarrollo: `_base` (alcance vigente), `_final` (alcance completo, para el futuro) y la primera versión |
| `docs/despliegue/` | `Registro_Despliegue_MiniPC.md`: guía completa de despliegue, operación, respaldos y equipos |
| `docs/g4pro/` | `Protocolo_G4Pro_Referencia.md` (referencia técnica vigente del terminal facial) e `Historial_Integracion_G4Pro.md` (diseño, pruebas y hallazgos de la integración) |
| `docs/diagramas/` | Proceso de ingreso y salida (`ingreso.svg`, `salida.svg`, `Diagrama_Ingreso_Salida.html`) y arquitectura (`arquitectura.svg`) |
| `docs/equipos/` | Fichas técnicas, manuales y guías de los equipos (alcoholímetro, lector de DNI, terminal facial, molinete) |

## Por dónde empezar

- **Desplegar o levantar el sistema:** [`deploy/README.md`](deploy/README.md).
- **Entender qué hace:** `docs/cliente/Documento_Funcional_Control_Accesos_TMAM.md` y los diagramas de `docs/diagramas/`.
- **Desarrollar:** `mollendo-api/README.md` y `mollendo-portal/README.md`.
