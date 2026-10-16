# Despliegue — por dónde empezar

El sistema es el mismo código en todos lados. Cada entorno tiene **su propia carpeta** con todo lo que necesita: su `docker-compose.yml`, la plantilla de su `.env` y un README con los pasos.

| Entorno | Carpeta | Dónde | Qué corre |
|---|---|---|---|
| **Nube** | [`nube/`](nube/README.md) | Servidor en la nube (Azure, `74.163.89.6`) | Portal, API, base de datos y respaldos |
| **Controlador** | [`controlador/`](controlador/README.md) | Mini PC de la garita | Solo lectores de DNI y relés de los molinetes, conectada a la nube |
| **Garita** (opcional, hoy no se usa) | [`garita/`](garita/README.md) | Mini PC de la garita | Servidor completo, con lectores y relés por USB, sin depender de internet |
| **Local** | [`local/`](local/README.md) | PC de desarrollo | PostgreSQL en Docker; API y portal con Node |

Hoy se trabaja con **nube + controlador**.

`comun/respaldo.sh` es el script del respaldo diario que usan la nube y la garita.

## Igual en todos los servidores

```bash
cd ~/mollendo/deploy/<entorno>      # nube, controlador o garita
# solo la primera vez: crear el .env (cada README dice cómo)
sudo docker compose up -d --build
```

Docker toma solo el `docker-compose.yml` y el `.env` de la carpeta en la que estás: no hace falta `-f` ni `--env-file`.

## Reglas

- **El `.env` y `backups/` de cada carpeta no se suben a git** (`.gitignore`) y **nunca se borran** al actualizar: al reemplazar el código se borran solo `mollendo-api/` y `mollendo-portal/`.
- **Todo en contenedores** en los servidores: solo Docker se instala en el sistema.
- **La `DEVICE_API_KEY` del controlador es la misma que la del servidor en la nube.**
- Si se agrega una opción nueva a la configuración, se agrega también al `.env.example` de cada entorno donde corresponda.
- Si dos entornos se ven distintos con el mismo código, la diferencia está en su `.env` o en los datos de su base.

## Guía completa

[`docs/despliegue/Registro_Despliegue_MiniPC.md`](../docs/despliegue/Registro_Despliegue_MiniPC.md): respaldos y cómo restaurarlos, solución de problemas, lectores de DNI (8c), relés (8d), G4 Pro (8e), controlador y trabajo sin internet (8f), pasar de un modo a otro (8g) y el significado de cada variable del `.env` (anexo B).
