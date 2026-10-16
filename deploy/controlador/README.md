# Entorno CONTROLADOR — mini PC de la garita

La mini PC de la garita cuando el servidor está en la nube ([`../nube`](../nube/README.md)). Lee los DNI, los manda al servidor y abre los molinetes (relés USB) cuando el servidor lo ordena; también activa los relés de aviso (luz o sirena) cuando se deniega un paso. **No tiene base de datos ni portal.** La conexión la abre la mini PC hacia el servidor: no hay que abrir puertos en la garita. Sin internet nadie ingresa, pero se puede salir con la lista del personal guardada.

En la mini PC todo vive en `~/mollendo`, y los comandos `docker compose` se ejecutan en `~/mollendo/deploy/controlador` (ahí está su `.env`).

## Requisitos

**En tu PC:** Git, SSH, Tailscale conectado (o estar en la red de la garita) y el proyecto:

```bash
git clone https://github.com/AlexanderDevelopment69/control-acceso-monte-azul-mollendo.git
cd control-acceso-monte-azul-mollendo
```

**La mini PC:** Ubuntu Server con internet, usuario con `sudo` (hoy `ma-admin`, Tailscale `100.78.153.33`). Conectados por USB: los dos lectores de DNI (con su adaptador RS232) y los módulos de relés (ingreso, salida y, si hay, los de aviso).

**Los lectores**, una sola vez: mostrarles los códigos del folleto de su caja, en este orden: *Factory Default*, *RS232*, *115200*; luego desenchufar y volver a enchufar su energía.

**El servidor en la nube ya desplegado**, y su `DEVICE_API_KEY` a mano (`cat ~/mollendo/deploy/nube/.env` en el servidor).

## Primer despliegue

**1. Instalar Docker en la mini PC:**

```bash
ssh ma-admin@100.78.153.33
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2 docker-buildx
sudo systemctl enable --now docker
sudo timedatectl set-timezone America/Lima
exit
```

**2. Empaquetar y subir el código** (en tu PC; se empaqueta el último commit):

```bash
git archive --format=tar.gz -o mollendo.tgz HEAD mollendo-api mollendo-portal deploy
scp mollendo.tgz ma-admin@100.78.153.33:
```

**3. Descomprimir y ver qué equipos hay** (en la mini PC):

```bash
mkdir -p ~/mollendo && cd ~/mollendo
tar -xzf ~/mollendo.tgz && rm ~/mollendo.tgz
cd deploy/controlador
cp .env.example .env && chmod 600 .env
ls /dev/serial/by-id/          # una ruta por lector: anota cuál es el de ingreso y cuál el de salida
```

**4. Completar el `.env`** (`nano .env`; guardar `Ctrl+O`, salir `Ctrl+X`):

```
SERVIDOR_URL=https://accesos.monteazulsur.com.pe
DEVICE_API_KEY=<la misma del servidor en la nube>
LECTOR_DNI_INGRESO_DISPOSITIVO=/dev/serial/by-id/usb-...   (la del lector de ingreso)
LECTOR_DNI_SALIDA_DISPOSITIVO=/dev/serial/by-id/usb-...    (la del lector de salida)
RELE_INGRESO_SERIE=ING01
RELE_SALIDA_SERIE=SAL01
RELE_AVISO_INGRESO_SERIE=DEN01      (si hay relés de aviso; si no, borrar la línea)
RELE_AVISO_SALIDA_SERIE=DSA01
```

**5. Levantar:**

```bash
sudo docker compose up -d --build
sudo docker compose logs --tail 20 controlador
```

Debe decir "Lector de DNI de ingreso conectado…", "Conectado al servidor" y "Lista del personal actualizada: N personas".

**6. Ponerle la serie a cada relé** (solo con módulos nuevos: todos vienen de fábrica con `S2OD2`). Conectar **un módulo a la vez**:

```bash
sudo docker compose exec controlador sh -c 'for h in /sys/class/hidraw/*; do /app/rele-usb /dev-servidor/$(basename $h) estado; done'
# muestra la serie de cada módulo, p. ej. "S2OD2 0" en hidraw1
sudo docker compose exec controlador /app/rele-usb /dev-servidor/hidraw1 serie ING01
```

Repetir con cada módulo (`SAL01`, `DEN01`, `DSA01`) y al final `sudo docker compose restart controlador`.

## Actualizar a una versión nueva

```bash
# En tu PC (con los cambios ya en un commit)
git archive --format=tar.gz -o mollendo.tgz HEAD mollendo-api mollendo-portal deploy
scp mollendo.tgz ma-admin@100.78.153.33:

# En la mini PC
cd ~/mollendo
rm -rf mollendo-api mollendo-portal       # NO borrar deploy/: ahí está el .env
tar -xzf ~/mollendo.tgz && rm ~/mollendo.tgz
cd deploy/controlador
sudo docker compose up -d --build
sudo docker compose logs --tail 20 controlador
```

La lista del personal y las salidas pendientes de enviar están en un volumen y no se pierden.

## Verificar

- `sudo docker compose ps` → `controlador` "Up".
- En el portal de la nube, **Sistema y APIs** → "Controlador: Conectado", con los dos lectores ("Cable conectado") y los relés ("Conectado").
- Pasar un DNI registrado por la salida: se abre el molinete y la salida aparece en el Panel de vigilancia.

## Si algo falla

| Síntoma | Qué hacer |
|---|---|
| "Sin conexión con el servidor" en el registro | Revisar internet de la garita y `SERVIDOR_URL`. Si en el registro de la nube (`sudo docker compose logs api`) aparece "Controlador rechazado (clave de equipos inválida)", la `DEVICE_API_KEY` no es la del servidor |
| Un lector "Sin conexión" en Sistema y APIs | Revisar su ruta con `ls /dev/serial/by-id/`, corregir el `.env` y `sudo docker compose up -d` |
| Un relé "No conectado" | Leer las series (paso 6) y comprobar que coincidan con el `.env` |
| El lector pita pero no pasa nada | Falta configurarlo en RS232 a 115200 (Requisitos) |
| Ver qué pasa | `sudo docker compose logs -f controlador` |

Detalle de lectores, relés y trabajo sin internet: [guía, secciones 8c, 8d y 8f](../../docs/despliegue/Registro_Despliegue_MiniPC.md). Qué es cada variable: [`.env.example`](.env.example).

## Pasar desde la estructura anterior (una sola vez)

Antes se usaba `~/mollendo/docker-compose.controlador.yml` con `~/mollendo/controlador.env`. Con el paquete nuevo ya subido:

```bash
cd ~/mollendo
sudo docker compose -f docker-compose.prod.yml stop      # la API vieja de la mini PC (ver abajo)
sudo docker compose -f docker-compose.controlador.yml --env-file controlador.env down    # sin -v
mkdir -p ~/mollendo-previo-$(date +%Y%m%d)
sudo mv mollendo-api mollendo-portal deploy docker-compose.controlador.yml ~/mollendo-previo-$(date +%Y%m%d)/
tar -xzf ~/mollendo.tgz && rm ~/mollendo.tgz
mv controlador.env deploy/controlador/.env
cd deploy/controlador && sudo docker compose up -d --build
```

La primera línea detiene la API del modo anterior, que sigue corriendo en la mini PC sin uso desde que el servidor está en la nube: usa archivos de `deploy/` que este paso mueve, y su respaldo fallaría si se reiniciara. Sus datos quedan en sus volúmenes, y su `docker-compose.prod.yml`, su `.env` y `backups/` quedan en `~/mollendo`. Si algún día se vuelve a la mini PC como servidor, se usa `deploy/garita` (guía, sección 8g).
