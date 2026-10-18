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
| **Alcohol alto** | `event=1`, **`pin=0`**, `Concentration=0` | Sin confirmar (el soporte solo mostró aprobados) |
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
| ¿Controla quién puede verificar? | Sí (permiso por persona: se habilita a una a la vez) | No (cualquier registrado); decide el servidor |
| ¿Sirve para "DNI primero"? | Sí (así funciona hoy) | Sí |
| ¿Sirve para "facial primero" con identidad? | No (no se sabe quién sopló) | Sí |

En el historial de Azure (16 al 18/10, 128 eventos): todo lo de antes de soplar llega con PIN (`event=23`: 35 de 35) y todo lo de después, sin PIN (`event=0`: 36 de 36; `event=1`: 6 de 6). Los 14 aprobados guardados en la memoria del G4 también tienen el PIN vacío.

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
