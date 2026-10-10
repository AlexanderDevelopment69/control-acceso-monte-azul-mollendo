# Despliegue — por dónde empezar

El sistema es el mismo código en todos lados; lo que cambia de un lugar a otro es el archivo de configuración (`.env`). Esta carpeta tiene **una plantilla por entorno**. La guía completa, paso a paso, está en [`Registro_Despliegue_MiniPC.md`](../Registro_Despliegue_MiniPC.md).

## Los entornos

| Entorno | Dónde | Qué corre | Plantilla | Se copia como |
|---|---|---|---|---|
| **Local** | PC de desarrollo | API, portal y PostgreSQL | [`mollendo-api/.env.example`](../mollendo-api/.env.example), [`mollendo-portal/.env.example`](../mollendo-portal/.env.example) | `mollendo-api/.env`, `mollendo-portal/.env.local` |
| **Nube** | AWS hoy (`54.147.214.38`), Azure después | Portal, API, base de datos y respaldos | [`nube.env.example`](nube.env.example) | `~/mollendo/.env` |
| **Controlador** | Mini PC de la garita | Solo lectores de DNI y relés de los molinetes | [`controlador.env.example`](controlador.env.example) | `~/mollendo/controlador.env` |
| **Garita** (opcional, hoy no se usa) | Mini PC de la garita | Servidor completo, con lectores y relés por USB | [`garita.env.example`](garita.env.example) | `~/mollendo/.env` |

Hoy se trabaja con **nube + controlador**: el portal y la base están en AWS, y la mini PC de la garita solo lee los DNI y abre los molinetes.

## Cómo levantar cada uno

**Local**
```bash
docker compose up -d                       # PostgreSQL (puerto 5433)
cd mollendo-api && npx prisma migrate deploy && npm run start:dev    # API en :3001
cd mollendo-portal && npm run dev                                    # portal en :3000
```

**Nube** (en el servidor, carpeta `~/mollendo`)
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

**Controlador** (en la mini PC, carpeta `~/mollendo`)
```bash
docker compose -f docker-compose.controlador.yml --env-file controlador.env up -d --build
```

**Garita** (en la mini PC, carpeta `~/mollendo`)
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## Dónde está cada cosa en la guía

| Tarea | Sección de `Registro_Despliegue_MiniPC.md` |
|---|---|
| Entornos y opciones de cada uno | 0. Entornos |
| Primer despliegue de un servidor | 3. Primer despliegue |
| Actualizar a una versión nueva | 5. Actualizar a una versión nueva |
| Respaldos | 7. Respaldos |
| Lectores de DNI y relés | 8c y 8d |
| Terminal facial G4 Pro | 8e |
| Mini PC como controlador | 8f |
| Pasar de un modo a otro (garita ↔ controlador) | 8g |
| Qué significa cada variable del `.env` | Anexo B |

## Reglas

- **Los `.env` no se suben a git.** Tienen las claves de cada máquina. Si se agrega una opción nueva, se agrega también a la plantilla de cada entorno donde corresponda.
- **Todo en contenedores** en los servidores: solo Docker se instala en el sistema.
- **La `DEVICE_API_KEY` del controlador es la misma que la del servidor en la nube.**
- Si dos entornos se ven distintos con el mismo código, la diferencia está en su `.env` o en los datos de su base.
