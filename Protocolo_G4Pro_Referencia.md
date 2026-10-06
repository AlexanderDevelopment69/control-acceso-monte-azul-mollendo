# Referencia técnica: comunicación con el terminal facial ZKTeco G4 Pro

Proyecto: Sistema de Control de Accesos · Terminal Monte Azul Mollendo (TMAM)
Última actualización: 05/oct/2026

Este documento reúne **todo lo confirmado con el equipo real** sobre cómo se comunica el sistema con el G4 Pro: conexión, rutas, comandos, respuestas, códigos de evento y particularidades del firmware. Para el historial de las pruebas, ver `Estado_Implementacion_Integracion_G4Pro.md`; para la instalación, `Registro_Despliegue_MiniPC.md` (sección 8e).

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

- **Nunca registrar personas a mano en el G4 Pro.** Un usuario creado desde la pantalla del equipo recibe **permiso de paso permanente** (un usuario manual dejó `userauthorize=50`). Como los éxitos llegan sin `pin`, podría verificarse mientras otra persona está habilitada y el sistema se lo atribuiría a esa persona. La sincronización diaria los borra.
- **No usar al personal como administradores del equipo** (`Privilege=14`): al editar a la persona, el sistema vuelve a enviar `Privilege=0`.
- **Nombre "..."** en el aviso "¡Verificación Exitosa!": el nombre está guardado (`user.Name` y `extuser`), y la lista de usuarios a veces lo muestra y a veces no. Pendiente de investigar.
- El **reloj** del G4 Pro conviene que coincida con el de la mini PC (el `rtlog` trae la hora del equipo y se usa como hora del ingreso).

---

## 9. Enviar un comando a mano (soporte)

En la mini PC, dentro de `~/mollendo`:

```bash
sudo docker compose -f docker-compose.prod.yml exec -T db psql -U mollendo -d mollendo_control_acceso -c \
  "INSERT INTO comando_dispositivo (dispositivo_id, comando) SELECT id, 'DATA COUNT user' FROM dispositivo_acceso;"
# Estado del comando:
sudo docker compose -f docker-compose.prod.yml exec -T db psql -U mollendo -d mollendo_control_acceso -c \
  "SELECT id, estado, return_code, left(comando, 60) FROM comando_dispositivo ORDER BY id DESC LIMIT 5;"
# Respuesta (en el registro del backend):
sudo docker compose -f docker-compose.prod.yml logs --since 2m api | grep "Respuesta de"
```

Para los campos separados por tabulador, usar `E'…\t…'` en el texto del comando.
