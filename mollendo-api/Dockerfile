# Backend (NestJS + Prisma). Al arrancar aplica las migraciones pendientes.
FROM node:22-alpine AS build
WORKDIR /app
# El package-lock.json se genera con npm 12: la misma versión evita diferencias al instalar.
RUN npm install -g npm@12.0.2 --no-fund --no-audit
COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit
COPY . .
RUN npx prisma generate && npm run build

FROM node:22-alpine
RUN apk add --no-cache tzdata
WORKDIR /app
ENV NODE_ENV=production TZ=America/Lima
# Se copian también las dependencias de desarrollo: el CLI de Prisma aplica las
# migraciones al arrancar y tsx corre el seed (docker compose run api npm run db:seed).
COPY --from=build /app /app
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
