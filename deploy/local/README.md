# Entorno LOCAL — PC de desarrollo

PostgreSQL en Docker; la API y el portal se ejecutan con Node en la PC. La configuración local está hecha igual que la nube (`MOLINETES_REMOTOS=true`), así que en "Sistema y APIs" el controlador y los relés salen "Desconectado".

## Primera vez

```bash
# 1. Base de datos (puerto 5433), desde esta carpeta
cd deploy/local
docker compose up -d

# 2. API (puerto 3001)
cd ../../mollendo-api
cp .env.example .env
npm install
npx prisma migrate deploy
npm run db:seed            # cuentas iniciales
npm run start:dev

# 3. Portal (puerto 3000), en otra terminal
cd mollendo-portal
cp .env.example .env.local
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Día a día

```bash
cd deploy/local && docker compose up -d          # si la base no está corriendo
cd mollendo-api && npx prisma migrate deploy && npm run start:dev
cd mollendo-portal && npm run dev
```

Si la API da errores de columnas que no existen, faltan migraciones: `npx prisma migrate deploy` en `mollendo-api`.
