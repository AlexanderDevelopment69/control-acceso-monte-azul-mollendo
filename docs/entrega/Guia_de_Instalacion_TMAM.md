# Guía de instalación - Sistema de Control de Accesos TMAM

Cómo instalar el sistema desde cero en el servidor y en el Controlador (PC) del punto de acceso, cómo actualizarlo y cómo manejar los respaldos. Cada equipo se instala con un solo comando.

El programa se entrega en un archivo, `mollendo.tgz`, junto con esta guía.

## Índice

1. [Antes de empezar](#1-antes-de-empezar)
   - [Cómo entrar a cada equipo](#cómo-entrar-a-cada-equipo)
   - [Copiar el programa a un equipo](#copiar-el-programa-a-un-equipo)
2. [Instalación, en este orden](#2-instalación-en-este-orden)
   - [Paso 1. Servidor](#paso-1-servidor)
   - [Paso 2. Controlador (PC)](#paso-2-controlador-pc)
   - [Paso 3. G4 Pro](#paso-3-g4-pro)
   - [Paso 4. Comprobar](#paso-4-comprobar)
3. [Actualizar a una versión nueva](#3-actualizar-a-una-versión-nueva)
4. [Respaldos](#4-respaldos)
   - [Recuperar un respaldo](#recuperar-un-respaldo)
   - [Reinstalar el servidor con los datos de un respaldo](#reinstalar-el-servidor-con-los-datos-de-un-respaldo)
5. [Serie de un relé nuevo](#5-serie-de-un-relé-nuevo)

## 1. Antes de empezar

| Qué | Detalle |
|---|---|
| Servidor | Azure `74.163.89.6`, Ubuntu, usuario `atenasac`. Puertos abiertos: `22` (SSH), `80` y `443` (portal), `3001` (G4 Pro) |
| Dominio | `accesos.monteazulsur.com.pe` apuntando a `74.163.89.6` (Cloudflare, "DNS only") |
| Controlador (PC) | Ubuntu, usuario `ma-admin`, por Tailscale `100.78.153.33`. Lectores de DNI y relés de los molinetes conectados por USB |
| G4 Pro | Número de serie `HSR3263100192`. IP pública del terminal: `190.119.170.73` |
| Programa | El archivo `mollendo.tgz` |
| Llaves de acceso | Las llaves SSH de los dos equipos, en la PC desde donde se instala (las guarda soporte técnico) |

### Cómo entrar a cada equipo

Los comandos de esta guía se escriben en la consola de cada equipo. Desde la PC, en PowerShell:

| Equipo | Comando |
|---|---|
| Servidor | `ssh atenasac@74.163.89.6` |
| Controlador (PC) | `ssh ma-admin@100.78.153.33` (con Tailscale conectado) |

La consola pasa a ser la del equipo. Para volver a la PC: `exit`.

### Copiar el programa a un equipo

En la PC, en PowerShell, en la carpeta donde está `mollendo.tgz` (no dentro del equipo):

| Equipo | Comando |
|---|---|
| Servidor | `scp mollendo.tgz atenasac@74.163.89.6:` |
| Controlador (PC) | `scp mollendo.tgz ma-admin@100.78.153.33:` |

Luego, en el equipo, descomprimirlo:

```bash
mkdir -p ~/mollendo && tar -xzf ~/mollendo.tgz -C ~/mollendo && rm ~/mollendo.tgz
```

## 2. Instalación, en este orden

### Paso 1. Servidor

Copiar el programa al servidor (ver [Copiar el programa a un equipo](#copiar-el-programa-a-un-equipo)) y, en el servidor:

```bash
bash ~/mollendo/deploy/nube/instalar.sh
```

Pregunta el dominio (`accesos.monteazulsur.com.pe`), el número de serie del G4 Pro (`HSR3263100192`) y la IP pública del terminal (`190.119.170.73`). Instala Docker, la base de datos, la API, el portal y el HTTPS, deja programado el respaldo diario y crea las cuentas iniciales. Al terminar, el portal abre en https://accesos.monteazulsur.com.pe.

### Paso 2. Controlador (PC)

Ver la clave de equipos en el servidor:

```bash
grep DEVICE_API_KEY ~/mollendo/deploy/nube/.env
```

Copiar el programa al Controlador (PC) (ver [Copiar el programa a un equipo](#copiar-el-programa-a-un-equipo)) y, en el Controlador (PC):

```bash
bash ~/mollendo/deploy/controlador/instalar.sh
```

Pregunta la dirección del servidor (`https://accesos.monteazulsur.com.pe`), la clave de equipos y cuál lector es el de ingreso y cuál el de salida. Los relés quedan con las series `ING01` (ingreso), `SAL01` (salida), `DEN01` y `DSA01` (avisos). Un relé nuevo viene de fábrica con otra serie: ver la sección 5.

### Paso 3. G4 Pro

En el equipo, *Cloud Service Settings*: servidor `accesos.monteazulsur.com.pe`, puerto `3001`. Luego, en el portal, **Sistema y APIs** → **Sincronizar**.

### Paso 4. Comprobar

1. Entrar al portal con `admin@monteazulsur.com.pe`; la contraseña inicial está en el servidor, en `ADMIN_SEED_PASSWORD` del archivo `~/mollendo/deploy/nube/.env`.
2. En **Sistema y APIs**: servidor y base de datos "En línea"; Controlador (PC), lectores, relés y G4 Pro "Conectado".
3. Cambiar las contraseñas iniciales del administrador y de vigilancia (`vigilancia@monteazulsur.com.pe`, contraseña inicial en `VIGILANCIA_SEED_PASSWORD`).

## 3. Actualizar a una versión nueva

Con el archivo `mollendo.tgz` de la versión nueva, en cada equipo (primero el servidor):

1. En la PC: `scp mollendo.tgz atenasac@74.163.89.6:` (servidor) o `scp mollendo.tgz ma-admin@100.78.153.33:` (Controlador (PC)), sin descomprimirlo.
2. En el servidor: `bash ~/mollendo/deploy/nube/actualizar.sh`
   En el Controlador (PC): `bash ~/mollendo/deploy/controlador/actualizar.sh`

El servidor saca antes un respaldo de la base. Los datos, las claves y los respaldos no se tocan.

## 4. Respaldos

- El servidor saca solo un respaldo completo todos los días a las 04:00 (base de datos, documentos y fotos) y guarda los últimos 30 días, en `~/mollendo/deploy/nube/backups`.
- Antes de cada actualización guarda también un respaldo de la base (`antes-de-actualizar-…`).
- Respaldo en el momento, en el servidor: `cd ~/mollendo/deploy/nube && sudo docker compose run --rm -T backup ahora`.
- Los respaldos están en el mismo servidor. Se recomienda guardar periódicamente una copia fuera de él, junto con el archivo `~/mollendo/deploy/nube/.env` (tiene las claves del sistema: guardarlo en un lugar seguro). Desde la PC:

```bash
scp "atenasac@74.163.89.6:~/mollendo/deploy/nube/backups/mollendo-*.tar.gz" .
scp atenasac@74.163.89.6:~/mollendo/deploy/nube/.env env-servidor
```

### Recuperar un respaldo

En el servidor:

```bash
ls ~/mollendo/deploy/nube/backups
bash ~/mollendo/deploy/nube/restaurar.sh mollendo-AAAAMMDD-HHMM.tar.gz
```

Pide escribir `SI` para confirmar. Reemplaza los datos actuales por los del respaldo: personal, registros, documentos y fotos. Las cuentas quedan con las contraseñas que tenían. Antes guarda lo que había (`antes-de-restaurar-…`), para poder volver atrás con el mismo comando.

### Reinstalar el servidor con los datos de un respaldo

Si se pierde el servidor, con una copia del respaldo y del `.env` guardada fuera de él:

1. Copiar el programa al servidor nuevo (ver [Copiar el programa a un equipo](#copiar-el-programa-a-un-equipo)).
2. Copiar el `.env` guardado (en la PC: `scp env-servidor atenasac@74.163.89.6:~/mollendo/deploy/nube/.env`). Así se conservan las mismas claves y el Controlador (PC) no necesita cambios.
3. En el servidor: `bash ~/mollendo/deploy/nube/instalar.sh`.
4. Copiar el respaldo (en la PC: `scp mollendo-AAAAMMDD-HHMM.tar.gz atenasac@74.163.89.6:`) y, en el servidor: `bash ~/mollendo/deploy/nube/restaurar.sh ~/mollendo-AAAAMMDD-HHMM.tar.gz`.

Sin el `.env` guardado, el paso 3 crea claves nuevas: hay que reinstalar también el Controlador (PC) con la clave de equipos nueva (sección 2, paso 2).

## 5. Serie de un relé nuevo

Los módulos de relés vienen de fábrica con la serie `S2OD2`. Conectar uno a la vez y, en el Controlador (PC), en `~/mollendo/deploy/controlador`:

```bash
sudo docker compose exec controlador sh -c 'for h in /sys/class/hidraw/*; do /app/rele-usb /dev-servidor/$(basename $h) estado; done'
sudo docker compose exec controlador /app/rele-usb /dev-servidor/hidraw1 serie ING01
sudo docker compose restart controlador
```

El primer comando muestra en qué `hidraw` está el módulo; el segundo le pone la serie (`ING01`, `SAL01`, `DEN01` o `DSA01`).
