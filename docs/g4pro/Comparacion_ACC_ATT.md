# G4 Pro: modo control de acceso (ACC) y modo asistencia (ATT)

Qué envía el G4 Pro con alcoholímetro en cada variante de firmware, con los valores reales de los dos equipos (18/10/2026):

- **ACC (control de acceso):** el equipo del cliente, **HSR3263100192**. Es el que se usa.
- **ATT (asistencia):** el equipo del soporte, **HSR3241200002**, visto en el servidor ADMS de TROK.

Los dos tienen el mismo firmware (4.1.109-OCM-4101-3, Push Ver 2.0.38-20220623, plataforma ZIM200). Lo que cambia es la **variante** (ACC o ATT), que la fija el firmware y solo la cambia ZKTeco o el distribuidor. Ver la conclusión al final y el detalle de las pruebas en `Historial_Integracion_G4Pro.md`.

## 1. Qué envía cada modo en cada paso

| Paso del proceso | ACC (HSR3263100192) | ATT (HSR3241200002) |
|---|---|---|
| Al conectarse | Se anuncia con `DeviceType=acc` y se registra (`registry`, `push`) | No se registra: pide su configuración y envía marcaciones |
| Persona no registrada | `event=27`, `pin=0` | No genera marcación |
| Persona registrada sin permiso | `event=23`, **con PIN** | No aplica: en asistencia no hay permisos por persona |
| **Aprobado** (rostro + alcohol bien) | `event=0`, **`pin=0`**, `Concentration=0` | Marcación **con DNI** y **`0.00g/L`** |
| **Alcohol alto** | `event=1`, **`pin=0`**, `Concentration=0` | Marcación **con DNI** y el grado (`1.229g/L`, visto en el monitor de TROK, sección 3 bis) |
| Estado de la puerta o el relé | `rtstate` (`relay=01` / `relay=00`) | No envía |

## 2. Campo por campo: un aprobado

| Dato | ACC, tiempo real (`rtlog`) | ACC, guardado en el G4 (`transaction`) | ATT, marcación (`ATTLOG`) |
|---|---|---|---|
| Identidad (DNI) | **`pin=0`** | **`pin=` (vacío)** | **`44943297`** |
| Hora | `time=2026-10-17 18:59:59` | `time_second=861217199` | `2026-09-28 13:03:31` |
| Resultado | `event=0` (apto) | `eventtype=0` | `Status=255` (marcación) |
| Cómo verificó | `verifytype=15` (rostro) | `verified=15` | `Verify=15` (rostro) |
| **Valor de alcohol** | **`Concentration=0`** (no lo envía) | **`Concentration=0.00g/L`** | **`0.00g/L`** |
| Mascarilla | `maskflag=255` | `maskflag=255` | `255` (campo 8) |
| Temperatura | `temperature=0` | — | `Temperature=0` |
| Otros | `cardno=0`, `eventaddr=1` (puerta), `index` (correlativo) | `doorid=1`, `index` | `Workcode=0`, reservados en 0 |

Líneas reales:

```
ACC, tiempo real:  time=2026-10-17 18:59:59  pin=0  cardno=0  eventaddr=1  event=0  inoutstatus=0  verifytype=15  index=19  maskflag=255  Concentration=0
ACC, guardado:     index=19  cardno=  pin=  verified=15  doorid=1  eventtype=0  inoutstate=1  maskflag=255  Concentration=0.00g/L
ATT:               44943297  2026-09-28 13:03:31  255  15  0  0  0  0  0  0    0.00g/L  -  -  -
```

Formato oficial del ATTLOG (protocolo de asistencia de ZKTeco, 2026-04-22, sección 11.2): `Pin, Time, Status, Verify, Workcode, Reserved1, Reserved2, MaskFlag, Temperature, ConvTemperature, TimeOffset`. Este equipo agrega al final `Concentration` (alcohol), `SleepTime`, `HealthStatus` y `PlateNumber`.

### 2 bis. Los 15 campos del ATTLOG, uno por uno (confirmado el 20/10/2026)

Se compararon las **28 marcaciones reales** del 19/10 (Amiel y el vigilante, aprobadas y con alcohol) con el manual oficial (`mollendo-api/storage/doc-equipos/PROTOCOLO_PUSH.txt`, sección 11.2 y anexo 7) y con el `rtlog` que el mismo G4 mandaba en ACC, que trae los mismos datos **con nombre** (`... index=413 ... maskflag=255 temperature=0 convtemperature=0 Concentration=0 SleepTime=0 HealthStatus=0 PlateNumber=0`, ver `Protocolo_G4Pro_Referencia.md` 6.1). Línea real:

```
71988749  2026-10-19 18:27:00  255  15  0  0  0  255  0  0  28  0.00g/L  -  -  -
```

| # | Valor | Qué es | Fuente |
|---|---|---|---|
| 1 | `71988749` | PIN: el DNI de quien verificó | Manual |
| 2 | `2026-10-19 18:27:00` | Hora de la verificación (reloj del G4) | Manual |
| 3 | `255` | Estado de marcación (entrada/salida/descanso…). 255 = ninguna tecla de estado: el G4 no la pide | Manual; 255 = convención ZKTeco (en las 28, siempre 255) |
| 4 | `15` | Forma de verificación: **15 = rostro** | Manual, anexo 7 |
| 5 | `0` | Código de trabajo (no se usa) | Manual |
| 6, 7 | `0`, `0` | Reservados | Manual |
| 8 | `255` | Mascarilla (0 sin, 1 con); 255 = detección apagada, igual que `maskflag=255` del `rtlog` | Manual + `rtlog` |
| 9 | `0` | Temperatura (el equipo no tiene sensor) | Manual |
| 10 | `0` | Temperatura convertida (°C/°F) | Manual |
| 11 | `1`…`28` | Número de la marcación en el equipo: sube de 1 en 1 sin saltos desde el cambio a ATT. El manual pone aquí `TimeOffset` (diferencia con UTC, sería −18000 en Perú); el G4 pone su correlativo, como el `index=` del `rtlog` | Datos reales (28 de 28) |
| 12 | `0.00g/L` | `Concentration`: grado de alcohol (0.00 en los aprobados; 0.000158 a 0.000951 en los enjuagues) | `rtlog` + datos reales |
| 13 | `-` | `SleepTime` (función de fatiga, no se usa) | Mismo orden que el `rtlog` |
| 14 | `-` | `HealthStatus` (estado de salud, no se usa) | Mismo orden que el `rtlog` |
| 15 | `-` | `PlateNumber` (placa de vehículo, no se usa) | Mismo orden que el `rtlog` |

El sistema decide solo con 1 (DNI), 2 (hora) y 12 (grado). El 11 se usa en el monitor del G4 (Sistema y APIs) para avisar si falta una marcación. En internet no hay más detalle: las librerías ADMS públicas leen solo los 5 primeros campos ([s0x90/zkteco-adms](https://github.com/s0x90/zkteco-adms), [skylinebiz/adms](https://github.com/skylinebiz/adms)) y ninguna fuente pública documenta el alcohol en ATTLOG.

## 3. Resumen

| | ACC (hoy) | ATT (pedido a ZKTeco) |
|---|---|---|
| ¿Dice quién pasó? | Solo en el rechazo por falta de permiso; nunca después de soplar | Sí, siempre |
| ¿Dice cuánto alcohol? | En tiempo real no; guardado en el equipo sí | Sí, en cada marcación |
| ¿Controla quién puede verificar? | Sí (permiso por persona: se habilita a una a la vez) | Sí, por grupo de acceso y horario del usuario (manual ATT, sección 5.5); falta confirmar cómo usarlo para habilitar a una sola persona |
| ¿Sirve para "DNI primero"? | Sí (así funciona hoy) | Sí |
| ¿Sirve para "facial primero" con identidad? | No (no se sabe quién sopló) | Sí |

En el historial de Azure (16 al 18/10, 128 eventos): todo lo de antes de soplar llega con PIN (`event=23`: 35 de 35) y todo lo de después, sin PIN (`event=0`: 36 de 36; `event=1`: 6 de 6). Los 14 aprobados guardados en la memoria del G4 también tienen el PIN vacío.

## 3 bis. Revisión del monitor de TROK (19/10/2026)

Se leyeron los 1 426 mensajes `POST /iclock/cdata` del monitor de TROK (`https://adms.trok.dev/api/request-logs/?method=POST&path=cdata`, 23 equipos de clientes del proveedor; solo formatos y conteos, sin guardar datos personales; las descargas se borraron).

**Los demás equipos de control de acceso SÍ mandan el DNI en el éxito.** Conteo de `event=0` por equipo:

| Equipo | `event=0` con DNI | `event=0` con `pin=0` |
|---|---|---|
| PQU8253700006 | 23 | 0 |
| BRIC214760013 | 13 | 0 |
| AVT6262700029 | 7 | 0 |
| PQU8253700017 | 4 | 0 |
| BRIC214760016 | 3 | 0 |
| AVT6262700017 | 2 | 0 |
| CP9M223760025, TH40522450018 | 1 cada uno | 0 |
| **HSR3263100192 (el nuestro, con alcoholímetro)** | **0** | **31** |

O sea: el `pin=0` en el éxito **no es del protocolo ni de nuestro servidor**; es propio del firmware OCM con alcoholímetro en variante ACC.

**La variante ATT con alcoholímetro manda también los rechazos por alcohol, con DNI y grado.** Equipo del soporte HSR3241200002 (07/09/2026): marcaciones `<DNI> 2026-09-07 11:46:50 255 15 0 0 0 0 0 0  1.229g/L - - -`, luego `0.738g/L` y `0.278g/L` (además de las de `0.00g/L`). Otro equipo ATT con alcoholímetro, **NZF7250700002**, manda el mismo formato. El `Status` es `255` en todas (aprobado o no): **el resultado se decide comparando el grado con el umbral**. Esto resuelve en ATT los dos huecos de "facial primero" (quién sopló y quién dio alcohol alto), y además da el grado real.

## 3 ter. Manual oficial de la variante ATT (19/10/2026)

"G4 Pro ATT_User Manual EN_v1.2_20221221" (112 págs., https://www.zkteco.me/download-file/3380; misma versión que el manual ACC del proyecto). Revisado texto e imágenes de las pantallas:

- **No hay menú para cambiar de ACC a ATT** (tampoco en el manual ACC): la lista de System Settings es la misma, salvo "Attendance parameters" en lugar de "Access control record settings". El cambio lo habilita el soporte (documento ZKTeco "Diferencia Modo Acceso y Modo Asistencia", ene/2023; borra usuarios y eventos).
- **Registro de usuarios igual** que en ACC: número de usuario de 1 a 9 dígitos (el DNI sirve), nombre, foto, rostro, tarjeta, contraseña.
- **ATT también controla el acceso**: apertura de puerta, *Access Group Settings* (grupo con modo de verificación, horario y feriados), *Verification Combination*, antipassback y alarma de coacción. En el protocolo de asistencia el usuario lleva `Grp=` y `TZ=` (visto en el equipo del soporte: `Grp=1 TZ=0000000100000000`): **probablemente se pueda seguir habilitando a una sola persona** cambiando su grupo u horario (a confirmar).
- **Alcoholímetro:** no lo menciona (es del firmware OCM).
- **Security Setting:** los mismos 5 interruptores que en ACC.
- **HTTPS:** permite "Open HTTPS" hacia el servidor ADMS (hoy el G4 usa HTTP).
- **Comparación completa ACC vs ATT** (línea por línea, 54 bloques distintos; la mayoría solo cambia "access logs" por "attendance data"). Lo que importa:
  - **Grupos de acceso** (pág. 52): número de grupo, modo de verificación, hasta 3 horarios y feriados; usuarios nuevos al grupo 1. **Modo de verificación por usuario** (pág. 40). Idea para habilitar a una sola persona: todos en un grupo sin horario permitido y pasar al grupo con acceso solo a quien pasó su DNI (a probar).
  - **Attendance parameters** (pág. 81): *Verification time interval* (por defecto 5 s; mínimo entre marcaciones de la misma persona: dejarlo bajo), *Status mode* (pedir entrada/salida/descanso: dejarlo en *Disable* o fijo), *Camera mode* (incluye guardar foto en verificación fallida), *Show the verification photo*, *Delay duration of the confirmation screen*.
  - En ATT, *Access Control Options* ya no tiene "Verification mode", "Door valid time zone" ni "Master device" (pasan a grupos y usuarios); agrega *Error alarm* (3 intentos fallidos), *Normally close period* y alarma de coacción.

## 3 quater. Cambio a ATT (19/10/2026, 14:16)

Por indicación del soporte, se cambió en el equipo: menú *firmware type settings* → **Attendance**. Al reconectarse a Azure:

- Se anuncia con `DeviceType=att` y `pushver=2.4.1`, pide `options=all` y el servidor le responde las opciones de asistencia (`opcionesAsistencia`). Consulta comandos cada ~2 s.
- **El cambio borró los usuarios:** `UserCount=0`, `FaceCount=0`, `TransactionCount=0`.
- El servidor ya guarda las marcaciones (`ATTLOG`), pero **todavía no decide ingresos con ellas** (nadie escucha `dispositivo.attlog`). Los comandos de usuarios y permisos del API son del formato ACC (`DATA UPDATE user`, `userauthorize`): en ATT el formato es `DATA UPDATE USERINFO PIN=…` y no existe `userauthorize`.

**Prueba del 19/10 en ATT** (Amiel 48058719 y Fernando 15724705 registrados por comandos `DATA UPDATE USERINFO PIN=…\tName=…\tPri=0\tPasswd=\tCard=\tGrp=1\tTZ=0000000100000000\tVerify=-1\tViceCard=` y `DATA UPDATE biophoto …` igual que en ACC; los 4 con `Return=0`):

| Hora G4 | Llegó al servidor | Marcación | Resultado |
|---|---|---|---|
| 14:23:57 | 14:24:08 (11 s) | `48058719 … 255 15 0 0 0 255 0 0 1 0.00g/L - - -` | apto |
| 14:24:25 | 14:24:35 (10 s) | igual, correlativo `2` | apto |
| 14:25:28 | 14:25:43 (15 s) | igual, correlativo `3`, **`0.000951g/L`** | alcohol alto (umbral `AlcoholVolume=0.0001`), sopló Amiel |

- **Llega el DNI en todos los casos, también en el alcohol alto, y el grado real.** Se resuelven los dos huecos de "facial primero".
- `Status` es `255` siempre: el resultado se decide comparando el grado con el umbral.
- La columna 11 es un correlativo de marcación (1, 2, 3).
- Llega con `Stamp=9999` y unos **10 a 15 s** después de la verificación.

**API adaptado al modo asistencia** (19/10/2026, primera versión a las 14:40; reglas finales a las 17:38). Checklist de pruebas en `Checklist_Pruebas_Asistencia.md`.

**Equipo y registro de personas**
- **El servidor detecta solo el modo del equipo** (`push-sdk/protocolo-g4.ts`, ajuste `protocolo_g4` = `asistencia`/`acceso`): por el `DeviceType` del `options=all` y por la llegada de un `ATTLOG`. Las respuestas a `/iclock/registry` y `/iclock/push` ya no dependen del ajuste.
- **Personas** con `DATA UPDATE USERINFO PIN=…` (`asistencia.util.ts`). La foto va con el mismo `biophoto` que en ACC y el borrado con `DATA DELETE USERINFO PIN=…`. En ATT no hay permisos de paso: el G4 verifica a todo su personal y decide el sistema.
- **Sincronización:** `DATA QUERY USERINFO`. El G4 responde por `table=OPERLOG` (`USER PIN=…`, `BIOPHOTO`) y `table=BIODATA` (plantillas `Type=9`). Solo se guardan los números y los datos de cada usuario; las plantillas y las fotos se descartan. Con eso se reusa el plan de ACC: borra a los que el sistema no conoce, corrige los datos cambiados a mano y carga a quien falte. "Permisos quitados" queda siempre en 0. La tarjeta del equipo muestra cómo queda después de la sincronización.

**Decisión del ingreso** (`EventosAccesoService.registrarIngresoAsistencia` y `resultadoAsistencia`)
- El DNI y la prueba se juntan **por persona** (el `ATTLOG` trae el DNI), con varias personas a la vez. Aprueba si el grado es menor que el umbral (`G4PRO_UMBRAL_ALCOHOL`, por defecto 0.0001 g/L, el `AlcoholVolume` del equipo); sin grado legible, no aprueba.
- **Demora del aviso del G4** (medida el 19/10): 10-12 s después de terminar la prueba con 0.00; 15-17 s con alcohol alto. **Corrección del 21/10** (`Verify.txt` del equipo): esa espera ocurre antes del "correcto" (el G4 tarda unos 8 s en decirlo después de medir); el aviso llega ~1 s después del "correcto". La hora del G4 y la del servidor difieren en 1-2 s. Se compara siempre la hora de la prueba (la del G4) con la del DNI, sin margen.
- **Orden DNI → Facial + Alcohol** (en Sistema y APIs, "Orden del ingreso"): vale solo la prueba hecha **después** del DNI. El DNI queda en espera 1 minuto, con cuenta regresiva en el Panel; luego, "No completó rostro y alcohol". **Desde el 21/10/2026** el minuto es para **soplar**: vale la prueba soplada dentro del minuto aunque su aviso llegue después (la espera sigue abierta 20 s más, `GRACIA_AVISO_G4_MS`); una soplada después del minuto no vale. Una prueba aprobada sin DNI previo no vale.
- **Facial primero:** vale solo la prueba hecha **antes** del DNI.
  - Hay **15 s** para pasar el DNI desde que aparece "pase su DNI" en el Panel, es decir, desde que llega el aviso del G4, casi lo mismo que desde el "correcto" (ver la corrección del 21/10 arriba; `PLAZO_DNI_DESDE_AVISO_MS`, 17:57; desde el 21/10/2026, **30 s**). Contados desde el "correcto" quedaban 5 s en el Panel y no alcanzaban: en la garita se tardó 14 y 18 s. La fila "Aprobó … pase su DNI" muestra la foto de quien sopló. Si no pasa el DNI a tiempo: "No pasó su DNI a tiempo".
  - Si el DNI llega antes que el aviso del G4, espera **en silencio hasta 8 s** (`ESPERA_PRUEBA_EN_CAMINO_MS`), sin mostrarse en el Panel. Si llega su prueba con 0.00, entra.
  - Si pasa el DNI sin una prueba suya, o fuera de plazo: **"DNI antes del facial"** (`denegado_sin_facial`). Sin cuenta regresiva, por pedido de TMAM.
- **Alcohol alto:** queda denegado **con su nombre** en los dos órdenes, aunque no pase el DNI, y suena el aviso. En facial primero, si pasa el DNI en el minuto siguiente, se le responde con el mismo rechazo, sin otra fila.
- **Vale la primera marcación del pase** (`MISMO_PASE_MS`, 20 s): volver a soplar enseguida no cambia el resultado; luego, un soplido nuevo es otro intento. **No hay bloqueo** después de un positivo, por decisión de TMAM. Un intento nuevo con alcohol alto anula lo que la persona haya aprobado antes.
- Los `ATTLOG` repetidos se ignoran. Los de más de 2 minutos (enviados al volver la conexión) se guardan pero no deciden nada.
- Con la verificación manual activa, el G4 no decide: decide el vigilante.

**Panel (portal)**
- Motivo "DNI antes del facial" (antes "Sin rostro y alcohol").
- Se quitaron los enlaces de corrección manual del antipassback ("Registrar salida/ingreso manual"), por pedido de TMAM. La corrección sigue en el API, sin pantalla.
- Textos de "Facial primero" (aviso del Panel, confirmación y manual): 15 s desde que aparece "pase su DNI" (30 s desde el 21/10/2026).

**Garita (19/10)**
- El puerto USB 9 del Controlador (PC) reconocía el adaptador del lector, pero no le pasaba los datos. Se resolvió cambiando el adaptador de entrada a otro puerto.
- El lector a veces envía `71988749 JOSE VILCHEZ` (número y nombre), un formato que el sistema ignora. Falta confirmar qué documento lo produce.

## 4. Conclusión

- El `pin=0` no se debe al servidor ni al registro de las personas: es la variante ACC del firmware. Después de la prueba de alcohol, el equipo no conserva la identidad, ni en lo que envía ni en lo que guarda.
- **No se puede cambiar desde nuestro lado.** Se probó (17 y 18/10):
  - por PUSH: opciones de asistencia, hablar como el PushDemo, `SET OPTIONS DeviceType=att` y el servidor de TROK;
  - por el puerto 4370: `DeviceType=att` y `~DeviceType=att`, con reinicio.

  En todos los casos el G4 vuelve a `acc` al reiniciar. Se restauró todo como estaba.
- **Con ACC**, el orden "DNI primero" funciona bien: el sistema sabe quién es porque habilita a una persona a la vez. "Facial primero" funciona, pero sin confirmar quién sopló; el vigilante compara la foto.
- **Resuelto el 19/10/2026:** por indicación del soporte, el equipo se pasó a ATT desde su propio menú (*firmware type settings* → Attendance; borró sus usuarios, que se recargaron desde el portal). En ATT, cada prueba llega con el DNI y el grado, también el alcohol alto (sección 3 quater).
