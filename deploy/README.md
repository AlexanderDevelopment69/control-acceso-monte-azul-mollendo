# Despliegue — por dónde empezar

El sistema es el mismo código en todos lados. Cada entorno tiene **su propia carpeta** con todo lo que necesita: su `docker-compose.yml`, la plantilla de su `.env`, sus scripts y un README con los pasos (cada README empieza con un índice y la lista de sus archivos).

## Índice

1. [Carpetas](#carpetas)
2. [Archivos sueltos](#archivos-sueltos)
3. [Orden de instalación](#orden-de-instalación)
4. [Igual en todos los servidores](#igual-en-todos-los-servidores)
5. [Reglas](#reglas)
6. [Guía completa](#guía-completa)

## Carpetas

| Entorno | Carpeta | Dónde | Qué corre |
|---|---|---|---|
| **Nube** | [`nube/`](nube/README.md) | Servidor en la nube (Azure, `74.163.89.6`, `https://accesos.monteazulsur.com.pe`) | Portal, API, base de datos y respaldos |
| **Controlador** | [`controlador/`](controlador/README.md) | Controlador (PC) del punto de acceso | Solo lectores de DNI y relés de los molinetes, conectado a la nube |
| **Garita** (opcional, hoy no se usa) | [`garita/`](garita/README.md) | Controlador (PC) del punto de acceso | Servidor completo, con lectores y relés por USB, sin depender de internet |
| **Local** | [`local/`](local/README.md) | PC de desarrollo | PostgreSQL en Docker; API y portal con Node (no es una instalación del sistema) |
| — | `comun/` | — | Lo que comparten la nube y la garita |

Hoy se trabaja con **nube + controlador**.

## Archivos sueltos

| Archivo | Qué es | Cuándo se usa |
|---|---|---|
| `empaquetar.sh` | En la PC, crea `mollendo.tgz`: el programa listo para copiar al servidor o al Controlador (PC), sin documentos | Antes de instalar o actualizar |
| `comun/respaldo.sh` | El respaldo diario (base de datos, documentos y fotos) | No se ejecuta a mano: lo usa el servicio `backup` de la nube y de la garita |

## Orden de instalación

1. En la PC: `bash deploy/empaquetar.sh`.
2. Servidor: [nube/README.md](nube/README.md#instalar-todo-desde-cero), paso 1.
3. Controlador (PC): [nube/README.md](nube/README.md#instalar-todo-desde-cero), paso 2 (detalle en [controlador/README.md](controlador/README.md#instalar)).
4. G4 Pro y comprobar: [nube/README.md](nube/README.md#instalar-todo-desde-cero), pasos 3 y 4.

## Igual en todos los servidores

```bash
cd ~/mollendo/deploy/<entorno>      # nube, controlador o garita
sudo docker compose up -d --build   # recrea con el .env actual (instalar.sh crea el .env la primera vez)
```

Docker toma solo el `docker-compose.yml` y el `.env` de la carpeta en la que se ejecuta: no hace falta `-f` ni `--env-file`.

## Reglas

- **El `.env` y `backups/` de cada carpeta no se suben a git** (`.gitignore`) y **nunca se borran** al actualizar: al reemplazar el código (`actualizar.sh`) se borran solo `mollendo-api/` y `mollendo-portal/`.
- **Todo en contenedores** en los servidores: solo Docker se instala en el sistema.
- **La `DEVICE_API_KEY` del controlador es la misma que la del servidor en la nube.**
- Si se agrega una opción nueva a la configuración, se agrega también al `.env.example` de cada entorno donde corresponda.
- Si dos entornos se ven distintos con el mismo código, la diferencia está en su `.env` o en los datos de su base.

## Guía completa

[`docs/despliegue/Guia_Despliegue_y_Operacion.md`](../docs/despliegue/Guia_Despliegue_y_Operacion.md): respaldos y cómo restaurarlos, solución de problemas, lectores de DNI (8c), relés (8d), G4 Pro (8e), controlador y trabajo sin internet (8f), pasar de un modo a otro (8g) y el significado de cada variable del `.env` (anexo B).
