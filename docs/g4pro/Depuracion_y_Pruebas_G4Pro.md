# Depuración y pruebas del G4 Pro

Guía para revisar qué manda el terminal facial G4 Pro (con alcoholímetro) y qué hace el sistema con cada prueba. Sirve para hacer pruebas en la garita, investigar una falla o estudiar un firmware nuevo.

Equipo actual: **G4 Pro HSR3263100192**, en modo **asistencia (ATT)** desde el 19/10/2026 (ver `Comparacion_ACC_ATT.md`, sección 3 quater). Servidor: Azure, ver `deploy/nube/README.md` ("Servidor actual").

---

## 1. Dos formas de ver lo que manda el G4

| | Monitor del G4 Pro (portal) | Depuración (`PUSH_SDK_DEPURAR`) |
|---|---|---|
| Para qué | El día a día y las pruebas en la garita | Investigar: ver el mensaje **completo** del equipo |
| Dónde | Portal → **Sistema y APIs** → "Monitor del G4 Pro" → **Abrir monitor** (`/sistema/monitor`) | Registro (log) del contenedor de la API, en el servidor |
| Qué muestra | Cada prueba: hora, N.º de marcación, demora, persona, grado, qué hizo el sistema y el ingreso | Todo lo que llega a `/iclock` (pruebas, opciones, usuarios, respuestas a comandos) tal cual |
| Hay que tocar el servidor | No | Sí (encender, reiniciar la API, leer el log, apagar) |
| Estado normal | Siempre disponible | **Apagada** (`false`) |

**Empiece siempre por el monitor.** Use la depuración solo si necesita ver el mensaje crudo (p. ej., un campo nuevo, una respuesta a un comando, otro modelo de equipo).

---

## 2. Monitor del G4 Pro (portal)

En **Sistema y APIs**, debajo de "Orden del ingreso". La tarjeta tiene el botón **Abrir monitor**, que lleva a su página (`/sistema/monitor`) con las 30 últimas pruebas. Se actualiza solo (en vivo por el socket; si se corta, cada minuto).

| Columna | Qué es |
|---|---|
| Prueba | Hora del soplido según el reloj del G4 y su **N.º de marcación** |
| Llegó | Hora en que llegó al servidor y la **demora** ("11 s después"); en naranja si pasa de 15 s (lo normal: 10 a 12 s) |
| Persona | Foto, nombre y DNI; "No está en el sistema" si el DNI no está registrado |
| Alcohol | Grado medido: verde si está bajo el umbral, rojo si dio alcohol |
| Qué hizo el sistema | La decisión al llegar la prueba (ver tabla de abajo) |
| Ingreso | El ingreso en que terminó: Autorizado o Denegado, con motivo y hora |

**Franja "No llegó la prueba N.º …":** el número de marcación del G4 sube de uno en uno; si salta, una prueba no llegó al servidor. Revise la conexión del equipo.

**Decisiones posibles** (columna `decision` de la tabla `verificacion_dispositivo`):

| Texto | Cuándo |
|---|---|
| Prueba después de su DNI: cierra su espera | Orden normal: la persona pasó su DNI y aprobó |
| Alcohol alto después de su DNI: cierra su espera | Orden normal: pasó su DNI y dio alcohol |
| Alcohol alto: denegado con su nombre | Dio alcohol sin espera abierta (en los dos órdenes) |
| Orden normal: sopló sin pasar antes su DNI, no vale | Orden normal, sin DNI previo |
| Orden normal: prueba de antes de pasar su DNI, no vale (su espera sigue) | Orden normal: la prueba es de antes del DNI |
| Aprobó: "pase su DNI" (15 s) | Facial primero: aprobó y queda esperando su DNI |
| Aprobó; su DNI ya estaba pasado y esperando | Facial primero: pasó el DNI antes de que llegara el aviso del G4 |
| Volvió a soplar en el mismo pase: vale la primera prueba, esta se ignora | Segundo soplido dentro de 20 s |
| DNI que no está en el sistema: no se usa | Persona registrada solo en el G4 |
| Verificación manual activa: decide el vigilante, la prueba no se usa | Con la verificación manual encendida |
| Llegó con más de 2 min de atraso: solo se guarda | El G4 la mandó tarde (p. ej., al reconectarse) |

Las pruebas de antes del 20/10/2026 no tienen decisión (se ve "—"), pero sí el ingreso.

API detrás del monitor: `GET /api/v1/integraciones/g4pro/marcaciones` (rol administrador). Aviso en vivo: evento `g4-marcacion` del socket `/ws/eventos`.

---

## 3. Depuración (`PUSH_SDK_DEPURAR`)

### 3.1. Qué es

No es un contenedor ni un programa aparte: es un **ajuste de la API** (una variable de entorno). El código está en `mollendo-api/src/main.ts` (líneas 62-72):

- **`true`**: cada pedido que el G4 hace a `/iclock` se anota en el registro de la API con su contenido completo (los tabuladores se muestran como ` | `, hasta 3000 caracteres). Los `getrequest` (el equipo preguntando cada pocos segundos si hay comandos) **no** se anotan, para no llenar el registro.
- **`false`** (o sin definir): el código no se ejecuta; no escribe nada.

| Lugar | Qué hay |
|---|---|
| `~/mollendo/deploy/nube/.env` (servidor) | `PUSH_SDK_DEPURAR=false`: aquí se cambia |
| `deploy/nube/docker-compose.yml` | Pasa el valor al contenedor `api` (por defecto `false`) |
| `mollendo-api/src/main.ts` | Lo lee **al arrancar** la API: cambiarlo exige reiniciarla |

### 3.2. Encender

En el servidor:

```bash
cd ~/mollendo/deploy/nube
cp .env ~/env-antes-depurar.bak                      # copia por si acaso
sed -i 's/^PUSH_SDK_DEPURAR=.*/PUSH_SDK_DEPURAR=true/' .env
sudo docker compose up -d --no-deps api              # recrea solo la API (unos segundos)
sudo docker exec mollendo-api-1 printenv PUSH_SDK_DEPURAR   # debe decir true
```

Reiniciar la API corta unos segundos la conexión del G4 y del Panel; se reconectan solos. Hágalo cuando nadie esté pasando.

### 3.3. Leer el registro

```bash
# En vivo (Ctrl+C para salir):
sudo docker logs -f --since 1m mollendo-api-1 2>&1 | grep --line-buffered -A3 G4ProDepurar

# Solo las pruebas de rostro y alcohol:
sudo docker logs --since 30m mollendo-api-1 2>&1 | grep -A1 "table=ATTLOG"

# Lo que decidió el sistema (estas líneas salen siempre, con o sin depuración):
sudo docker logs --since 30m mollendo-api-1 2>&1 | grep -E "ATTLOG recibido|G4 Pro:|Facial primero"
```

**Cierre siempre el seguimiento en vivo** (`Ctrl+C`) al terminar. Si quedó abierto desde otra sesión: `pgrep -af "logs -f"` y `kill <pid>`.

### 3.4. Qué se ve

Una prueba de rostro y alcohol:

```
[G4ProDepurar] POST /iclock/cdata?SN=HSR3263100192&table=ATTLOG&Stamp=9999
71988749 | 2026-10-19 18:27:00 | 255 | 15 | 0 | 0 | 0 | 255 | 0 | 0 | 28 | 0.00g/L | - | - | -
```

| # | Ejemplo | Qué es |
|---|---|---|
| 1 | `71988749` | DNI de quien hizo la prueba |
| 2 | `2026-10-19 18:27:00` | Hora del soplido (reloj del G4) |
| 3 | `255` | Estado de marcación (entrada/salida…): 255 = ninguno |
| 4 | `15` | Verificación por rostro |
| 5 a 7 | `0 0 0` | Código de trabajo y dos reservados |
| 8 | `255` | Mascarilla: detección apagada |
| 9, 10 | `0 0` | Temperatura (no tiene sensor) |
| 11 | `28` | N.º de marcación del G4 (sube de uno en uno) |
| 12 | `0.00g/L` | **Grado de alcohol** (≥ 0.0001 g/L = alcohol) |
| 13 a 15 | `- - -` | Sueño, estado de salud y placa (no se usan) |

Detalle y fuentes: `Comparacion_ACC_ATT.md`, sección 2 bis.

Otros mensajes que aparecen:

| Pedido | Qué es |
|---|---|
| `GET /iclock/cdata?options=all&DeviceType=att&pushver=2.4.1` | El G4 se presenta (al arrancar o reconectarse) |
| `POST /iclock/cdata?table=options` | Sus opciones y conteos (`UserCount`, `FaceCount`; los `~Max…` son capacidades) |
| `POST /iclock/cdata?table=OPERLOG` | Respuesta a `DATA QUERY USERINFO`: `USER PIN=…` y fotos (`BIOPHOTO`) |
| `POST /iclock/cdata?table=BIODATA` | Rostros registrados (`Type=9`) |
| `POST /iclock/devicecmd` | Confirmación de un comando: `ID=<id>&Return=0` (0 = bien) |

### 3.5. Apagar (siempre al terminar)

```bash
cd ~/mollendo/deploy/nube
sed -i 's/^PUSH_SDK_DEPURAR=.*/PUSH_SDK_DEPURAR=false/' .env
sudo docker compose up -d --no-deps api
sudo docker exec mollendo-api-1 printenv PUSH_SDK_DEPURAR   # debe decir false
```

**Por qué apagarla:** el registro copia todo lo que manda el equipo, incluidas las **plantillas de rostro** y fotos al sincronizar (datos biométricos), y crece rápido. El registro de cada contenedor está limitado a 3 archivos de 10 MB (`x-registro` en `docker-compose.yml`), así que no llena el disco, pero lo viejo se pierde y lo nuevo queda guardado en el servidor.

---

## 4. Mandar un comando al G4

Los comandos se ponen en la tabla `comando_dispositivo`; el G4 los recoge en su siguiente `getrequest` (pocos segundos) y responde con `Return`. Uso normal: el sistema los manda solo (registrar personas, fotos, sincronizar). A mano, solo para pruebas:

```bash
cd ~/mollendo/deploy/nube
cat > /tmp/cmd.sql <<'EOF'
insert into comando_dispositivo (dispositivo_id, comando) values (1, 'SET OPTION SaveBioPhotoFunOn=0') returning id;
insert into comando_dispositivo (dispositivo_id, comando) values (1, 'RELOAD OPTIONS') returning id;
EOF
sudo docker compose exec -T db sh -c 'psql -U $POSTGRES_USER -d $POSTGRES_DB -At' < /tmp/cmd.sql
```

Comprobar que se cumplió (estado `confirmado` y `return_code` 0):

```sql
select id, estado, return_code, comando from comando_dispositivo order by id desc limit 5;
```

`dispositivo_id` 1 es el HSR3263100192 (ver `select id, serial_number from dispositivo_acceso;`).

Comandos usados en las pruebas:

| Comando | Para qué |
|---|---|
| `SET OPTION <Clave>=<valor>` + `RELOAD OPTIONS` | Cambiar una opción del equipo (siempre seguido de `RELOAD OPTIONS`) |
| `DATA QUERY USERINFO` | Pedir la lista de usuarios (responde por `OPERLOG` y `BIODATA`) |
| `SHELL date +%s` | Hora del G4 en segundos, para compararla con la del servidor (diferencia normal: 1-2 s) |

**No mande** `DATA DELETE`, `CLEAR` ni cambios de usuarios a mano: borran personas o rostros del equipo. Para dejar el G4 igual al sistema use **Sincronizar ahora** en Sistema y APIs.

**Opciones cambiadas en las pruebas** (estado al 20/10/2026):

| Opción | Valor | Nota |
|---|---|---|
| `SaveBioPhotoFunOn` | `0` | Se puso en 1 el 19/10 para la prueba de fotos (ATTPHOTO), ya innecesaria; vuelta a 0 el 20/10 |

---

## 5. Consultas útiles en la base de datos

Se ejecutan igual que en la sección 4 (archivo `.sql` y `psql`). Las horas de `creado_en` están en UTC.

```sql
-- Últimas pruebas del G4 con lo que decidió el sistema y el ingreso
select v.id, v.hora_dispositivo, v.concentracion, v.decision, e.resultado, v.crudo
from verificacion_dispositivo v left join evento_acceso e on e.id = v.evento_acceso_id
where v.tabla = 'attlog' order by v.id desc limit 20;

-- Última señal del equipo
select serial_number, ultima_actividad from dispositivo_acceso;

-- Orden del ingreso vigente (facial-primero o normal)
select clave, valor, modificado_en, modificado_por from ajuste_sistema where clave = 'orden_ingreso';
```

---

## 6. Sesión de pruebas paso a paso

1. **Antes:** en Sistema y APIs, el G4 "En línea", lectores y relés conectados, el orden del ingreso que quiere probar (interruptor "DNI → Facial + Alcohol → Molinete" o "Facial + Alcohol → DNI → Molinete"). Recargue el Panel (F5).
2. **Abra el Monitor del G4 Pro** en una pantalla y el **Panel de vigilancia** en otra.
3. **Haga cada prueba** del checklist (`Checklist_Pruebas_Asistencia.md`) y anote: hora, qué vio en el Panel, qué dice el monitor (decisión e ingreso) y la demora.
4. **Si algo no cuadra:** compare la hora del soplido con la del DNI (columna Prueba del monitor vs. hora del ingreso). Si necesita el mensaje crudo, encienda la depuración (3.2), repita la prueba y lea el registro (3.3).
5. **Al terminar:** apague la depuración (3.5), cierre los seguimientos en vivo y marque el checklist.

---

## 7. Problemas conocidos

| Síntoma | Causa | Qué hacer |
|---|---|---|
| El aviso del G4 tarda 10-17 s | Es del equipo (con alcohol alto tarda más) | Normal; los plazos del sistema ya lo consideran |
| "No llegó la prueba N.º …" | El G4 perdió la conexión al mandarla | Revisar red de la garita; al volver, las pruebas viejas llegan con atraso y solo se guardan |
| El contenedor `backup` se reinicia sin parar (`syntax error`) | Un `.sh` subido desde Windows con fines de línea CRLF | `sed -i 's/\r$//' deploy/comun/respaldo.sh` en el servidor y `docker compose restart backup` (pasó el 20/10/2026) |
| Persona en el G4 que no está en el sistema | Registrada a mano en el equipo | Sincronizar ahora (la borra del G4) |
