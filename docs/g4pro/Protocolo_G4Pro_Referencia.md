# Referencia técnica: comunicación con el terminal facial ZKTeco G4 Pro

Proyecto: Sistema de Control de Accesos · Terminal Monte Azul Mollendo (TMAM)
Última actualización: 05/oct/2026

Este documento reúne **todo lo confirmado con el equipo real** sobre cómo se comunica el sistema con el G4 Pro: conexión, rutas, comandos, respuestas, códigos de evento y particularidades del firmware. Para el historial de las pruebas, ver `Historial_Integracion_G4Pro.md` (en esta misma carpeta); para la instalación, `docs/despliegue/Registro_Despliegue_MiniPC.md` (sección 8e).

**Equipo probado:** G4 Pro, serie `HSR3263100192`, firmware `4.1.109-OCM-4101-3`, PushVersion `Ver 2.0.38-20220623`, tipo de firmware **Acceso** (ACC), con alcoholímetro DT1700 por USB.

---

## 1. Resumen

- El G4 Pro habla el protocolo **PUSH (ADMS) de ZKTeco, variante de control de acceso**. Es el equipo el que se conecta al servidor (la mini PC), por HTTP, y le pregunta cada ~2 segundos si tiene órdenes.
- **Los comandos del protocolo de asistencia (`USERINFO`) no sirven** en este firmware: los rechaza con `-629`. Se usan las tablas de control de acceso: `user`, `extuser`, `biophoto`, `userauthorize`.
- No se usa ningún software del fabricante (ZKBio): todo lo implementa `mollendo-api`.

| Dónde está en el código | Qué hace |
|---|---|
| `mollendo-api/src/push-sdk/push-sdk.controller.ts` | Rutas `/iclock/*` que llama el equipo |
| `mollendo-api/src/push-sdk/push-sdk.service.ts` | Cola de comandos, resultados, consultas, sincronización y limpieza |
| `mollendo-api/src/push-sdk/comandos-acceso.util.ts` | Formato de cada comando y lectura de las respuestas (con tests) |
| `mollendo-api/src/integraciones/integraciones.service.ts` | Cuándo se registra, habilita o sincroniza (eventos del sistema) |
| `mollendo-api/src/eventos-acceso/eventos-acceso.service.ts` | Habilitación por DNI y lectura del resultado (`rtlog`) |
| Tablas `dispositivo_acceso`, `comando_dispositivo`, `verificacion_dispositivo`, `ingreso_pendiente` | Equipos, órdenes, resultados recibidos y esperas |

---

## 2. Conexión

- En el G4 Pro: **Menú → COMM. → Cloud Server Setting**: dirección = IP de la mini PC, puerto **3001**, sin dominio, sin HTTPS, sin proxy. En **Configuración avanzada → Tipo de firmware**: "Acceso".
- Las rutas `/iclock/*` van **sin** el prefijo `/api/v1` (el equipo no permite configurarlo) y **sin autenticación** (el equipo no envía token).
- El equipo casi nunca manda un `Content-Type` reconocible: el servidor lee siempre el cuerpo como **texto plano**.
- El equipo está "En línea" si consultó al servidor en los últimos 2 minutos (`dispositivo_acceso.ultima_actividad`).

---

## 3. Rutas `/iclock/*`

| Ruta | La llama el equipo para… | El servidor responde |
|---|---|---|
| `POST /iclock/registry?SN=<serie>` | Registrarse | `RegistryCode=<código>`, **siempre el mismo para el mismo equipo**. Si responde `OK`, el equipo se conecta pero **nunca envía datos** (no documentado por ZKTeco) |
| `POST /iclock/push?SN=…` | Abrir sesión | Parámetros de sesión: `ServerVersion=3.0.1`, `PushVersion=3.0.1`, `RequestDelay=2`, `Realtime=1`, `TransTables=User Transaction`, `SessionID=<uuid>`, `TimeoutSec=10`, … (tampoco documentado; sin esto no envía datos) |
| `GET /iclock/getrequest?SN=…` | Pedir órdenes (cada ~2 s) | `OK` si no hay; si hay, una por línea: `C:<id>:<comando>`. Al entregarlas quedan `entregado` |
| `POST /iclock/devicecmd?SN=…` | Confirmar órdenes ejecutadas | `OK`. Cuerpo: una línea por orden, `ID=<id>&Return=<código>&CMD=<tipo>` (**puede confirmar varias en un mismo mensaje**); `Return=0` = aceptada |
| `GET /iclock/cdata?SN=…` | Comprobar el servidor | `OK` |
| `POST /iclock/cdata?SN=…&table=rtlog` | Enviar cada verificación (sección 6) | `OK` |
| `POST /iclock/cdata?SN=…&table=rtstate` | Enviar el estado del sensor, el relé y la puerta | `OK` |
| `POST /iclock/querydata?SN=…&type=count\|tabledata&cmdid=<id>&tablename=<tabla>&count=…&packcnt=…&packidx=…` | Responder a `DATA COUNT` / `DATA QUERY` | `OK` (si no se responde, el equipo **reintenta 3 veces**). Las respuestas grandes llegan en **varias partes** (`packcnt` = total, `packidx` = número de parte) |

---

## 4. Comandos (órdenes al equipo)

Se encolan en `comando_dispositivo` y el equipo los recoge en el siguiente `getrequest`. **Los campos van separados por tabulador** (aquí se muestran con espacios).

### 4.1. Personas

| Comando | Para qué | Notas (confirmado con el equipo) |
|---|---|---|
| `DATA UPDATE user CardNo= Pin=<DNI> Password= Group=0 StartTime=0 EndTime=0 Name=<nombre> Privilege=0` | Alta o actualización de la persona | El número de documento es el número de usuario (`Pin`): **letras y números, hasta 24 caracteres** (probado con `99CE00451` y pins de 12, 18 y 24 caracteres, también en `userauthorize`). **No le da permiso de paso.** `Privilege=14` = administrador del equipo |
| `DATA UPDATE extuser Pin=<DNI> FunSwitch=0 FirstName=<nombres> LastName=<apellidos> PersonalVs=0` | Nombre y apellido que **muestra la pantalla** | El campo `Name` de `user` no se ve en la lista; un nombre escrito a mano en el equipo se guarda aquí |
| `DATA UPDATE biophoto PIN=<DNI> Type=9 Size=<largo del base64> Content=<JPG en base64> Format=0 Url= PostBackTmpFlag=0` | Foto de la persona | El equipo la convierte en la **plantilla de rostro** (`biodata`, tipo 9) con la que reconoce. JPG ≤ 20 KB (lo convierte `foto-g4pro.util.ts`). Foto de frente, con buena luz |
| `DATA DELETE user Pin=<DNI>` | Borrar a la persona y su rostro | **No borra su nombre (`extuser`) ni sus permisos (`userauthorize`)**: hay que borrarlos aparte |
| `DATA DELETE extuser Pin=<DNI>` | Borrar su nombre | |

### 4.2. Permiso de paso (habilitación)

**Qué es el permiso de paso.** Es la autorización que el G4 Pro guarda para **dejar pasar** a una persona. Estar registrada en el equipo (con su rostro) no alcanza:

- **Con rostro, sin permiso:** el G4 Pro la **reconoce pero la rechaza** ("acceso denegado", `event=23`).
- **Con rostro y con permiso:** la reconoce, le toma la prueba de alcohol y, si sale bien, la **deja pasar** (`event=0`).

**Cómo lo usa el sistema:** registra a todo el personal **sin permiso**; cuando una persona pasa su **DNI en regla**, le da el permiso **solo a ella, por 1 minuto**, y se lo quita al terminar o al vencer el minuto. Así el G4 Pro solo acepta a quien acaba de pasar su DNI (diagrama de ingreso, pasos 4 y 9).

**Por qué no se registra a mano en el equipo:** el G4 Pro le da a quien se registra desde su pantalla un **permiso permanente** (se vio un usuario manual con `userauthorize=50`). Esa persona podría pasar sin DNI y, peor, verificarse mientras otra está habilitada: como el éxito llega sin decir quién fue, el sistema lo atribuiría a la persona del DNI y abriría el molinete. La sincronización borra esos usuarios y quita los permisos sueltos.


| Comando | Para qué |
|---|---|
| `DATA UPDATE userauthorize Pin=<DNI> AuthorizeTimezoneId=1 AuthorizeDoorId=1` | Habilitar: el equipo acepta su rostro |
| `DATA DELETE userauthorize Pin=<DNI> AuthorizeDoorId=1` | Deshabilitar |
| `DATA DELETE userauthorize Pin=<DNI>` | Quitar todos sus permisos |

Sin permiso, el equipo reconoce a la persona pero la **rechaza** (`event=23`). El equipo confirma cada orden en **menos de 1 segundo** desde que se encola.

### 4.3. Consultas

| Comando | Respuesta (por `/iclock/querydata`) |
|---|---|
| `DATA COUNT user` · `extuser` · `userauthorize` · `biophoto` · `biodata` | `user=2` (una línea `<tabla>=<n>`) |
| `DATA QUERY tablename=user,fielddesc=*,filter=*` | Una línea por usuario: `user uid=20 cardno= pin=48058719 password= group=0 starttime=0 endtime=0 name=… privilege=0 disable=0 verify=0` |
| `DATA QUERY tablename=extuser,fielddesc=*,filter=*` | `extuser pin=48058719 funswitch=0 firstname=Amiel lastname=Bautista personalvs=0` |
| `DATA QUERY tablename=biodata,fielddesc=*,filter=*` | `biodata pin=… no=0 index=0 valid=1 duress=0 type=9 majorver=5622 … tmp=<plantilla>` |
| `INFO` | Configuración y contadores del equipo (`UserCount`, `FaceCount`, `FWVersion`, `IPAddress`, …). **No incluye los ajustes del alcoholímetro** |

**Particularidades:** `DATA QUERY tablename=userauthorize` devuelve solo bytes vacíos (no se pueden listar los permisos, solo contarlos). `DATA COUNT biodata` y `biophoto` pueden dar 0 aunque el `DATA QUERY` muestre el registro.

### 4.4. Lo que NO funciona en este firmware (protocolo de asistencia)

`DATA UPDATE USERINFO …` (en todas sus variantes: con `Pri`, `Privilege`, `StartDatetime`/`EndDatetime`/`Expires`, formato del SDK, ejemplo del manual), `DATA DELETE USERINFO`, `DATA QUERY USERINFO` → `return=-629`. `DATA UPDATE BIOPHOTO` (mayúsculas, asistencia) y `DATA UPDATE USERPIC` → `return=0` pero **no guardan nada**. *Background Verification* (`PostVerifyData`) → el equipo nunca la usa.

---

## 5. Prueba de alcohol

- Después del rostro, el G4 Pro pide soplar en el DT1700 y muestra el resultado ("Grado de alcohol 0.00 g/L, Sin problemas").
- **Decide el propio equipo**, con su **"Umbral de embriaguez"** (Configuración avanzada → Configuración del proceso de prueba de alcohol). Venía en **0.0025 g/L** (2.5 mg/L), tan alto que una lectura de 0.000413 g/L ("Supera el valor estándar") pasó igual. **Lo fija el cliente**; la guía del DT1700 recomienda 0.02 mg/L.
- **El valor medido no llega al servidor** (`Concentration=0` siempre); solo el resultado (`event=0` apto, `event=1` alcohol).
- No se puede leer ni cambiar el umbral por el protocolo (`INFO` no lo trae).
- **Sin el alcoholímetro (probado el 07/10/2026):** tras el rostro muestra *"Verificación de identidad completada. Realice una medición de alcohol."* y queda esperando; **no envía `rtlog`** (ni aprobado ni rechazado), así que nadie pasa sin la prueba. **Desconectar o conectar el DT1700 no genera ningún mensaje** (`rtlog`, `rtstate` ni `options`); en la pantalla aparece un ícono con punto rojo en la barra superior. *(Desde el 21/10/2026 el servidor lo vigila igual: cada 10 s le manda `SHELL cat /sys/bus/usb/devices/*/uevent | grep -c PRODUCT=1a86/7523/`; ver la guía de depuración, sección 8.)* El equipo tampoco informa el alcoholímetro en `table=options` (capacidades que envía por su cuenta: rostro, huella, foto, mascarilla, etc.).
- **DT1700 conectado a una PC (probado el 07/10/2026):** aparece como puerto serie USB (chip CH340, `1a86:7523`, `/dev/ttyUSB*`), pero **no envía nada** por su cuenta, ni en reposo ni al hacer una prueba (escuchado a 4 800 – 115 200 baudios): trabaja a pedido del G4 Pro, con un protocolo no documentado (pedirlo a ZKTeco o al proveedor). Por dentro es un alcoholímetro "BrACAudit-dtsh" que **funciona solo** (botones Data / Test / Menu; menú con calibración, unidad e idioma; escala de fábrica: Pass < 0,090 mg/L, Drink 0,090–0,363, Drunk > 0,363), así que sirve como alcoholímetro portátil de respaldo.
- **Capacidad informada en `table=options`:** `~MaxUserCount=500` (y `~MaxFaceCount=50000`). **Confirmar con el proveedor** si el límite de usuarios es 500: no alcanzaría para cargar a miles de personas.
- Para estudiar lo que envía el equipo: `PUSH_SDK_DEPURAR=true` en el `.env` del servidor anota en el registro de la API cada mensaje del G4 Pro (salvo las consultas de rutina `getrequest`).

---

## 6. Resultados que envía el equipo

### 6.1. `table=rtlog` (cada verificación)

```
time=2026-10-04 04:02:41  pin=0  cardno=0  eventaddr=1  event=0  inoutstatus=0  verifytype=15  index=413
sitecode=0  linkid=0  maskflag=255  temperature=0  convtemperature=0  Concentration=0  SleepTime=0  HealthStatus=0  PlateNumber=0
```

| `event` | Significado | `pin` | Qué hace el sistema |
|---|---|---|---|
| **0** | Verificación exitosa: rostro y alcohol conformes | **0** (el firmware no dice quién) | Autoriza a la persona habilitada (solo hay una) y activa el relé de ingreso |
| **1** | Alcohol sobre el umbral | 0 | Deniega por alcohol, sin relé |
| **23** | Rostro reconocido **sin permiso de paso** | **El DNI** de la persona | No cierra la espera; se anota quién era |
| **27** | No registrado (rostro, huella o tarjeta) | 0 | No cierra la espera; se anota |
| Otro | Desconocido | — | Se deniega por alcohol (ante la duda, no se abre) |

| `verifytype` | Medio |
|---|---|
| 15 | Rostro (con alcohol) |
| 1 | Huella |
| 2 | Tarjeta |

### 6.2. `table=rtstate` (estado de la puerta)

```
time=2026-10-04 04:02:41  sensor=02  relay=01  alarm=0000000000000000  door=01
```

`relay=01` cuando el equipo activa **su propio relé** (en cada `event=0`, por 5 segundos). En este proyecto el relé del G4 Pro **no está conectado** al molinete: lo abre la mini PC con su relé USB.

---

## 7. Cómo lo usa el sistema

| Momento | Comandos |
|---|---|
| Alta o edición de una persona | `user` + `extuser` |
| Subir o cambiar la foto | `user` + `extuser` + `biophoto` |
| Cambio del número de documento | Borrar el anterior (`userauthorize`, `extuser`, `user`) + crear el nuevo con foto |
| Pasa un DNI en regla | `userauthorize` (habilitar) — **una persona a la vez**; las demás quedan en cola |
| Llega el resultado o vence el minuto | `DATA DELETE userauthorize` (deshabilitar) |
| **Sincronización** (`POST /api/v1/integraciones/g4pro/sincronizar`, y todos los días a medianoche) | Consulta los usuarios del equipo (`DATA QUERY user`) y: **borra a los que el sistema no conoce** (registrados a mano), **quita los permisos de paso sueltos** (si `DATA COUNT userauthorize` es mayor que lo esperado) y **registra con foto a los activos que faltan**. `?simular=true` solo informa qué haría. En el portal: **Sistema y APIs → Sincronización con el G4 Pro** (Simular / Sincronizar ahora), que además muestra cuántos usuarios y rostros tiene cada equipo. Cada resultado (también las simulaciones y las fallidas) se guarda en la tabla `sincronizacion_g4`, así la última se sigue viendo después de reiniciar la API |
| Baja de una persona | Nada: queda en el equipo, pero nunca se la habilita |

---

## 8. Advertencias

- **Los registros técnicos se borran a los 90 días.** Una vez al día, la API borra los comandos ya entregados al equipo (`comando_dispositivo` que no estén `pendiente`), las verificaciones (`verificacion_dispositivo`) y las esperas de ingreso cerradas (`ingreso_pendiente`) de más de 90 días. Para investigar algo del equipo, hacerlo dentro de ese plazo.
- **Nunca registrar personas a mano en el G4 Pro.** Un usuario creado desde la pantalla del equipo recibe **permiso de paso permanente** (un usuario manual dejó `userauthorize=50`). Como los éxitos llegan sin `pin`, podría verificarse mientras otra persona está habilitada y el sistema se lo atribuiría a esa persona. La sincronización diaria los borra.
- **No usar al personal como administradores del equipo** (`Privilege=14`): al editar a la persona, el sistema vuelve a enviar `Privilege=0`.
- **Nombre "..."** en el aviso "¡Verificación Exitosa!": el nombre está guardado (`user.Name` y `extuser`), y la lista de usuarios a veces lo muestra y a veces no. Pendiente de investigar.
- El **reloj** del G4 Pro conviene que coincida con el de la mini PC (el `rtlog` trae la hora del equipo y se usa como hora del ingreso).

---

## 9. Enviar un comando a mano (soporte)

En la mini PC, dentro de `~/mollendo`:

```bash
sudo docker compose exec -T db psql -U mollendo -d mollendo_control_acceso -c \
  "INSERT INTO comando_dispositivo (dispositivo_id, comando) SELECT id, 'DATA COUNT user' FROM dispositivo_acceso;"
# Estado del comando:
sudo docker compose exec -T db psql -U mollendo -d mollendo_control_acceso -c \
  "SELECT id, estado, return_code, left(comando, 60) FROM comando_dispositivo ORDER BY id DESC LIMIT 5;"
# Respuesta (en el registro del backend):
sudo docker compose logs --since 2m api | grep "Respuesta de"
```

Para los campos separados por tabulador, usar `E'…\t…'` en el texto del comando.

---

## 10. Investigación del `pin=0` en el éxito (19/10/2026)

**Problema:** en la verificación exitosa (`event=0`), el `rtlog` llega con `pin=0`: el firmware no dice quién pasó. El sistema lo resuelve teniendo **una sola persona habilitada a la vez**. Se investigó a fondo si el número se puede recuperar de algún modo.

**Conclusión:** el equipo **no atribuye al usuario** en el evento de éxito, en ningún lugar — ni en el `rtlog` en vivo, ni en su log interno (`transaction`/`ACC_ATT_LOG`), que también trae `pin` vacío en los éxitos. Sí lo trae en `event=23` (reconocido sin permiso). No es un error de registro: los rostros están bien ligados al DNI (`biodata.pin` = DNI, verificado). Es comportamiento del firmware.

### 10.1. Diagnóstico por el propio protocolo PUSH (sin adb)

El protocolo de comandos permite inspeccionar el equipo sin red local ni adb, encolando comandos como cualquier otro (ver sección 9):

| Comando | Qué hace |
|---|---|
| `SHELL <cmd>` | Ejecuta un comando de sistema en el equipo (Android) y devuelve la salida en `Content=`. Corre como `uid=1000(system)`. **Solo lectura**: no modificar. |
| `SET OPTION <Key>=<Value>` | Fija una opción del equipo (persiste en `ZKSystem.db`). No saca al equipo de modo ACC. |
| `RELOAD OPTIONS` | Recarga la configuración. |
| `GetFile <ruta>` | El equipo sube un archivo suyo al servidor. |

La salida de cada comando se ve en el log de la API con `PUSH_SDK_DEPURAR=true` (`devicecmd` con `Content=`).

### 10.2. Lo que se halló en el equipo

- **App principal:** `com.zkteco.android.core`. Bases en `…/databases/`: `ZKDB.db` (usuarios, plantillas, accesos) **está cifrada** (`Error: file is not a database`), `ZKEXTDB.db`, y **`ZKSystem.db` (config, NO cifrada)**.
- **`ZKSystem.db` → tabla `OPTION_INFO`** `(Option_Name, Option_Value, …)`: toda la config del equipo. Valores relevantes: `SimpleEventType=1`, `EventTypes=BF0FE07D…`, `realTimeEventFlagOne=4294967295`, `realTimeEventFlagTwo=0`, `AttPhotoFunOn=1`, `BioPhotoFun=1`, `UserPicURLFunOn=1`, **`SaveBioPhotoFunOn=0`**, `HidePinFunOn=0`.
- **`SimpleEventType` se probó en 0 y se revirtió a 1 (19/10):** el cambio por `SET OPTION` funciona, pero **no es el arreglo** — el esquema (`pushconfig/acc.tabledesc.xml`) muestra que el `rtlog` (`VIRTUAL_ACC_ATT_LOG`) y el log guardado (`ACC_ATT_LOG`) **ya tienen un campo `pin`**; el firmware simplemente no lo llena en el éxito. No depende del formato. **Dejar `SimpleEventType` en 1** (0 arriesga que el parser de producción no entienda el `rtlog`).
- **Config del alcoholímetro:** no está en `OPTION_INFO`; el servicio del MCU (`com.zkteco.edk.mcu.service`, por donde entra el DT1700) es **inaccesible** (otro UID, `Permission denied`). El umbral vive en el MCU/DT1700 y en el menú del equipo, **no es remoto**.
- El protocolo **oficial de asistencia** (`storage/doc-equipos/PROTOCOLO_PUSH.txt`) **no documenta** los eventos ACC (`EventTypes`, `realTimeEventFlag`, códigos 0/23/27): eso es del protocolo ACC, que tiene ZKTeco.

### 10.2 bis. HALLAZGO (19/10): el equipo SÍ guarda quién pasó — `VerifySuccess.txt`

El launcher escribe un archivo de rastreo **sin cifrar** con cada verificación exitosa: **`/sdcard/ZKTeco/trace/VerifySuccess.txt`**, una línea por pase:

```
2026-10-17 18:48:41 446:userPin->15724705; userName->Fernando Herrera Broncales:
```

Coincide 1 a 1 con los `event=0` (diferencia < 1 s: `rtlog` 18:48:40 ↔ traza 18:48:41; 18:59:59 ↔ 19:00:00) y con `coreServiceOpenDoor.txt` (`openDoor <hora>`). Se lee por el protocolo con `SHELL tail -n 3 /sdcard/ZKTeco/trace/VerifySuccess.txt`. **Es decir: el firmware sabe quién pasó; solo no lo pone en el `rtlog`.**

Otros archivos de la misma carpeta: `Verify.txt` (≈47 MB, detalle de cada verificación), `coreServiceOpenDoor.txt`, `VerifyException.txt`, `DataBase.txt`. Fotos de captura en `/sdcard/ZKTeco/data/capture/{pass,bad}` (vacías al 19/10). En la traza también aparecen pases de un usuario de prueba `userPin->1` (17/10 18:12–18:27) que no llegaron al servidor: explican el salto de `index` 7→15.

Cautelas: es un archivo de **rastreo** (no un dato del protocolo): el firmware podría rotarlo o cambiar su formato en una actualización; depende del comando `SHELL`, no documentado.

**Uso en el orden "facial primero" (subido a Azure el 19/10 08:58; falta un pase real con el modo activado):** con cada `event=0`, la API encola `SHELL tail -n 5 …/VerifySuccess.txt` (`verify-success.util.ts`, `PushSdkService.quienAprobo`, hasta 3 intentos) y toma la línea escrita **desde el segundo del rtlog hasta 10 s después** (nunca antes: una anterior es del pase previo). La salida del `SHELL` llega por `/iclock/devicecmd` (`Content=`) y se guarda como respuesta del comando. Al pasar el DNI: si el equipo dijo quién sopló y **no es el del DNI**, se deniega (`denegado_no_es_quien_soplo`, "No es quien sopló"); si coincide, se autoriza con `dni_que_soplo`; si el equipo no lo dijo en 6 s, se autoriza como antes, sin confirmar. Simulación local con un G4 falso: 5/5 (mismo DNI, otro DNI, DNI al instante, línea tardía, equipo sin responder).

### 10.3. Otra vía para recuperar la identidad: foto de la captura

El protocolo define que, en equipos de luz visible, el equipo puede subir la foto de cada verificación y **ese registro lleva el DNI**:
- `ATTPHOTO` (11.3): `PIN=<fecha>-<DNI>.jpg` (el DNI va en el nombre del archivo).
- `BIOPHOTO` (11.15): `BIOPHOTO PIN=<DNI> FileName=… Type=10 Content=<jpg>`.

Se activa con `TransFlag` incluyendo `AttPhoto`/`BioPhoto` (y `SaveBioPhotoFunOn=1`). **Receptor ya programado (19/10, sin desplegar):** `postCdata` atiende `table=tabledata&tablename=ATTPHOTO`, lo lee con `attphoto.util.ts` (`leerSnapshot`/`pinDeNombreSnapshot`), **no guarda la foto** (biométrico), extrae el DNI del nombre (`<fecha>-<dni>.jpg`), lo guarda en `verificacion_dispositivo` (`tabla='attphoto'`, solo metadatos) y responde `ATTPHOTO=<n>`. Falta: (1) **desplegar**; (2) `SET OPTION SaveBioPhotoFunOn=1` para que el equipo suba la captura; (3) **un pase real** (rostro + soplido) para confirmar si la captura del éxito trae el DNI o `-0.jpg`. Riesgo a sopesar: sube una captura de rostro por cada ingreso (biométrico → almacenamiento/privacidad).

> **Modo asistencia no sirve en este ACC:** el firmware solo manda datos reales si `/iclock/registry` responde `RegistryCode=…`; en modo asistencia responde `OK` y el equipo queda mudo (probado 19/10). El `AttPhoto` se agregó a `TransFlag` en `mollendo-api/src/push-sdk/asistencia.util.ts` (sin desplegar) por si se retoma esa vía con el proveedor.

### 10.4. Documento oficial del protocolo de acceso y códigos de evento (Apéndice 2)

El protocolo que usa este equipo es el **"Security PUSH Communication Protocol"** de ZKTeco (control de acceso), distinto del de asistencia. Copia en `docs/equipos/LECTOR CON RFACIAL/SDK ZKTeco Security PUSH Protocol-20200325/` (texto en `mollendo-api/storage/doc-equipos/PROTOCOLO_PUSH_SECURITY.txt`). Confirma el layout del `rtlog` (sección 10.2: `time, pin, cardno, eventaddr, event, inoutstatus, verifytype, index`; **`pin` = "the user ID"**) y trae la tabla de eventos (Apéndice 2) y de modos de verificación (Apéndice 3).

**Códigos de evento (Apéndice 2), 0-19/200-253 = normal, 20-99 = error, 100-199 = alarma:**

| event | Significado oficial |
|---|---|
| **0** | La puerta se abre normalmente **tras la verificación** (= éxito). *0, 14 y 17 se fusionan.* |
| 1 | Verificación en periodo de apertura normal |
| **23** | **Acceso no autorizado** (reconocido sin permiso) — aquí el equipo **sí** manda el DNI en `pin` |
| **27** | **Usuario no registrado** (fusiona 27, 30, 34) |
| 232 | **"Passed the verification"** — **descartado (19/10):** el `EventTypes` del equipo (`BF0FE07DB032010030000000700000000000000000000000007740F001000000`) **no lo soporta** (tampoco 14, 17 ni 231). Eventos soportados: 0-5, 7-11, 21-24, 26-30, 36, 37, 39, 41, 44, 45, 48, 68, 69, 100-102, 200-202, 204-206, 214, 220-224 |

`verifytype` (Apéndice 3): **15 = Face**, 1 = huella, 4 = tarjeta, 2 = User ID.

**`SimpleEventType` = "event merging"** (fusiona 0/14/17, etc.) — **no controla el `pin`**; cambiarlo no arregla el `pin=0` (probado 19/10 y revertido). El `pin` lo llena el firmware según el evento: en 23 va el DNI, en 0 (éxito) va 0.

**Alcohol:** el **protocolo estándar** no menciona el alcoholímetro, pero la **firmware OEM (OCM) sí expone su configuración** en `OPTION_INFO` (`ZKSystem.db`), legible y modificable por `SET OPTION`/SHELL (corrección del 19/10):
- `AlcoholDetectionFun=1` — detección de alcohol activa.
- **`AlcoholVolume=0.0001` — el umbral de embriaguez** (el "Umbral" del menú; unidad por confirmar con el proveedor, probablemente g/L). Se cambia con `SET OPTION AlcoholVolume=<valor>`.

El **resultado medido** por persona sigue sin llegar por el protocolo (`rtlog` manda `Concentration=0`; el log interno `transaction` guarda el valor real, ej. `0.00g/L`).

### 10.5. Procedimiento de prueba del `ATTPHOTO` (día de la prueba)

Objetivo: ver si la captura que sube el equipo en la verificación trae el DNI en el nombre (`<fecha>-<dni>.jpg`), y así recuperar quién pasó pese al `rtlog` con `pin=0`.

**Preparación (ya hecha el 19/10, dejar así hasta la prueba):**
1. Receptor `ATTPHOTO` desplegado en la nube (`postCdata` + `attphoto.util.ts`).
2. `SET OPTION SaveBioPhotoFunOn=1` + `RELOAD OPTIONS` en el equipo (que suba la captura).
3. `PUSH_SDK_DEPURAR=true` en el `.env` de la nube (para ver el POST en el log).

**El día de la prueba:**
1. Una persona **registrada** (ej. DNI 48058719 o 15724705) hace un **ingreso completo**: pasa su DNI, el G4 reconoce el rostro, y **sopla en el DT1700 hasta que dé resultado** (sin soplido completo el equipo **no** envía nada).
2. Leer el log de la API y buscar la línea `Captura (ATTPHOTO) recibida: … dniDerivado=…`:
   ```bash
   sudo docker compose logs api --since 5m | grep -iE "ATTPHOTO|Captura|rtlog"
   ```
   **Y en el mismo momento** (el registro de Android del equipo se pierde al reiniciarlo), encolar la lectura del registro del launcher, que muestra el usuario en cada paso del pase:
   ```sql
   INSERT INTO comando_dispositivo (dispositivo_id, comando) SELECT id,
   'SHELL logcat -d -v time | grep -iE ''addAttLog|UserPin=|User_PIN|userPin->|mUserPin|onFinishAlcohol|completeAlcohol|stateAlcohol'' | tail -80'
   FROM dispositivo_acceso;
   ```
   Si `UserPin=`/`mUserPin=` trae el DNI pero `addAttLog` lo deja vacío, el firmware lo pierde al guardar el registro tras el soplido (dato concreto para el proveedor).
3. Interpretar:
   - `dniDerivado=<DNI real>` → **resuelto**; falta solo programar la correlación captura↔ingreso por horario.
   - `dniDerivado=(no identificado)` (nombre `-0.jpg`) → el equipo tampoco identifica en la captura; descartar la vía.
   - **No llega `ATTPHOTO`** → el equipo no subió captura; revisar otros ajustes (`AttPhotoFunOn`, `TransFlag`) o consultar al proveedor.

**Al terminar la prueba (limpieza):**
```bash
# Revertir la subida de captura en el equipo:
sudo docker compose exec -T db psql -U mollendo -d mollendo_control_acceso -c \
  "INSERT INTO comando_dispositivo (dispositivo_id, comando) SELECT id, 'SET OPTION SaveBioPhotoFunOn=0' FROM dispositivo_acceso;"
sudo docker compose exec -T db psql -U mollendo -d mollendo_control_acceso -c \
  "INSERT INTO comando_dispositivo (dispositivo_id, comando) SELECT id, 'RELOAD OPTIONS' FROM dispositivo_acceso;"
# Apagar la depuración:
sed -i 's/^PUSH_SDK_DEPURAR=.*/PUSH_SDK_DEPURAR=false/' .env && sudo docker compose up -d api
```

> **Nota de privacidad/almacenamiento:** el receptor **no guarda la foto** (solo metadatos del nombre); si se decide persistir capturas de rostro, es una decisión aparte por ser biométrico.

### 10.6. Por qué el `pin=0` es anómalo, y consulta al proveedor

Investigación del 19/10 (equipo + protocolo oficial + software ZKTeco + internet):

- **La identidad SÍ es obtenible en principio.** El software de ZKTeco (ZKBioSecurity / ZKBio CVSecurity) **muestra la persona en cada evento de acceso**, y su API de terceros expone las transacciones **indexadas por PIN** (`transaction/monitor`, `transaction/person/{pin}`). Es decir: en una verificación estándar el equipo entrega el usuario. **Nuestro `pin=0` en el éxito es la anomalía, no la norma.**
- **No es la autorización temporal.** Se observó `pin=0` incluso con permiso **permanente** (el usuario manual con `userauthorize=50`). Así que el problema no es el flujo de habilitar/deshabilitar.
- **Sospechoso principal: la firmware OEM del alcohol.** El firmware es **`4.1.109-OCM-…`** (**OCM = OEM Customized**, build a medida para la integración del DT1700). El G4 **siempre** exige el soplido para completar la verificación (sin DT1700 no manda `rtlog`), así que no se puede aislar una verificación "solo rostro". El evento de apertura tras el alcohol probablemente se emite por una vía (linkage/OEM) que **no adjunta el usuario**.
- **No hay config pública que lo cambie:** `SimpleEventType` es solo fusión de eventos; el alcohol no figura en el protocolo oficial; el servicio del MCU es inaccesible.

**Consulta para el proveedor (quien hizo la personalización OCM):**

> Equipo: G4 Pro, serie `HSR3263100192`, firmware `4.1.109-OCM-4101-3`, con alcoholímetro DT1700, integrado por **protocolo PUSH de control de acceso** (servidor propio, no ZKBioSecurity).
> 1. En una verificación **exitosa** (`event=0`, tras rostro + soplido), el `rtlog` y la tabla `transaction` del equipo traen el campo `pin` en **0**, no el ID del usuario. En `event=23` (reconocido sin permiso) **sí** llega el DNI. ¿Por qué el éxito no lleva el usuario? ¿Es por la firmware OCM / el flujo del alcohol?
> 2. ¿Qué **opción** del equipo (`SET OPTION …`) hace que el `event=0` lleve el `pin`? Probamos `SimpleEventType` (0 y 1) sin efecto.
> 3. En su software ZKBioSecurity, el evento muestra a la persona: ¿cómo obtiene el ID en una verificación con alcohol — del `pin` del evento, o de la **foto de captura** (`ATTPHOTO`, cuyo nombre sería `<fecha>-<DNI>.jpg`)?
> 4. ¿El equipo sube la captura de cada verificación con el **DNI** en el nombre? ¿Qué opción la activa (`SaveBioPhotoFunOn`, `TransFlag`…)?
> 5. ¿El **resultado del alcohol** (grado) se puede recibir por el protocolo asociado al usuario? Hoy el `rtlog` manda `Concentration=0` (solo el log interno guarda el valor real).
> 6. Cuando una persona **falla la prueba de alcohol** (`event=1`), ¿cómo saber **qué usuario** fue? El equipo lo reconoce por el rostro antes del soplido, pero no lo anota en el `rtlog` ni en `VerifySuccess.txt` (solo registra los éxitos).
> 7. El equipo tiene configurada la nube de ZKTeco (`ufo.zkclouds.com`, servicio `com.zkteco.biocv.edk.iot.service`). ¿Qué envía ahí? ¿Los accesos con el usuario y el grado de alcohol? ¿Hay forma de recibirlos nosotros (API o reenvío)?

**Dónde está el flujo del alcohol (revisado 19/10, por `SHELL strings` sobre los `base.vdex`):** no en `com.zkteco.android.core` ni en `com.zkteco.android.accesscontrol` (solo tienen `AlcoholDetectionFun`/`AlcoholVolume`), sino en el **launcher** `com.zktechnology.android.launcher` (paquete `com.zktechnology.android.alcohol`: `onStartAlcoholDetect`, `completeAlcoholDetected`, `onFinishAlcoholResultHandler`, `mShouldWaitAlcoholDetect`, `addAttLog concentration:`). El launcher escribe en el logcat mensajes con el usuario (`UserPin=%s, success=%s, capturePicValue=%s`, `userPin->`, `mUserPin=`, `User_PIN=`), legibles por `SHELL logcat -d` → ver sección 10.5.

**Registros internos (revisado 19/10):** el campo `index` del `rtlog` (número de registro del equipo) sube de 1 en 1 y cada pase genera **un solo** registro: el éxito no viene acompañado de otro registro oculto con el usuario. Hay algunos saltos sueltos (registros que no llegaron al servidor, causa sin confirmar), pero en la mayoría de los pases el éxito lleva el número siguiente al `event=23` previo, sin nada en medio.

**Dos caminos vivos** (no excluyentes): (a) la prueba del `ATTPHOTO` ya armada (sección 10.5); (b) esta consulta al proveedor, que probablemente da la respuesta definitiva por ser firmware a medida.

### 10.7. Pendientes de probar (al volver) — estado 19/10/2026

**Una sola sesión en la sede, con "Facial primero" activado** (Sistema y APIs → Orden del ingreso), avisando enseguida al terminar (antes de reiniciar el G4):

1. **Amiel sopla y pasa su DNI** → debe entrar con la marca "Facial primero" verde; en el log de la API: `Facial primero: aprobó el DNI 48058719`.
2. **Amiel sopla y Fernando pasa su DNI** → "No es quien sopló".
3. **Amiel sopla, Fernando sopla detrás, y pasan su DNI en cualquier orden** → entran los dos (varias aprobaciones a la vez).
4. **Fernando sopla con alcohol** (buche de enjuague bucal con alcohol) → rechazo por alcohol. Es para el hueco 2 (sección 10.8): ver si la foto del rechazo trae su DNI (`ls /sdcard/ZKTeco/data/capture/bad`) y consultar enseguida la tabla `transaction` por si guarda el rechazo con el usuario. **Revisarlo el mismo día**: el G4 borra sus fotos cada noche a las 02:46.
5. Con esos mismos pases: ¿llegó `Captura (ATTPHOTO) recibida: … dniDerivado=<DNI>` al log? (sección 10.5) y leer el logcat (sección 10.5).

- **Ya probado (19/10):** la desconexión rápida de la mini PC (`docker pause`: "Desconectado" a los ~19 s sin reporte).
- **Limpieza tras la prueba:** `SET OPTION SaveBioPhotoFunOn=0` + `RELOAD OPTIONS`, y `PUSH_SDK_DEPURAR=false` (+ `docker compose up -d api`). La confirmación de quién sopló **no** depende de la depuración.

### 10.8. Qué datos da el G4 y dónde (guía para pruebas futuras, 19/10/2026)

**El G4 siempre sabe quién es** (reconoce el rostro antes del soplido). Lo que cambia es si lo **cuenta** y dónde:

| Resultado en el G4 | ¿DNI? | ¿Medición de alcohol? |
|---|---|---|
| **"Acceso ilegal" (`event=23`)**: rostro reconocido **sin permiso** en el equipo (p. ej. de baja; o en el antiguo proceso B, antes de recibir el permiso) | **Sí**, en el aviso (`rtlog`, `pin=<DNI>`), aunque haya soplado | No (`Concentration=0`) |
| **"Verificación exitosa" (`event=0`)** | En el aviso **no** (`pin=0`); **sí** en `VerifySuccess.txt` | En `Verify.txt`, sin DNI |
| **Alcohol alto (`event=1`)** | **No, en ningún lado** (hueco 2) | En `Verify.txt`, sin DNI |
| **Rostro no registrado (`event=27`)** | No (no es nadie registrado) | No sopla |

En "Facial primero" todo el personal activo tiene permiso, así que nunca sale "Acceso ilegal": sale éxito o alcohol alto. El `rtlog` manda **siempre** `Concentration=0`: el valor medido solo está en `Verify.txt`.

**Los dos archivos de rastreo** (carpeta `/sdcard/ZKTeco/trace/`, sin cifrar, se leen con `SHELL`):

| Archivo | Qué anota | Datos de cada línea |
|---|---|---|
| **`VerifySuccess.txt`** (~8 KB) | **Solo los pases exitosos**, una línea por pase | Fecha, hora, **DNI y nombre**: `2026-10-17 18:48:41 446:userPin->15724705; userName->Fernando Herrera Broncales:` |
| **`Verify.txt`** (~47 MB) | **Todos los pasos** de todos los intentos (diario interno del programa de pantalla) | Fecha, hora y una frase técnica por paso. **Sin DNI.** La única línea útil es la del alcoholímetro: `onUsbDetectNotifyResult result:R+TRESULT,<grado>,5,<resultado>` (resultado `0` = pasó, `2` = rechazado) |

Ejemplo de `Verify.txt` (pase de Fernando, 17/10): `18:48:19 onUser` (reconoció un rostro) → `onStartAlcoholDetect` (pide soplar) → `18:48:33 R+TRESULT,0.000,5,0` (midió 0,000) → `18:48:40 onRecord` → `18:48:41 验证成功 可以开门` ("verificación exitosa, puede abrir"). Rechazo de Fernando del 16/10: `18:20:54 onUser` → `18:21:23 R+TRESULT,2.500,5,2` (midió 2,5) → `18:21:33 onRecord`, sin DNI en ninguna línea. Si la persona no sopla, el G4 espera ~15 s y vuelve a empezar sin avisar (`cleanData`/`onWait`).

**Dónde más se buscó el DNI de un rechazo por alcohol (19/10, sin resultado):** todos los archivos de `/sdcard/ZKTeco/trace/` (solo `DataBase.txt` anota `addAccAttLog`, sin DNI), `/sdcard/EDK/`, el logcat de Android (el launcher no anota el usuario ahí), la tabla interna `transaction` (18/10: los rechazos por alcohol no se guardan), los datos del launcher (`/data/data/com.zktechnology.android.launcher`, sin bases), las carpetas `/sdcard/ZKTeco/data/{push,temp,photo}` (vacías) y las copias de respaldo `/sdcard/ZKTeco/data/databases/ZKBackupDatabases{1,2}/ZKDB.db` (**cifradas**, como la original; no se intenta descifrarlas).

**Inventario completo (19/10, segunda pasada):** se buscaron los archivos modificados en el minuto de una verificación (`find / -mmin`, solo cambió `DataBase.txt`) y se listaron los datos de todos los programas de ZKTeco. La comparación del rostro se guarda en **`ZKDB.db` y `ZKEXTDB.db`, ambas cifradas** (también sus copias de respaldo); `ZKSystem.db` y los `shared_prefs` solo tienen configuración; los programas del MCU/alcoholímetro y de tarjetas no dan acceso (otro UID). **No queda nada legible por revisar.** Hallazgo: el servicio `com.zkteco.biocv.edk.iot.service` está configurado con la nube de ZKTeco (`wss://ufo.zkclouds.com`, con credenciales del equipo en su `shared_prefs`; no copiarlas): podría estar enviando ahí los registros con el usuario (pregunta para el proveedor).

**Corrección del 18/10:** "los rechazos por alcohol no se guardan en la tabla `transaction`" no está comprobado: esa consulta fue posterior al reinicio del registro del G4 (17/10 ~17:50) y desde entonces no hubo ningún `event=1`. Repetir `DATA QUERY tablename=transaction,fielddesc=*,filter=*` justo después del paso 4 de la sección 10.7.

**PISTA FUERTE (19/10): "Security Mode" del G4.** El manual (G4 Pro ACC v1.2, sección 10.14 *Security Setting*) dice que el modo seguro sirve para *"hide the user's personal information to prevent leakage during user verification"*. Nuestro G4 lo tiene **encendido**: `ClearPhoto.txt` anota cada noche `安全模式, 开始清除照片` ("modo seguro, comenzando a borrar fotos") desde el 22/09. Explicaría el `pin=0` en los pases verificados (y el borrado nocturno de fotos), y que los demás equipos ACC del monitor de TROK sí manden el usuario. **Sin comprobar.** Pasos: (1) leer la opción en `OPTION_INFO` por `SHELL` (nombre a confirmar: buscar `Security`/`Privacy`); (2) si está activa, apagarla en el G4: Menú → System Settings → Security Setting → Security Mode OFF (decisión del cliente: cambia la configuración); (3) un pase y ver si llega `pin=<DNI>`, y si el `event=1` también. Descartado el 19/10: que dependa del largo del número de usuario (el 17/10 un usuario con número `1` también llegó con `pin=0`; el manual admite 1 a 9 dígitos). Manual 10.3.1 *Camera Mode*: opción "Save after failed verification" (foto en los rechazos, para el hueco 2).

**Pantalla "Security Setting" (manual, imagen de la pág. 88; el texto del manual no la describe):** 5 interruptores: **Security Mode**, **Standalone communication**, **Verify masked user ID** (ocultar el número de usuario al verificar), **Verify masked personnel name** (ocultar el nombre al verificar; explicaría el "..." en "¡Verificación Exitosa!") y Enable ADB network debug. "Verify masked user ID" es la candidata directa del `pin=0`. **Dato en contra:** `OPTION_INFO` tiene `HidePinFunOn=0`; no se sabe si es el mismo interruptor (los nombres internos suelen diferir). Ver en el equipo y probar apagando "Verify masked user ID", "Verify masked personnel name" y, si hace falta, "Security Mode" (anotar cómo estaban para poder volver).

**Qué hace el Security Mode en otros equipos ZKTeco** (manuales IN710 y RevFace15): al verificar, muestra el número de usuario con asteriscos en pantalla, permite trabajar sin conexión y tiene opciones para ocultar el nombre. No se encontró si también lo oculta en lo que se envía al servidor. Coincide con lo visto en la sede: el aviso "¡Verificación Exitosa!" mostraba el nombre como "..." (sección 8).

**Cambio de modo acceso ↔ asistencia (documento ZKTeco "Diferencia Modo Acceso y Modo Asistencia en equipos Visible Light", ene/2023):** se hace en el menú del equipo, *Sistema → "Tipo de dispositivo"*. Si el equipo no tiene ese menú, **el soporte técnico activa los parámetros por conexión remota** (por eso `DeviceType=att` por PUSH o por el puerto 4370 volvía a `acc`, 17-18/10). **Al cambiar se borran los usuarios y los eventos del equipo** (se vuelven a cargar con "Sincronizar ahora"). En asistencia sigue controlando la puerta; se pierden "salida de alarma" y "vinculaciones" (no se usan).

**Próximos pasos (19/10):** (1) en la sede, fotos de las pantallas *Security Setting* y *Sistema → Tipo de dispositivo*; (2) probar primero apagar el Security Mode + un pase (no borra nada, reversible); (3) si no basta, pedir al soporte el cambio a asistencia. Cuando el G4 se reconecte: leer por `SHELL` el estado del Security Mode y buscar en `OPTION_INFO` el parámetro que habilita "Tipo de dispositivo".

**Fotos de captura:** el G4 las guarda en `/sdcard/ZKTeco/data/capture/pass` (pasó) y **`capture/bad` (falló)**, solo con `SaveBioPhotoFunOn=1` (activado el 19/10 03:13) y **las borra cada noche a las 02:46** ("modo seguro", ver `ClearPhoto.txt`). Por eso el rechazo de Fernando del 16/10 no dejó foto. **Única pista viva para el hueco 2:** si el nombre de la foto de un rechazo trae el DNI (`<fecha>-<DNI>.jpg`, como dice el protocolo). Se prueba con el paso 4 de la sección 10.7.

**Opciones si la foto tampoco trae el DNI:** (a) preguntar al proveedor del firmware OCM (agregar a la consulta de la sección 10.6: "¿cómo saber qué usuario falló la prueba de alcohol?"); (b) aceptar que en "Facial primero" el rechazo por alcohol queda sin nombre (en el orden normal sí queda con nombre, porque el DNI se pasa antes). **Mejora opcional, independiente:** guardar la medición real de cada pase leyendo la línea `R+TRESULT` de `Verify.txt` por la hora (como se hace con `VerifySuccess.txt`); por su tamaño, leer solo el final (`tail`).

**Detección de desconexión (ya aplicado):** G4 Pro a 20 s (`UMBRAL_EN_LINEA_PORTAL_MS` en `push-sdk.service.ts`); controlador/lectores/relés a ~18 s (`estado()` en `controlador.gateway.ts`) con el controlador reportando cada 5 s (`ESTADO_CADA_MS` en `controlador.service.ts`). La sincronización sigue en 2 min.
