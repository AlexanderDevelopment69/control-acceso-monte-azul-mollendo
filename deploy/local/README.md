# Entorno LOCAL — PC de desarrollo

PostgreSQL en Docker; la API y el portal se ejecutan con Node en tu PC. Está configurado igual que la nube (`MOLINETES_REMOTOS=true`), así que en "Sistema y APIs" el controlador y los relés salen "Desconectado".

## Requisitos

- **Git** y **Node.js 22** (`node -v`).
- **Docker**: Docker Desktop, o Docker dentro de WSL en Windows (los comandos `docker` se ejecutan en esa terminal).
- El proyecto:

  ```bash
  git clone https://github.com/AlexanderDevelopment69/control-acceso-monte-azul-mollendo.git
  cd control-acceso-monte-azul-mollendo
  ```

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

Abrir `http://localhost:3000` y entrar con `admin@mollendo.local` y la contraseña `ADMIN_SEED_PASSWORD` de `mollendo-api/.env`.

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
| Se ve distinto que la nube | Revisa que `mollendo-api/.env` tenga `MOLINETES_REMOTOS=true` y `G4PRO_HORA_SINCRONIZACION=off`, como `.env.example` |
