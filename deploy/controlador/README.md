# Entorno CONTROLADOR — mini PC de la garita

La mini PC de la garita cuando el servidor está en la nube ([`../nube`](../nube/README.md)). Solo lee los DNI, los manda al servidor por internet y abre los molinetes (relés USB) cuando el servidor lo ordena. También activa los relés de aviso (luz o sirena) cuando se deniega un ingreso o una salida. **No tiene base de datos ni portal.**

- Es el mismo programa que la API (misma imagen de Docker), arrancado en modo controlador (`mollendo-api/src/controlador/`).
- La conexión la abre la garita hacia el servidor: **no hay que abrir puertos** en la red del terminal.
- **Sin internet:** nadie puede ingresar; la salida sigue funcionando con la lista del personal guardada en la mini PC, y esas salidas se envían al servidor al volver la conexión.

En la mini PC todo queda en `~/mollendo`. Los comandos `docker compose` se ejecutan **dentro de `~/mollendo/deploy/controlador`**.

## 1. Requisitos (una vez)

- Mini PC con Ubuntu Server, conectada a internet y por Tailscale (`ssh ma-admin@100.78.153.33`).
- Docker es lo único que se instala en el sistema:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 docker-buildx
sudo systemctl enable --now docker
sudo timedatectl set-timezone America/Lima
```

- Lectores de DNI y módulos de relés USB conectados. Ver la guía, secciones 8c (lectores) y 8d (relés, cómo ponerle su serie a cada módulo).

## 2. Primer despliegue

**En la PC**, en la raíz del proyecto, con los cambios confirmados con commit:

```bash
git archive --format=tar.gz -o mollendo.tgz HEAD mollendo-api mollendo-portal deploy
scp mollendo.tgz ma-admin@100.78.153.33:
```

**En la mini PC:**

```bash
mkdir -p ~/mollendo && cd ~/mollendo
tar -xzf ~/mollendo.tgz && rm ~/mollendo.tgz
cd deploy/controlador
cp .env.example .env && chmod 600 .env
ls /dev/serial/by-id/            # rutas de los lectores de DNI
grep hidraw /proc/devices        # si no es 234, poner RELE_USB_HIDRAW_MAJOR en .env
nano .env                        # SERVIDOR_URL, DEVICE_API_KEY (la del servidor), lectores y relés
sudo docker compose up -d --build
sudo docker compose logs --tail 20 controlador
```

El registro debe decir "Lector de DNI … conectado", "Conectado al servidor" y "Lista del personal actualizada: N personas". En el portal de la nube, **Sistema y APIs** → "Controlador: Conectado", con sus lectores y relés.

## 3. Actualizar a una versión nueva

**En la PC:**

```bash
git archive --format=tar.gz -o mollendo.tgz HEAD mollendo-api mollendo-portal deploy
scp mollendo.tgz ma-admin@100.78.153.33:
```

**En la mini PC:**

```bash
cd ~/mollendo
rm -rf mollendo-api mollendo-portal          # NO borrar deploy/: ahí está el .env
tar -xzf ~/mollendo.tgz && rm ~/mollendo.tgz
cd deploy/controlador
sudo docker compose up -d --build
sudo docker compose logs --tail 20 controlador
```

La lista del personal y las salidas pendientes de enviar están en un volumen de Docker y no se pierden.

## 4. Comandos útiles

```bash
cd ~/mollendo/deploy/controlador
sudo docker compose logs -f controlador       # registro en vivo (lecturas, órdenes, avisos)
sudo docker compose restart controlador       # después de cambiar el .env
```

Qué significa cada opción: [`.env.example`](.env.example). Detalle completo (sin internet, pruebas, volver a la mini PC como servidor): [`docs/despliegue/Registro_Despliegue_MiniPC.md`](../../docs/despliegue/Registro_Despliegue_MiniPC.md), secciones 8f y 8g.

## 5. Pasar desde la estructura anterior (una sola vez)

Hasta octubre de 2026 el controlador usaba `~/mollendo/docker-compose.controlador.yml` con `~/mollendo/controlador.env`. Para pasar a esta carpeta:

```bash
cd ~/mollendo
sudo docker compose -f docker-compose.controlador.yml --env-file controlador.env down    # sin -v
tar -xzf ~/mollendo.tgz && rm ~/mollendo.tgz               # paquete nuevo (sección 3, en la PC)
mv controlador.env deploy/controlador/.env
cd deploy/controlador
sudo docker compose up -d --build
```

Si en la mini PC sigue corriendo la API local del modo anterior (`docker-compose.prod.yml`, sin uso desde que el servidor está en la nube), queda igual hasta que se decida apagarla.
