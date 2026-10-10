# Entorno GARITA — mini PC como servidor completo (opcional)

> **Hoy no se usa.** Es la forma de trabajo anterior a la nube y queda documentada por si se vuelve a ella. Hoy se usa [`../nube`](../nube/README.md) + [`../controlador`](../controlador/README.md).

Todo en la mini PC de la garita: portal, API, base de datos y respaldos, con los lectores de DNI y los relés conectados por USB a la misma mini PC. El G4 Pro se conecta a la mini PC por la red local. No depende de internet.

Los comandos `docker compose` se ejecutan **dentro de `~/mollendo/deploy/garita`**, donde están el `docker-compose.yml`, el `.env` y la carpeta `backups/`.

## 1. Requisitos (una vez)

Igual que el controlador: Ubuntu Server con Docker (`docker.io docker-compose-v2 docker-buildx`), zona horaria `America/Lima`, lectores y relés conectados (guía, secciones 8c y 8d).

## 2. Primer despliegue

**En la PC:**

```bash
git archive --format=tar.gz -o mollendo.tgz HEAD mollendo-api mollendo-portal deploy
scp mollendo.tgz ma-admin@100.78.153.33:
```

**En la mini PC:**

```bash
mkdir -p ~/mollendo && cd ~/mollendo
tar -xzf ~/mollendo.tgz && rm ~/mollendo.tgz
cd deploy/garita
cp .env.example .env && chmod 600 .env
nano .env        # claves (openssl rand), CORS_ORIGIN con las IP de la mini PC, lectores y relés
sudo docker compose up -d --build
sudo docker compose logs api | grep -E "migrations|successfully started"
sudo docker compose run --rm -T api npm run db:seed      # solo la primera vez: cuentas iniciales
```

Las claves se pueden generar como en [`../nube/README.md`](../nube/README.md), sección 2. En el **G4 Pro** (*Cloud Service Settings*): servidor `192.168.0.165` (IP de la mini PC en la red local), puerto `3001`.

## 3. Actualizar y verificar

Igual que en la nube ([`../nube/README.md`](../nube/README.md), secciones 3 y 4), dentro de `~/mollendo/deploy/garita`. **No borrar `deploy/`** al reemplazar el código: ahí están el `.env` y los respaldos.

Pasar de este modo al de nube + controlador, o al revés: guía [`docs/despliegue/Registro_Despliegue_MiniPC.md`](../../docs/despliegue/Registro_Despliegue_MiniPC.md), sección 8g.
