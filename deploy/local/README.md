# Entorno LOCAL — PC de desarrollo

PostgreSQL en Docker; la API y el portal se ejecutan con Node en la PC. Está configurado igual que la nube (`MOLINETES_REMOTOS=true`), así que en "Sistema y APIs" el controlador y los relés salen "Desconectado".

## Índice

1. [Archivos de esta carpeta](#archivos-de-esta-carpeta)
2. [Requisitos](#requisitos)
3. [Primera vez](#primera-vez)
4. [Día a día](#día-a-día)
5. [Si algo falla](#si-algo-falla)

## Archivos de esta carpeta

| Archivo | Qué es |
|---|---|
| `docker-compose.yml` | Solo la base de datos (PostgreSQL) para desarrollo; la API y el portal se ejecutan con Node |
| `README.md` | Esta guía |

No tiene `instalar.sh`: es para trabajar en el código en la PC del programador, no para instalar el sistema.

## Requisitos

- **Git** y **Node.js 22** (`node -v`).
- **Docker**: Docker Desktop, o Docker dentro de WSL en Windows (los comandos `docker` se ejecutan en esa terminal).
- La carpeta del proyecto.

## Primera vez

```bash
# 1. Base de datos (PostgreSQL en el puerto 5433)
cd deploy/local
docker compose up -d
cd ../..

# 2. API (puerto 3001)
cd mollendo-api
cp .env.example .env          # sirve tal cual para desarrollo
npm install
npx prisma migrate deploy     # crea las tablas
npm run db:seed               # cuentas iniciales (contraseñas en el .env)
npm run start:dev
```

En otra terminal:

```bash
# 3. Portal (puerto 3000)
cd mollendo-portal
cp .env.example .env.local
npm install
npm run dev
```

Abrir `http://localhost:3000` y entrar con `admin@monteazulsur.com.pe` y la contraseña `ADMIN_SEED_PASSWORD` de `mollendo-api/.env`.

## Día a día

```bash
cd deploy/local && docker compose up -d                                # si la base no está corriendo
cd mollendo-api && npx prisma migrate deploy && npm run start:dev      # aplica migraciones nuevas y arranca
cd mollendo-portal && npm run dev
```

## Si algo falla

| Síntoma | Qué hacer |
|---|---|
| "Internal server error" o "column … does not exist" | Faltan migraciones: `npx prisma migrate deploy` en `mollendo-api` |
| La API no conecta a la base | `docker compose ps` en `deploy/local`; debe estar `mollendo-postgres` "healthy" |
| "address already in use :::3001" | Ya hay otra API corriendo: cerrarla antes de arrancar otra |
| Se ve distinto que la nube | Revisar que `mollendo-api/.env` tenga `MOLINETES_REMOTOS=true` y `G4PRO_HORA_SINCRONIZACION=off`, como `.env.example` |
