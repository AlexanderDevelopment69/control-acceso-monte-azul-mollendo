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
| Mascarilla | `maskflag=255` | `maskflag=255` | `MaskFlag=0` |
| Temperatura | `temperature=0` | — | `Temperature=0` |
| Otros | `cardno=0`, `eventaddr=1` (puerta), `index` (correlativo) | `doorid=1`, `index` | `Workcode=0`, reservados en 0 |

Líneas reales:

```
ACC, tiempo real:  time=2026-10-17 18:59:59  pin=0  cardno=0  eventaddr=1  event=0  inoutstatus=0  verifytype=15  index=19  maskflag=255  Concentration=0
ACC, guardado:     index=19  cardno=  pin=  verified=15  doorid=1  eventtype=0  inoutstate=1  maskflag=255  Concentration=0.00g/L
ATT:               44943297  2026-09-28 13:03:31  255  15  0  0  0  0  0  0    0.00g/L  -  -  -
```

Formato oficial del ATTLOG (protocolo de asistencia de ZKTeco, 2026-04-22, sección 11.2): `Pin, Time, Status, Verify, Workcode, Reserved1, Reserved2, MaskFlag, Temperature, ConvTemperature, TimeOffset`. Este equipo agrega al final `Concentration` (alcohol), `SleepTime`, `HealthStatus` y `PlateNumber`.

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

**API adaptado (desplegado el 19/10, 14:40):**
- **La variante se detecta sola** (`push-sdk/protocolo-g4.ts`, ajuste `protocolo_g4` = `asistencia`/`acceso`): por el `DeviceType` del `options=all` y por la llegada de un `ATTLOG`. `/iclock/registry` y `/iclock/push` ya no dependen del ajuste.
- **Registro de personas** en el formato de la variante (`USERINFO`; foto con el mismo `biophoto`). En asistencia no se envían permisos de paso. La sincronización completa reenvía al personal activo (con fotos solo en la manual).
- **Ingreso** (`EventosAccesoService.registrarIngresoAsistencia` y `resultadoAsistencia`): el DNI y la prueba se juntan por persona, con varias a la vez. Aprueba si el grado es menor que el umbral (`G4PRO_UMBRAL_ALCOHOL`, por defecto 0.0001 g/L, el `AlcoholVolume` del equipo). **El orden lo manda el ajuste "Orden del ingreso"** (15:47), comparando la hora de la prueba (la del G4) con la del DNI, con 5 s de tolerancia:
  - **Normal**: vale solo la prueba hecha después del DNI (espera de 1 minuto). Una prueba aprobada sin DNI previo no vale.
  - **Facial primero**: vale solo la prueba hecha antes del DNI. La aprobación espera su DNI 20 s. Un DNI sin prueba suya se deniega en el momento ("Sin rostro y alcohol", sin cuenta regresiva; pedido de TMAM 19/10 16:50). Si sí sopló y la prueba llega después (10-15 s de demora), queda como aprobación y con volver a pasar el DNI entra.
  - Margen entre relojes: 0 s (medido: el G4 y el servidor difieren en 1-2 s).
  - En los dos órdenes, el alcohol alto queda denegado con su nombre.
- Los `ATTLOG` repetidos se ignoran, y los de más de 2 minutos se guardan sin decidir nada.

## 4. Conclusión

- El `pin=0` no se debe al servidor ni al registro de las personas: es la variante ACC del firmware. Después de la prueba de alcohol, el equipo no conserva la identidad, ni en lo que envía ni en lo que guarda.
- **No se puede cambiar desde nuestro lado.** Se probó (17 y 18/10):
  - por PUSH: opciones de asistencia, hablar como el PushDemo, `SET OPTIONS DeviceType=att` y el servidor de TROK;
  - por el puerto 4370: `DeviceType=att` y `~DeviceType=att`, con reinicio.

  En todos los casos el G4 vuelve a `acc` al reiniciar. Se restauró todo como estaba.
- **Con ACC**, el orden "DNI primero" funciona bien: el sistema sabe quién es porque habilita a una persona a la vez. "Facial primero" funciona, pero sin confirmar quién sopló; el vigilante compara la foto.
- **Paso siguiente:** pedir a ZKTeco o al distribuidor que pase el HSR3263100192 a la variante **ATT**, como el HSR3241200002. Hay que confirmar con ellos dos cosas:
  - si el cambio borra los usuarios (se vuelven a cargar desde el portal);
  - cómo informa ATT un alcohol alto.
