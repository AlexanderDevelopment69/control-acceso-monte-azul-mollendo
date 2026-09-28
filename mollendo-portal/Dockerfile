# Portal (Next.js, servidor autónomo). Las llamadas a /api/v1 y /api/docs se
# reenvían al contenedor del backend (next.config.ts, API_INTERNAL_URL).
FROM node:22-alpine AS build
WORKDIR /app
# El package-lock.json se genera con npm 12: la misma versión evita diferencias al instalar.
RUN npm install -g npm@12.0.2 --no-fund --no-audit
COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit
COPY . .
ARG API_INTERNAL_URL=http://api:3001
ENV NEXT_PUBLIC_API_URL=/api/v1 API_INTERNAL_URL=$API_INTERNAL_URL NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine
RUN apk add --no-cache tzdata
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1 TZ=America/Lima
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
