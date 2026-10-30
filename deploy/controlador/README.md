# Entorno CONTROLADOR — Controlador (PC) del punto de acceso

El Controlador (PC) del punto de acceso, conectado al servidor en la nube ([`../nube`](../nube/README.md)). Lee los DNI, los manda al servidor y abre los molinetes (relés USB) cuando el servidor lo ordena; también activa los relés de aviso (luz o sirena) cuando se deniega un paso. **No tiene base de datos ni portal.** La conexión la abre el Controlador (PC) hacia el servidor: no hay que abrir puertos en el punto de acceso. Sin internet nadie ingresa, pero se puede salir con la lista del personal guardada.

En el Controlador (PC) todo vive en `~/mollendo`, y los comandos `docker compose` se ejecutan en `~/mollendo/deploy/controlador` (ahí está su `.env`).

## Índice

1. [Archivos de esta carpeta](#archivos-de-esta-carpeta)
2. [Requisitos](#requisitos)
3. [Instalar](#instalar)
4. [Actualizar a una versión nueva](#actualizar-a-una-versión-nueva)
5. [Verificar](#verificar)
6. [Configuración de los lectores de DNI (Syble, "2D Barcode Scanner User Manual")](#configuración-de-los-lectores-de-dni-syble-2d-barcode-scanner-user-manual)
7. [Si algo falla](#si-algo-falla)

## Archivos de esta carpeta

| Archivo | Qué es | Cuándo se usa |
|---|---|---|
| `instalar.sh` | Instala todo en el Controlador (PC) | Una vez, en una PC nueva |
| `actualizar.sh` | Pone una versión nueva del programa | Cada versión nueva |
| `copia-respaldos.sh` | Copia diaria de los respaldos del servidor | No se ejecuta a mano: lo usa el servicio `copia-respaldos` (opcional) |
| `docker-compose.yml` | Los programas que corren en el Controlador (PC): `controlador` (lectores y relés) y `copia-respaldos` (opcional) | Lo usan los scripts |
| `.env.example` | Modelo del archivo de configuración. El `.env` real lo crea `instalar.sh` y nunca se sube al proyecto | — |
| `README.md` | Esta guía | — |

En el Controlador (PC), además: `.env` (servidor, clave de equipos, lectores y relés; nunca borrar) y, con la copia activada, `copia/` (la llave y los respaldos copiados).

## Requisitos

- **La PC:** Git Bash, la carpeta del proyecto, la llave `~/.ssh/controlador_pc_key` y Tailscale conectado.
- **El Controlador (PC):** Ubuntu con internet, usuario `ma-admin` con `sudo`, Tailscale `100.78.153.33`. Conectados por USB: los dos lectores de DNI (con su adaptador RS232) y los módulos de relés.
- **Los lectores**, una sola vez: mostrarles los códigos del folleto de su caja, en este orden: *Factory Default*, *RS232*, *115200*; luego desenchufar y volver a enchufar su energía.
- **El servidor ya instalado** (ver [`../nube`](../nube/README.md), que tiene el orden completo) y su clave de equipos: `grep DEVICE_API_KEY ~/mollendo/deploy/nube/.env` en el servidor.

## Instalar

```bash
# En la PC, en la carpeta del proyecto
bash deploy/empaquetar.sh
scp -i ~/.ssh/controlador_pc_key mollendo.tgz ma-admin@100.78.153.33:
ssh -i ~/.ssh/controlador_pc_key ma-admin@100.78.153.33

# En el Controlador (PC)
mkdir -p ~/mollendo && tar -xzf ~/mollendo.tgz -C ~/mollendo && rm ~/mollendo.tgz
bash ~/mollendo/deploy/controlador/instalar.sh
```

Responder: servidor `https://accesos.monteazulsur.com.pe`, la clave de equipos (no se muestra al escribirla), copia de respaldos Enter (sin copia) y cuál lector es el de ingreso y cuál el de salida. Los relés quedan con `ING01`, `SAL01`, `DEN01` y `DSA01`, con el aviso en modo alterno. Si después se cambia algo en `.env`: `cd ~/mollendo/deploy/controlador && sudo docker compose up -d`.

Al terminar debe decir "Lector de DNI de ingreso conectado…", "Conectado al servidor" y "Lista del personal actualizada: N personas".

**Serie de un relé nuevo** (vienen de fábrica con `S2OD2`). Conectar **un módulo a la vez** y, en `~/mollendo/deploy/controlador`:

```bash
sudo docker compose exec controlador sh -c 'for h in /sys/class/hidraw/*; do /app/rele-usb /dev-servidor/$(basename $h) estado; done'
# muestra la serie de cada módulo, p. ej. "S2OD2 0" en hidraw1
sudo docker compose exec controlador /app/rele-usb /dev-servidor/hidraw1 serie ING01
```

Repetir con cada módulo (`SAL01`, `DEN01`, `DSA01`) y al final `sudo docker compose restart controlador`.

**Copia automática de respaldos** (opcional, no activada): responder `atenasac@74.163.89.6` a la pregunta de copia; al terminar, el instalador muestra una clave. En el servidor: `bash ~/mollendo/deploy/nube/autorizar-copia.sh "<esa clave>"`; luego aquí `sudo docker compose run --rm copia-respaldos ahora`. Después copia sola cada día a las 05:00 en `~/mollendo/deploy/controlador/copia/respaldos` y guarda 30 días.

## Actualizar a una versión nueva

```bash
# En la PC, en la carpeta del proyecto
bash deploy/empaquetar.sh
scp -i ~/.ssh/controlador_pc_key mollendo.tgz ma-admin@100.78.153.33:
ssh -i ~/.ssh/controlador_pc_key ma-admin@100.78.153.33 'bash -s' < deploy/controlador/actualizar.sh
```

El `.env`, la lista del personal, las salidas pendientes de enviar y la copia de respaldos no se tocan.

## Verificar

- `sudo docker compose ps` → `controlador` "Up".
- En el portal de la nube, **Sistema y APIs** → "Controlador: Conectado", con los dos lectores y los relés ("Conectado").
- Pasar un DNI registrado por la salida: se abre el molinete y la salida aparece en el Panel de vigilancia.

## Configuración de los lectores de DNI (Syble, "2D Barcode Scanner User Manual")

Se configuran escaneando los códigos de su hoja, en este orden, esperando el pitido de cada uno:

| Paso | Código | Para qué |
|---|---|---|
| 1 | Factory Default | Solo si hay que empezar de cero (deja el lector en USB-HID) |
| 2 | **RS232** (Interface) | Obligatorio: sin esto el lector pita pero no envía nada por el cable |
| 3 | **115200** (Baud Rate) | La velocidad del controlador |
| 4 | **CR** (Terminator) | Fin de cada lectura |
| 5 | **Continuous** (Scan Mode) | Lee sin gatillo |
| 6 | **ON** (Sound Setting) | Pita al leer |
| 7 | **Enable all 1D barcodes** | |
| 8 | **Interleaved 2 of 5 → Enable** | El código de barras del DNI; de fábrica viene apagado |
| 9 | **Enable all 2D barcodes** | El código grande del DNI (el controlador también lo entiende) |
| 10 | Desconectar y volver a conectar el lector | El cambio a RS232 recién se aplica al reiniciarlo |

Si pita y no llega nada al Controlador (PC) (`docker logs mollendo-controlador` no muestra "DNI leído"), quedó en USB: repetir 2, 3 y 10.

## Si algo falla

| Síntoma | Qué hacer |
|---|---|
| "Sin conexión con el servidor" en el registro | Revisar el internet del punto de acceso y `SERVIDOR_URL` en `.env`. Si en el registro de la nube (`sudo docker compose logs api`) aparece "Controlador rechazado (clave de equipos inválida)", la `DEVICE_API_KEY` no es la del servidor |
| Un lector "Sin conexión" en Sistema y APIs | Revisar su ruta con `ls /dev/serial/by-id/`, corregir el `.env` y `sudo docker compose up -d` |
| Un relé "No conectado" | Leer las series (ver **Serie de un relé nuevo** en [Instalar](#instalar)) y comprobar que coincidan con el `.env` |
| El lector pita pero no pasa nada | Falta configurarlo en RS232 a 115200 (Requisitos). Si pita con el DNI pero no con el QR de la tarjeta, falta **Enable all 2D barcodes**; ese cambio y el de RS232 recién se aplican al cortarle la energía |
| "Adaptador sin respuesta" en Sistema y APIs (en el registro: "el adaptador USB (ttyUSBn) no responde (error -71 del kernel)") | El adaptador USB-RS232 de ese lector se trabó (visto el 20 y 21/10/2026 con el de salida, al reabrir su puerto en una actualización). La contingencia "sin lector" se activa sola. Desconectar y volver a conectar ese adaptador (o reiniciar el Controlador (PC): `sudo reboot`); si se repite, otro puerto USB o cambiar el adaptador. El controlador lo detecta leyendo el registro del kernel (necesita `cap_add: SYSLOG` y `c 1:11 r` en el compose) y, además, preguntando cada 30 s a cada adaptador si responde (`/app/sondeo-serie`; en el registro: "no responde al sondeo"), porque un adaptador trabado puede no dejar ningún -71 (22/10/2026) |
| La copia de respaldos no copia (opcional) | `sudo docker logs mollendo-copia-respaldos`; si dice "Permission denied", falta `autorizar-copia.sh` en el servidor |
| Ver qué pasa | `sudo docker compose logs -f controlador` |

Detalle de lectores, relés y trabajo sin internet: [guía, secciones 8c, 8d y 8f](../../docs/despliegue/Guia_Despliegue_y_Operacion.md). Qué es cada variable: [`.env.example`](.env.example).
