-- IP del terminal (G4 Pro) en la red de la garita, la que el equipo informa al
-- registrarse ("IPAddress=..."). La de ip_address es la pública (por la que llega).
ALTER TABLE "dispositivo_acceso" ADD COLUMN "ip_local" VARCHAR(45);
