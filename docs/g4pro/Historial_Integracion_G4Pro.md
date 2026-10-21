# Historial de la integración del G4 Pro y los equipos de garita

Proyecto: Sistema de Control de Accesos · Terminal Monte Azul Mollendo (TMAM) · Alcance base

Este documento une los dos registros que se llevaron durante la integración de los equipos (27/09 al 05/10/2026):

- **[Parte A. Diseño y opciones](#parte-a-diseño-y-opciones)** — antes `Opciones_Integracion_G4Pro.md`: cómo se conectan los equipos, el proceso de ingreso y salida, qué se compró y configuró, y las pruebas con el equipo real.
- **[Parte B. Implementación y pruebas](#parte-b-implementación-y-pruebas)** — antes `Estado_Implementacion_Integracion_G4Pro.md`: qué se programó en `mollendo-api`, qué se probó con el G4 Pro real, los hallazgos y los pendientes de esa etapa.

> **Para lo vigente:** la referencia técnica del protocolo (rutas, comandos, respuestas y códigos confirmados) está en `Protocolo_G4Pro_Referencia.md`, en esta misma carpeta, y el proceso de ingreso y salida en `docs/diagramas/`. Desde el 07/10/2026 el servidor está en la nube y la mini PC de la garita trabaja como controlador (ver `docs/despliegue/Registro_Despliegue_MiniPC.md`, sección 8f); los cambios posteriores al 05/10 están en `PROGRESO.md`.
>
> Cada parte conserva su texto y su numeración original: una referencia a "la sección N" dentro de una parte se refiere a esa misma parte.

---

## Parte A. Diseño y opciones

Fecha original: 27/09/2026 (actualizado hasta el 04/10/2026).

> **Referencia técnica del protocolo** (rutas, comandos, respuestas y códigos confirmados): `Protocolo_G4Pro_Referencia.md` (en esta misma carpeta).
>
> **Actualización 04/oct/2026 — integración del G4 Pro resuelta y programada.** El G4 Pro usa el protocolo PUSH de **control de acceso** (no el de asistencia que se probó antes): con sus comandos (`user`, `extuser`, `biophoto`, `userauthorize`) **sí** se registran personas y rostros desde el portal y se habilita solo al dueño del DNI. El ingreso completo del diagrama (sección 2.1) quedó programado y probado con el equipo real. Ver sección 4 y la Parte B sección 0.

Este documento explica cómo se conectan los equipos físicos (lectores de DNI, terminal facial ZKTeco G4 Pro, alcoholímetro DT1700, molinetes y relé de red) con el sistema, cómo funcionan el ingreso y la salida paso a paso, qué se necesita comprar, configurar y programar, y qué pruebas hay que hacer con el equipo real.

---

### 1. Contexto

#### 1.1. Los equipos

| Equipo | Modelo | Función |
|---|---|---|
| Lectores de DNI (2) | Syble **XB-7705H** | Uno en el molinete de **ingreso** y otro en el de **salida**. Leen el código de barras del DNI y lo envían por USB a la mini PC. |
| Terminal facial | ZKTeco **G4 Pro** | En el ingreso. Reconoce el rostro, luego habilita la prueba de alcohol con el DT1700, y envía el resultado a la mini PC (ya no abre el molinete él mismo — ver actualización 02/oct/2026 abajo). Se alimenta con 12 V DC 3 A o por PoE (802.3af/at). |
| Alcoholímetro | ZKTeco **DT1700** | Prueba de aliento. Se conecta **por USB Type-A al G4 Pro** (no a la red). Da tres resultados: verde **Pass**, amarillo **Drink** y rojo **Fail**. |
| Molinetes (2) | ZKTeco **TS2000 Plus** | Uno de **ingreso** y otro de **salida**. Se abren al recibir un contacto seco (sin voltaje) en la bornera **J3** de su placa de control: **K1** o **K2** con **COM** ("Right Open" / "Left Open"). Tienen entrada de alarma contra incendios (**J2**), salida de 12 V (**J11**) y contadores de paso (**J17**/**J18**). |
| Relés de red (2) | Por comprar | Uno para cada molinete (ingreso y salida). La mini PC los activa por la red para abrirlos. |
| Mini PC | Ya existe | Junto a los molinetes. Tiene **todo el sistema**: backend, base de datos y portal web. |

#### 1.2. Decisiones tomadas

- **Todo es local, sin internet.** El sistema completo corre en la **mini PC** junto a los molinetes. En este documento, "servidor" es esa mini PC.
- **No se usa ZKBio CVSecurity**, sino el **SDK del proveedor**: el protocolo **PUSH / ADMS** de ZKTeco (documento oficial: *Attendance PUSH Communication Protocol 20260422*).
- **En el ingreso y en la salida, la persona primero se identifica con su DNI.**
- **Ingreso:** el DNI **habilita** a la persona (si está en regla), pero **el molinete solo se abre cuando el G4 Pro reconoce su rostro y la prueba de alcohol es conforme**. Lo abre la mini PC, con el relé de ingreso, una vez que recibe y confirma el resultado del G4 Pro (actualizado 02/oct/2026 — antes lo abría el G4 Pro directo con su propio relé, ver sección 5).
- **Salida:** solo DNI. Si no se identifica con un DNI registrado, **no se abre**. Una persona dada de baja **sí puede salir**. Lo abre la mini PC con el relé de salida.
- Los lectores de DNI los lee **el backend directamente** (modo USB-COM). No se usa el portal para leerlos, porque dependería de una ventana del navegador abierta y con el foco.

#### 1.3. Cómo se comunican

| Conexión | Medio | Para qué |
|---|---|---|
| Lector de DNI → mini PC | USB (puerto serie virtual) | Enviar el texto leído del DNI. Cada lector aparece como un puerto distinto (por ejemplo COM3 = ingreso, COM4 = salida). |
| G4 Pro ↔ mini PC | Red local, protocolo PUSH (HTTP) | La mini PC le envía las personas, sus fotos y quién está habilitado; el G4 Pro le envía cada ingreso. |
| DT1700 → G4 Pro | USB | Resultado de la prueba de alcohol. |
| Mini PC → relé de ingreso → molinete de ingreso | Red local + 2 cables: relé (NO + COM) → J3 K1 (o K2) + COM | Señal de apertura del molinete de ingreso (actualizado 02/oct/2026 — antes iba directo del G4 Pro). |
| Mini PC → relé de salida → molinete de salida | Red local + 2 cables: relé (NO + COM) → J3 K1 (o K2) + COM | Señal de apertura del molinete de salida. |

En el protocolo PUSH **es el G4 Pro el que se conecta a la mini PC**, en tres direcciones:

| Dirección | Para qué la usa el terminal |
|---|---|
| `/iclock/cdata` | Presentarse y enviar datos (registros de ingreso, fotos, etc.) |
| `/iclock/getrequest` | Preguntar cada pocos segundos: "¿tienes órdenes para mí?" |
| `/iclock/devicecmd` | Avisar el resultado de una orden que ejecutó |

En el G4 Pro el menú se llama *"Cloud service settings"*, pero ahí solo se escribe la **IP local de la mini PC** (por ejemplo `192.168.1.10`). No se usa ninguna nube.

---

### 2. Proceso completo (resumen)

**Antes de todo — registro (una sola vez, en el portal):** el administrador registra a la persona con su DNI, foto y documentos. El sistema la carga en el G4 Pro **deshabilitada**: el G4 Pro puede reconocer su rostro, pero no la deja pasar hasta que pase su DNI (sección 4).

#### 2.1. Ingreso

**Cómo leer los diagramas:** naranja = lo que hace la persona · azul continuo = datos por la red local · azul punteado = cable USB · verde grueso = señal eléctrica que abre el molinete. Los números siguen el orden de los pasos de la tabla.

![Diagrama del ingreso](../diagramas/ingreso.svg)

| # | Qué pasa | Dónde |
|---|---|---|
| 1 | La persona **pasa su DNI** (reverso) por el lector de ingreso. | Persona → lector |
| 2 | El lector envía el número de DNI a la mini PC. | Lector → mini PC (USB) |
| 3 | El sistema revisa que el DNI **esté registrado, no esté dado de baja, tenga al menos un documento y ninguno vencido**. Si falla algo, **se deniega aquí mismo** con el motivo en el Panel. | Mini PC |
| 4 | Si está conforme, el sistema **habilita a esa persona en el G4 Pro** por un tiempo corto (por ejemplo 60 s). | Mini PC → G4 Pro (red) |
| 5 | La persona se para frente al G4 Pro, que **reconoce su rostro**. | Persona → G4 Pro |
| 6 | **Recién entonces** el G4 Pro le permite **soplar en el alcoholímetro**. | Persona → DT1700 → G4 Pro (USB) |
| 7 | El G4 Pro envía el resultado (rostro reconocido + resultado del alcohol) a la mini PC. | G4 Pro → mini PC (red) |
| 8 | La mini PC comprueba que el rostro reconocido corresponda al mismo DNI que pasó por el lector, y que el alcohol haya salido conforme. **Solo si ambas cosas se cumplen**, activa el **relé de ingreso** y el molinete se abre para un paso. **Si no sopla, el resultado indica alcohol, o el rostro no corresponde al DNI, no se abre.** (Actualizado 02/oct/2026 — antes abría el G4 Pro directo con su propio relé.) | Mini PC → relé (red) → molinete (cable a J3) |
| 9 | La mini PC **vuelve a deshabilitar** a la persona. | Mini PC |
| 10 | El ingreso aparece en el **Panel de vigilancia**. | Mini PC → Panel |

**No se abre si:**
- solo pasa el DNI (falta el rostro y el alcohol);
- solo se para frente al G4 Pro sin pasar el DNI (no está habilitado);
- el DNI no está registrado, está de baja, le faltan documentos o tiene alguno vencido;
- el rostro no es el de la persona del DNI (solo está habilitada esa persona);
- no sopla, o el alcoholímetro indica alcohol;
- se acaba el tiempo de habilitación.

#### 2.2. Salida

![Diagrama de la salida](../diagramas/salida.svg)

| # | Qué pasa | Dónde |
|---|---|---|
| 1 | La persona **pasa su DNI** (reverso) por el lector de salida. | Persona → lector |
| 2 | El lector envía el número de DNI a la mini PC. | Lector → mini PC (USB) |
| 3 | El sistema revisa que el DNI **esté registrado** (incluye personas dadas de baja; no se exige ingreso previo) y guarda la salida. | Mini PC |
| 4 | La mini PC ordena al **relé de red** un pulso de 1 s. | Mini PC → relé (red) |
| 5 | El relé cierra su contacto y **el molinete de salida se abre** para un paso. | Relé → molinete (cable a J3) |
| 6 | La salida aparece en el **Panel de vigilancia**. | Mini PC → Panel |

Sin DNI o con un DNI no registrado **no se abre**. El Panel muestra "No registrado" para que el vigilante atienda el caso.

---

### 3. Esquema de conexión

```
                                         RED LOCAL (switch)
        ┌───────────────────────────────┬───────────────────────────────┬───────────────────────────────┐
        │                               │                               │                               │
┌───────┴────────┐              ┌───────┴────────┐              ┌───────┴────────┐              ┌───────┴────────┐
│    MINI PC     │              │ RELÉ DE SALIDA │              │ RELÉ DE INGRESO│              │     G4 PRO     │──── USB ──── DT1700
│ - Sistema      │              └───────┬────────┘              └───────┬────────┘              │  (en ingreso)  │             (alcohol)
│ - Base de datos│                      │ 2 cables                      │ 2 cables              └────────────────┘
│ - Portal web   │                      │                               │
└──┬──────────┬──┘              ┌───────┴─────┐                 ┌───────┴─────┐
   │ USB      │ USB              │  MOLINETE   │                 │  MOLINETE   │
┌──┴───────┐ ┌┴─────────┐        │  DE SALIDA  │                 │ DE INGRESO  │
│LECTOR DNI│ │LECTOR DNI│        │ bornera J3  │                 │ bornera J3  │
│ INGRESO  │ │ SALIDA   │        └─────────────┘                 └─────────────┘
└──────────┘ └──────────┘
```

*(Actualizado 02/oct/2026: ahora hay un relé de red por cada molinete; el G4 Pro ya no tiene cable de señal al molinete, solo manda el resultado por red a la mini PC, que es quien ordena abrir al relé de ingreso.)*

- El lector de DNI del ingreso **no está conectado al G4 Pro**, sino a la mini PC: el G4 Pro se entera de que la persona pasó su DNI porque la mini PC la habilita.
- En cada molinete, la señal de apertura entra por la bornera **J3**: **K1 + COM** o **K2 + COM**, según el sentido de paso ("Right Open" / "Left Open").
- Todo el cableado de señal va por el ducto de **baja tensión**, separado de la línea de 220 V (así lo pide la guía de instalación del molinete).

---

### 4. Personas en el G4 Pro: registro y habilitación

> **Confirmado con el equipo real (04/oct/2026) y programado.** Este G4 Pro (firmware ACC) habla el protocolo PUSH de **control de acceso**. Los comandos del protocolo de **asistencia** (`USERINFO`, con `StartDatetime`/`EndDatetime`), que se probaron entre el 30/set y el 02/oct, el equipo los rechaza (`-629`). Por eso entonces se concluyó, erróneamente, que el registro remoto y la habilitación temporal no eran posibles. El detalle de esas pruebas queda en la Parte B (secciones 2.3 a 2.8).

#### 4.1. Registro (al crear o cambiar a la persona en el portal)

El número de **DNI es el número de usuario** (`Pin`) en el equipo. Campos separados por tabulador:

```
DATA UPDATE user      CardNo=  Pin=45678912  Password=  Group=0  StartTime=0  EndTime=0  Name=Luis Quispe  Privilege=0
DATA UPDATE extuser   Pin=45678912  FunSwitch=0  FirstName=Luis  LastName=Quispe  PersonalVs=0
DATA UPDATE biophoto  PIN=45678912  Type=9  Size=<largo>  Content=<foto JPG ≤ 20 KB en base64>  Format=0  Url=  PostBackTmpFlag=0
```

- `user`: la persona. **Sin permiso de paso**: el equipo la reconoce pero la rechaza (`event=23`) hasta que se la habilita.
- `extuser`: el nombre y el apellido que **muestra la pantalla** del equipo (el campo `Name` de `user` no se ve).
- `biophoto`: la foto. El equipo la convierte en la **plantilla de rostro** (`biodata`, tipo 9) con la que reconoce. No hace falta registrar rostros a mano en el equipo.

| Qué pasa en el portal | Orden al G4 Pro |
|---|---|
| Se registra o edita una persona | `user` + `extuser` |
| Se sube o cambia la foto | `user` + `extuser` + `biophoto` |
| Se cambia el número de documento | `DATA DELETE user` (el anterior) + `user` + `extuser` + `biophoto` |
| Se da de baja o se reactiva | Ninguna: sin habilitación no pasa, y la baja la evalúa la mini PC al leer el DNI |
| Se renueva, agrega o elimina un documento | Ninguna: lo evalúa la mini PC cuando la persona pasa su DNI |
| Sincronización (equipo nuevo, y todos los días a medianoche) | `POST /integraciones/g4pro/sincronizar`: borra del equipo a quien el sistema no conoce, quita permisos sueltos y registra con foto al personal activo que falta |

Se registran todos los documentos: el G4 Pro acepta letras y números de hasta 24 caracteres (DNI, carné de extranjería y pasaporte; confirmado el 05/oct/2026).

#### 4.2. Habilitación (cada vez que la persona pasa su DNI)

```
Al pasar el DNI y estar en regla:      DATA UPDATE userauthorize Pin=45678912  AuthorizeTimezoneId=1  AuthorizeDoorId=1
Al recibir su resultado o al minuto:   DATA DELETE userauthorize Pin=45678912  AuthorizeDoorId=1
```

- Así **solo el dueño del DNI** puede pasar: a cualquier otra persona el equipo la rechaza (`rtlog event=23`, con su DNI).
- **Una persona a la vez.** En los ingresos exitosos (`event=0`) el equipo envía `pin=0`, es decir, no dice quién fue. Como solo hay una persona habilitada, solo puede ser ella. Si otra persona pasa su DNI mientras tanto, queda **en cola** y se la habilita cuando termina la anterior.
- **Tiempo:** 1 minuto desde que se la habilita. Si no completa rostro y alcohol, queda denegada con **"No completó rostro y alcohol"**.
- **Demora:** el equipo recoge las órdenes cada ~2 segundos (`RequestDelay=2`). En la prueba, el DNI se pasó a las 04:02:19 y el equipo aprobó el rostro a las 04:02:41.

---

### 5. Ingreso paso a paso

#### 5.1. Diagrama

Ver el diagrama de la sección 2.1.

Orden confirmado: **primero el rostro, luego el alcoholímetro**. Si la persona no sopla o el resultado indica alcohol, el G4 Pro no abre.

#### 5.2. Qué ve el Panel de vigilancia

| Caso | Quién lo detecta | Motivo en el Panel |
|---|---|---|
| DNI no registrado, de baja, sin documentos o con documento vencido | Mini PC al leer el DNI | El motivo exacto (p. ej. "SCTR vencido") |
| DNI en regla, esperando | Mini PC | Fila "en espera" con la foto, la cuenta regresiva de 1 minuto y la barra; "en cola" si otra persona está en su turno |
| Ingreso completo | G4 Pro (`event=0`) | Autorizado (y relé de ingreso) |
| No completó rostro y alcohol en el minuto | Mini PC | "No completó rostro y alcohol" |
| Rostro o alcohol no conforme | G4 Pro (si envía el intento rechazado; a confirmar) o la mini PC al acabarse el tiempo | "Alcohol no conforme" si llega el dato; si no, "No completó el ingreso en el terminal" |
| El rostro de otra persona | G4 Pro la rechaza (`event=23`, no está habilitada) | No cierra la espera; queda en el registro del sistema con su DNI |

#### 5.3. Alternativas si la habilitación temporal no funciona bien

> **Actualización (30/set/2026): la habilitación temporal YA SE PROBÓ con el equipo real y falló — ver pendiente #1 actualizado en la sección 9.** De las dos alternativas de abajo, la 1 también quedó descartada (ver recuadro).
>
> ~~**Corrección importante**: esto NO significa que haya que pasar a la Alternativa 2... El G4 Pro se queda abriendo el ingreso con su propio relé...~~ **Superado, ver la actualización de abajo.** En su momento se decidió no hacía falta la Alternativa 2 porque el vigilante presente cubría el riesgo que esta buscaba resolver — pero el cliente luego decidió igual ir con la Alternativa 2 (ver actualización 02/oct/2026), por una razón distinta a la original (no quedó registrado cuál).
>
> **Actualización (02/oct/2026): el cliente confirmó que sí va con la Alternativa 2.** El ingreso queda igual que el diseño de abajo: el G4 Pro ya no abre nada, solo manda el resultado; la mini PC comprueba rostro = DNI y alcohol conforme, y abre con el **relé de ingreso**. Con una diferencia: son **dos relés de red separados** (uno de 1 canal para cada molinete), no uno solo de 2 canales como decía originalmente la sección 5 (ya actualizada). Las secciones 1 a 3 de este documento ya reflejan este cambio. Queda pendiente el modelo exacto de cada relé y, cuando se tenga, actualizar el código de `molinete.abrir` para el ingreso (hoy asume que abre el G4 Pro solo, con su propio relé).

Si la prueba muestra que la espera para habilitar es demasiado larga, o que el G4 Pro no respeta la fecha de validez:

| | **Alternativa 1: verificación en el servidor — ❌ DESCARTADA (30/set/2026)** | **Alternativa 2: relé de red también para el ingreso** |
|---|---|---|
| Cómo funciona | Al reconocer el rostro, el G4 Pro **pregunta** a la mini PC "¿lo dejo pasar?" (*Background Verification*, `PostVerifyData`, sección 12.8.3 del protocolo). La mini PC responde según el DNI leído. El G4 Pro hace la prueba de alcohol y abre con su relé. | El G4 Pro no abre: reconoce el rostro, hace la prueba de alcohol y envía el resultado. La mini PC comprueba rostro = DNI y alcohol conforme, y abre con el **relé de ingreso**. |
| Quién abre | El G4 Pro (se mantiene la regla: rostro + alcohol) | La mini PC |
| Requisito | ~~Que la función esté disponible y se entienda su formato (poco documentada).~~ **Descartado**: se implementó el lado del servidor (responde `OK` correctamente al `POST /iclock/cdata?type=PostVerifyData`, confirmado con una llamada simulada), pero el equipo real nunca lo invoca. Se revisó el manual de usuario completo del G4 Pro (`G4PRO_MANUAL.txt`) y la lista oficial de opciones del menú *Access Control* (sección 5.1: Door lock delay, Gate mode, Door sensor delay/type, Verification mode, Door valid time zone, Normally open time zone, Master device, Auxiliary input, Alarm) — **esta función no existe en ningún menú de este equipo**. Es un recurso del protocolo pensado para relojes de asistencia simples (confirmado en el comentario de la librería de referencia: firmware ZAM180-NF), no para esta línea ACC. | Que **el resultado del alcohol llegue a la mini PC** (el protocolo no lo menciona, pero **ya se confirmó por otra vía**: ver Hallazgo de `table=rtlog` en `Analisis_Control_Acceso_Mollendo.md` sección 6.1 — el alcohol SÍ llega a la mini PC). Falta el relé de ingreso (hardware, por comprar — ver actualización 02/oct/2026 arriba). |

---

### 6. Salida paso a paso

Ver el diagrama de la sección 2.2.

- El molinete **solo se abre con un DNI registrado**. Sin DNI o con un DNI no registrado, no se abre.
- Una persona **dada de baja sí puede salir**: la baja solo bloquea el ingreso.
- ~~No hay antipassback en el alcance base~~. **Actualizado el 17/10/2026:** el cliente pidió antipassback estricto. Ya no se puede salir sin un ingreso registrado ni ingresar dos veces seguidas; el vigilante corrige los casos reales (por ejemplo, una emergencia con los brazos liberados) con una salida o un ingreso manual. Ver el documento funcional, RN-08a.

---

### 7. Si falla algo

| Situación | Ingreso | Salida |
|---|---|---|
| **Se cierra o se cuelga solo el programa** | El sistema se instala como **servicio que se reinicia automáticamente** en segundos. | Igual. |
| **La mini PC se apaga o se cuelga** | Nadie puede habilitarse con su DNI: **el molinete no se abre**. | **El molinete no se abre.** |
| **Se cae el G4 Pro** | No hay reconocimiento ni prueba de alcohol: **el molinete no se abre**. | No afecta. |
| **Falla el lector de DNI o el DNI no se lee** | La persona no puede habilitarse: **el molinete no se abre**. El vigilante puede buscarla en el Panel por su DNI. | Igual. |
| **Emergencia** (incendio, evacuación) | El molinete tiene una entrada de alarma contra incendios (**J2**, contacto sin voltaje): al activarse, **el brazo cae** y el paso queda libre. Es cableado y no depende del sistema. | Igual. |
| **Corte de energía** | El brazo del molinete **cae automáticamente**. Al volver la energía hay que esperar más de 6 s antes de levantar el brazo a mano (manual del molinete). | Igual. |

Recomendaciones:
- **UPS** (batería de respaldo) para la mini PC, el switch, el relé y el G4 Pro.
- **Respaldos automáticos de la base de datos** a otro lugar (disco externo o memoria USB): si la mini PC se daña, se pierde toda la información.

**No hay apertura manual.** Según la documentación del molinete, fuera del sistema el brazo solo cae si se **corta la energía del molinete** o si se activa su **entrada de alarma contra incendios (J2)**; en ambos casos el paso queda libre para todos. Por eso hay que **definir con el cliente cómo se atiende una falla** (mini PC, G4 Pro o lector caídos, o un DNI que no se lee): qué hace el vigilante y por dónde pasa la persona. Esto es lo más importante en la **salida**, para que nadie quede encerrado.

---

### 8. Qué se necesita

#### 8.1. Equipos a comprar

| Equipo | Cantidad | Características mínimas |
|---|---|---|
| **Módulo de relé de red** (Ethernet) | **2** (uno para la salida, otro para el ingreso — confirmado 02/oct/2026, dos cajitas separadas de 1 canal, no una de 2) | Puerto Ethernet RJ45 · control por **HTTP** (preferible) o Modbus TCP · relés con salida **NO y COM** (contacto seco) · al menos 1 A a 30 V DC · alimentación 12 V DC o PoE · IP fija configurable · de preferencia con **usuario y contraseña** |
| **UPS** | 1 | Para la mini PC, el switch, los relés y el G4 Pro |
| **Alimentación del G4 Pro** | 1 | Un puerto **PoE** (802.3af/at) en el switch, o un adaptador de **12 V DC 3 A** (confirmar si vino con el equipo) |
| Cable de red (Cat 5e o 6) | 2 | De cada relé al switch |
| Cable de señal (2 hilos) | 2 tramos | Relé de ingreso → molinete de ingreso, y relé de salida → molinete de salida |
| Puntos de red libres en el switch | 2 | Relé y G4 Pro |

La mini PC, los dos lectores de DNI, el G4 Pro, el DT1700 y los molinetes **ya están**.

#### 8.2. Configuración

| Dónde | Qué se configura |
|---|---|
| **Lectores de DNI (2)** | Modo **USB-COM** (puerto serie virtual) en lugar de USB-HID ("teclado"); la ficha técnica confirma que lo soporta. Se cambia escaneando un código de programación del **manual de configuración del fabricante, que no está en la carpeta de equipos: hay que pedírselo al proveedor**. Activar **PDF417** (y **Code 128** si algún DNI lo usa). Anotar qué puerto COM es el de ingreso y cuál el de salida. Se alimentan por el mismo USB (5 V, 210 mA). |
| **G4 Pro** | *System Settings > Cloud service settings*: IP de la mini PC y puerto del servidor PUSH (el manual indica 8088 por defecto). *Access Control*: **Gate mode = ON** (modo molinete: pulso de 0,8 s en lugar de "Door lock delay") y **Verification mode = Face**. *Access control record settings*: activar **User validity settings**. Hora sincronizada con la mini PC (*Sync cloud server*). Prueba de alcohol **obligatoria** para abrir. Relé "Lock" (NO + COM) conectado a J3 del molinete de ingreso. Desde la mini PC: `Realtime=1` (envío de registros al instante) y `Delay` bajo (2 s). |
| **Relé de red** | IP fija, cambiar la contraseña de fábrica y probar el canal desde el navegador. |
| **Molinetes** | Bornera **J3** de la placa de control: señal de apertura en **K1 + COM** o **K2 + COM**, según el sentido de paso. **J2**: señal de alarma contra incendios (contacto sin voltaje). Interruptores DIP: **KE-1 a KE-3** = tiempo que el molinete espera el paso después de abrir (5 s por defecto, hasta 60 s); **KE-6 (Memory Swipe) = OFF**, para que dos aperturas seguidas no acumulen pasos; **KE-8** = alarma por paso forzado (activar si se quiere). |
| **Mini PC** | El sistema como **servicio que arranca solo** y se reinicia si se cierra. Respaldos automáticos de la base de datos. Suspensión y actualizaciones automáticas de Windows desactivadas o programadas fuera de horario. |
| **Sistema** | Registrar cada molinete: tipo (ingreso o salida), puerto del lector; para la salida, IP del relé, canal y duración del pulso; para el ingreso, el número de serie del G4 Pro y el tiempo de habilitación. |

#### 8.3. Desarrollo en el sistema

| Parte | Qué hay que programar |
|---|---|
| **Protocolo PUSH** (nuevo) | Endpoints `/iclock/cdata`, `/iclock/getrequest`, `/iclock/devicecmd`, **más `/iclock/registry` (debe responder `RegistryCode=<algo>`, no `OK`) y `/iclock/push` (sesión con `SessionID`) — confirmado con el equipo real que sin esto nunca manda datos, ver pendiente 5**. Reemplazan el webhook provisional de ZKBio (`/integraciones/zkbio/webhook`). El alcohol llega por `table=rtlog` y el estado de puerta/relé por `table=rtstate` — ninguna de las dos está en el protocolo oficial documentado. |
| **Cola de órdenes al G4 Pro** (nuevo) | Registrar (deshabilitada), actualizar y eliminar personas y enviar fotos, cada vez que cambia algo en el portal (sección 4.1). Guardar si cada persona quedó sincronizada. |
| **Habilitación temporal** (nuevo) | Al leer un DNI en regla: habilitar a la persona en el G4 Pro por el tiempo configurado. Al recibir su ingreso o al acabarse el tiempo: deshabilitarla. Las habilitaciones deben tener prioridad en la cola. |
| **Conversión de la foto** (nuevo) | Llevar la foto al formato que exige el G4 Pro (JPG ≤ 20 KB, 358×441 a 1080×1920). |
| **Lectura de los lectores de DNI** (nuevo) | Leer los dos puertos serie, extraer el número de DNI y enviarlo al flujo de ingreso o de salida según el puerto. |
| **Flujo de ingreso** (cambia) | Paso 1 al leer el DNI: regla de documentos (ya existe en el motor de validación) y habilitación. Paso 2 al llegar el registro del G4 Pro: guardar el ingreso. Nuevo motivo: "No completó el ingreso en el terminal" (tiempo agotado). |
| **Controlador del relé** (nuevo) | Reemplaza la apertura simulada (`molinete.abrir`, hoy solo log) para la salida: envía el pulso por HTTP o Modbus según el modelo. |
| **Registro de salida** (ya existe) | La lógica actual se reutiliza; solo hay que indicar qué molinete abrir. |
| **Panel de vigilancia** (ya existe) | Mostrar los nuevos motivos y un aviso cuando el G4 Pro o el relé no respondan. |

---

### 9. Temas pendientes

1. **Demora de la habilitación — RESUELTO (04/oct/2026): funciona con `userauthorize` (sección 4.2), ~2 s de demora.** Lo que sigue es la prueba del 30/set con el protocolo de asistencia, que dio resultado negativo: **Demora de la habilitación — RESUELTO, con resultado NEGATIVO (30/set/2026):** se probó con el equipo real, mandando exactamente el comando que documenta el protocolo oficial (`DATA UPDATE USERINFO PIN=1 StartDatetime=... EndDatetime=... Expires=1`, con el PIN real de un usuario enrolado, "Amiel", ID 1). **El equipo lo rechazó explícitamente**, dos veces (al habilitar y al deshabilitar), con el código de error `return=-629`. No fue un problema de red ni de formato del comando. Se intentó también la causa más probable según el propio protocolo (que indica *"the main switch parameter UserValidTimeFun must be set to 1"*): se mandó `SET OPTION UserValidTimeFun=1` + `RELOAD OPTIONS` (comando oficial, sección 12.4.1), el equipo lo aceptó (`return=0`), y **se repitió la prueba — mismo rechazo (`return=-629`) otra vez**. Dos intentos independientes, mismo resultado: **la habilitación temporal, tal como está diseñada en la sección 4.2, no es viable con este equipo**.
   >
   > ~~**Esto NO cambia el diseño de apertura**: se decidió que el G4 Pro se queda abriendo el ingreso con su propio relé...~~ **Superado (02/oct/2026):** el cliente decidió la Alternativa 2 de la sección 5.3. El G4 Pro ya no abre el molinete: la mini PC lo abre con el relé de ingreso, tal como muestra el diagrama de la sección 2.1.
2. ~~**Fecha de validez por usuario:** confirmar que el G4 Pro respeta `StartDatetime` / `EndDatetime` al segundo (no solo por día).~~ — **Ya no aplica**: el punto 1 confirma que el comando se rechaza por completo, antes siquiera de poder medir la precisión de la validez.
3. **Alcohol — RESUELTO (04/oct/2026):** el rechazo por alcohol llega como **`rtlog event=1`** (el sistema deniega por alcohol y no abre). El valor medido no viaja (`Concentration=0` siempre): el G4 Pro decide con su **"Umbral de embriaguez"** (Configuración avanzada), que venía en 0.0025 g/L y dejaba pasar lecturas positivas; hay que fijarlo según la política del cliente. Historial: **Alcohol — RESUELTO EN PARTE (30/set/2026):** se conectó el equipo físico real (G4 Pro + DT1700, SN `HSR3263100192`) a un servidor PUSH de prueba y se confirmó que **el dato de alcohol sí llega por el protocolo ADMS**, en tiempo real, apenas se completa la prueba. No llega en `ATTLOG`/`OPERLOG` (las tablas que documenta el protocolo oficial) sino en una tabla propia del firmware, **no documentada en ningún manual**: `table=rtlog`, con el campo `Concentration`. Evento real capturado:
   ```
   time=2026-09-30 18:22:37  pin=0  event=0  verifytype=15  Concentration=0  ...
   ```
   `Concentration=0` fue un resultado **Pass** (verde). **Todavía falta**: provocar un resultado **Drink** y **Fail** para ver qué valor manda `Concentration` en esos casos (probablemente > 0, pero no confirmado), y si el nombre del evento o algún otro campo cambia cuando el equipo bloquea el paso.
4. **Intentos rechazados — parcialmente resuelto:** se descubrió que el evento de apertura física (sensor/relé/puerta) viaja en **una tabla aparte**, también no documentada: `table=rtstate` (campos `sensor=`, `relay=`, `door=`). En la prueba exitosa llegaron ambos: primero `rtlog` (la verificación) y, un segundo después, dos `rtstate` (relé se activa y luego se desactiva). La hipótesis a confirmar con una prueba real de rechazo: si el alcohol no es conforme o la persona no está habilitada, debería llegar el `rtlog` (o no llegar nada) **sin** el `rtstate` de apertura correspondiente — eso sería la forma de detectar un rechazo desde el backend. Falta la prueba real para confirmarlo.
5. **Hallazgo nuevo, no anticipado — requisito de "confianza" del equipo con el servidor:** se descubrió que el G4 Pro **no manda datos reales a ningún servidor que no responda exactamente de cierta forma**, algo que no aparece en ningún manual de ZKTeco:
   - `/iclock/registry` tiene que responder **`RegistryCode=<algo>`** (un código estable por equipo, no necesariamente uno específico) — si responde `OK` a secas (la respuesta "obvia" siguiendo el protocolo documentado), el equipo se queda conectado con normalidad (sigue hablando por `/iclock/getrequest`) pero **nunca manda `rtlog`/`rtstate` ni ningún dato real**, sin ningún error.
   - Además hace falta implementar un endpoint no documentado, **`/iclock/push`**, que responda con una sesión (`SessionID`, etc.).
   - **Esto es crítico para la sección 8.3** ("Protocolo PUSH (nuevo)"): si el desarrollo dentro de `mollendo-api` no implementa este comportamiento exacto, el síntoma en el sitio va a ser "el equipo se conecta pero nunca manda nada" — indistinguible de un problema de red, y muy difícil de diagnosticar sin saber que existe este requisito.
5. **Firmware del G4 Pro — RESUELTO (04/oct/2026):** es la variante de **control de acceso (ACC)** y responde a su protocolo (`DATA COUNT user`, `DATA QUERY`, respuestas por `/iclock/querydata`). Texto original: el protocolo revisado es el de **asistencia (ATT)**. El manual de la carpeta de equipos es de la variante de **control de acceso (ACC)**, que puede usar otro protocolo. Hay que confirmar qué firmware tiene y que se conecta al servidor PUSH.
6. **Texto que entrega el lector de DNI:** el código de barras del DNI peruano puede contener más datos que el número. Hay que leer varios DNI reales (azul y electrónico) para saber cómo extraer el número de 8 dígitos.
7. **Personas con CE o pasaporte:** su documento puede no tener un código de barras que el lector entienda. Hay que definir cómo se identifican.
8. **Formato de la foto:** el G4 Pro exige JPG de 20 KB como máximo, entre 358×441 y 1080×1920 píxeles, fondo blanco, rostro de frente y sin mascarilla. El formulario debería mostrar estas indicaciones.
9. **Relé:** modelo exacto que se compre (para programar su protocolo), duración del pulso (se empieza con 1 s) y sentido de paso de cada molinete (K1 o K2). Si se alimenta desde la salida de 12 V del molinete (J11), confirmar cuánta corriente entrega.
10. **Documentación no confiable:** 4 archivos de la carpeta de equipos fueron generados con ReportLab el 20/09/2026 y no son del fabricante: las dos guías (G4 Pro + DT1700 y Syble) y los dos planes de instalación (G4 Pro y TS2000 Plus). No deben usarse como referencia (por ejemplo, la guía del Syble dice que tiene contactos NO/NC/COM; su ficha técnica real indica que solo tiene USB o RS232). La "LockerPad G4 Pro Quick Start Guide" es de otro producto.
11. **Manual de configuración del lector Syble:** no está en la carpeta; sin él no se puede pasar a modo USB-COM ni activar PDF417. Pedirlo al proveedor.
12. **Controladora del molinete:** la ficha del TS2000 Plus indica que la controladora de acceso (C3-200 o InBio 260 Pro) es **opcional**. Revisar si los molinetes comprados la traen: si la traen, tiene red y relés propios y podría reemplazar al relé de red en la salida; si no, las señales van directo a J3 como está en este documento.
13. **Salida "Lock" del G4 Pro:** el manual no trae el diagrama de conexión en texto; confirmar en la etiqueta del equipo que es un contacto seco (NO / COM) y no una salida con voltaje.
14. **Cómo enrolar caras en el equipo — CONFIRMADO SIN SOLUCIÓN REMOTA (02/oct/2026):** `DATA UPDATE USERINFO` rechazado (seis pruebas, incluido el ejemplo exacto del manual del fabricante). `DATA UPDATE BIOPHOTO` solo (formato de 4 campos) responde `return=0`, pero **probado con una persona real (foto real, PIN real) el equipo no la reconoce y no aparece en "Administración de usuarios"** — tampoco cambia agregando `RELOAD OPTIONS` después. El `return=0` no significa que haya quedado un usuario funcional. Detalle en la Parte B sección 2.6. **El enrolamiento de caras, por ahora, solo se puede hacer físicamente desde la pantalla del equipo** — no hay forma remota confirmada. Falta: preguntarle al proveedor si existe otro mecanismo, con esta evidencia concreta.

---

### 10. Pruebas con el equipo real

Con el G4 Pro, el DT1700 y el **PushDemo** del proveedor (servidor PUSH de prueba, ya funcionando en Docker):

| # | Prueba | Cómo | Qué confirma |
|---|---|---|---|
| 1 | **Conexión** — ✅ **hecha (30/set/2026), y repetida en producción el 01/oct/2026** | En el G4 Pro, *Cloud service settings*: IP y puerto de la PC con el PushDemo. Verificar que el terminal aparece. | Confirmado: el equipo real (firmware `4.1.109-OCM-4101-3`) sí habla el protocolo PUSH, pero **solo si el servidor responde `RegistryCode=` en `/iclock/registry` y expone `/iclock/push`** (ver pendiente 5) — con una respuesta `OK` simple el equipo se conecta pero nunca manda datos reales. El 01/oct se repitió contra `mollendo-api` real (no el PushDemo), desplegado en AWS: el equipo se conectó solo y mandó un `rtlog`/`rtstate` real — ver la Parte B sección 2.2. |
| 2 | **Registro deshabilitado** | Registrar una persona con su foto y con una fecha de validez pasada. Comprobar que el G4 Pro la reconoce pero **no abre**. | Que la persona queda deshabilitada |
| 3 | **Habilitación temporal** — ✅ **hecha (30/set/2026), resultado NEGATIVO** | Enviar la orden de habilitar por 60 s y medir cuánto tarda el G4 Pro en aceptarla. Comprobar que abre dentro del tiempo y **no abre** después. | **Rechazada por el equipo** (`return=-629`) — ver pendiente 1 actualizado en la sección 9. Pasar directo a la prueba 9. |
| 4 | **Alcohol** — ✅ **hecha parcialmente (30/set/2026), solo resultado Pass** | Con la persona habilitada: rostro sin soplar, resultado **Drink** (amarillo), resultado **Fail** (rojo) y resultado **Pass** (verde). Revisar cuándo abre y qué llega al PushDemo (`ATTLOG`, `OPERLOG`, fotos). | Confirmado con un resultado **Pass**: el dato llega por `table=rtlog` (no `ATTLOG`/`OPERLOG`), campo `Concentration=0`. **Falta**: repetir con Drink y Fail para ver esos valores (pendiente 3). |
| 5 | **Baja** | Enviar `DATA DELETE USERINFO` y comprobar que ya no la reconoce. | Que la baja funciona |
| 6 | **Foto** | Enviar fotos de distintos tamaños y formatos. | Qué acepta el terminal |
| 7 | **Lectores de DNI** | Leer varios DNI reales en la mini PC en modo USB-COM y revisar el texto recibido. | Pendiente 6 |
| 8 | **Relé** | Activar el canal desde su página web y ver si el molinete de salida se abre. | Cableado y duración del pulso |
| 9 | **Verificación en el servidor** — ✅ **hecha (30/set/2026), resultado NEGATIVO** | Buscar en el terminal cómo activarla y revisar si llega una consulta `PostVerifyData` antes de abrir, y qué respuesta espera. | Se implementó el lado del servidor (responde `OK` correctamente, confirmado con una llamada simulada), pero **la función no existe en el menú de este equipo** — se revisó el manual de usuario completo y la lista oficial del menú *Access Control*, sin rastro de ella. **Alternativa 1 descartada.** Se adoptó la Alternativa 2 (02/oct/2026): el G4 Pro ya no abre; la mini PC abre con el relé de ingreso — ver sección 5.3. |

Con el sistema ya integrado:

| # | Prueba | Resultado esperado |
|---|---|---|
| 10 | Ingreso completo: DNI en regla + rostro + alcohol conforme | Abre el ingreso y aparece en el Panel |
| 11 | Solo pasar el DNI, sin ir al G4 Pro | No abre; al acabarse el tiempo, el Panel lo muestra |
| 12 | Solo pararse frente al G4 Pro, sin pasar el DNI | No abre |
| 13 | DNI con un documento vencido | Deniega al leer el DNI, con el motivo; el G4 Pro no abre |
| 14 | DNI de una persona y rostro de otra | No abre |
| 15 | DNI en regla + rostro + alcohol no conforme | No abre |
| 16 | Salida con DNI registrado (incluida una persona de baja) | Abre la salida |
| 17 | Salida con DNI no registrado o sin DNI | No abre; el Panel muestra "No registrado" |
| 18 | Cerrar el programa del sistema a propósito | Se reinicia solo en segundos |
| 19 | Apagar la mini PC | Los molinetes no se abren; aplicar el procedimiento de falla que se defina con el cliente (sección 7) |
| 20 | Activar la señal de emergencia del molinete | El brazo cae |

---

### 11. Resumen de la propuesta

1. **Identificación con DNI en los dos molinetes**, leída por el backend en la mini PC.
2. **Ingreso:** DNI en regla → la mini PC habilita a la persona en el G4 Pro → el G4 Pro reconoce el rostro y toma la prueba de alcohol → **la mini PC abre con el relé de ingreso solo si el rostro es el del DNI y el alcohol es conforme**.
3. **Salida:** DNI registrado → la mini PC abre con el relé de salida.
4. **El G4 Pro no abre ningún molinete**: los dos se abren desde la mini PC, cada uno con su propio relé de red de 1 canal.
5. **Respaldo ante fallas:** UPS, reinicio automático del sistema y respaldos de la base de datos. No hay apertura manual: el procedimiento ante una falla se define con el cliente (sección 7).

**Estado (04/oct/2026):** los puntos 1 a 4 están programados y probados con los equipos reales en la mini PC. Los molinetes se abren con **módulos de relés USB** (uno por molinete) en lugar de relés de red; se recomienda pasar a relés industriales de red para la operación continua (`docs/despliegue/Registro_Despliegue_MiniPC.md`, 8d). **Falta:** cablear los relés a las borneras J3 de los molinetes y que el cliente defina el umbral de alcohol del G4 Pro (el rechazo por alcohol ya está confirmado: `event=1`).

---

### 12. Revisión de la documentación de los equipos

Revisión de los documentos reales de la carpeta `docs/equipos/` contra este documento:

| Equipo | Documento real | Qué confirma | Qué falta o no coincide |
|---|---|---|---|
| **G4 Pro** | Ficha técnica 2024 · Manual de usuario ACC v1.2 (2022) | Salida de relé "Lock", entrada de botón de salida, Wiegand, RS485, USB host · alimentación 12 V 3 A o PoE · *Cloud service settings* (servidor ADMS/PUSH) · **Gate mode** para molinetes · validez por usuario · soporta **PUSH SDK** | El manual es de 2022 y **no menciona el alcoholímetro**. Dice que la validez por usuario es **por días**, lo que pone en duda la habilitación de 60 s (sección 4.2). Es firmware **ACC**; el protocolo revisado es el de **ATT**. |
| **DT1700** | Ficha técnica 2026 | Conexión **USB Type-A** al G4 Pro · resultados Pass / Drink / Fail · batería propia de 24 h | No hay manual de integración real con el G4 Pro. |
| **Lector Syble XB-7705H** | Ficha técnica · página del producto | Interfaces **USB-HID, USB-COM y RS232** · lee **PDF417** y Code 128 · 5 V por USB · **no tiene relé ni salida de red** | Falta el **manual de configuración** (códigos para cambiar a USB-COM). |
| **Molinete TS2000 Plus** | Manual de usuario · Guía de instalación 2024 · Ficha técnica | Apertura por contacto seco en **J3 (K1/K2 + COM)** · incendio en **J2** · 12 V de salida en **J11** · contadores **J17/J18** · el brazo cae sin energía o con señal de incendio · DIP KE-1 a KE-8 · separar cables de fuerza y de señal | La controladora de acceso es **opcional**: confirmar si vino. |
| **Protocolo PUSH** | *Attendance PUSH Communication Protocol* 2026 | `USERINFO` con `StartDatetime`/`EndDatetime` y `Expires` · `BIOPHOTO` · `Delay` 2–60 s · `Realtime` · `AC_UNLOCK` | No documenta el dato del alcohol. |

**Documentos que no se deben usar** (generados con ReportLab el 20/09/2026, no son del fabricante): *Guia_Integracion_G4Pro_DT1700*, *Guia_de_Instalacion_y_Configuracion_Syble_XB-7705H*, *Plan_de_Instalacion_ZKTeco_G4_Pro* y *Plan_de_Instalacion_TS2000_Plus*. La *LockerPad G4 Pro Quick Start Guide* es de otro producto (casilleros).

**Dato adicional:** el G4 Pro trae un lector de códigos propio (QR y PDF417), pero según su ficha solo se puede usar para leer el DNI con una aplicación Android a medida (LCDP), no con el firmware PUSH. Por eso se mantiene el lector Syble en el ingreso.

---

## Parte B. Implementación y pruebas

Esta parte registra el avance real de código (no solo el análisis técnico) de la integración del equipo ZKTeco G4 Pro dentro del backend `mollendo-api`. Complementa a `Analisis_Control_Acceso_Mollendo.md` (evidencia técnica del protocolo, con el equipo físico) y la Parte A de este documento (diseño completo del sistema) — este documento es el "qué hay programado hasta ahora y qué falta" dentro del repositorio real.

Última actualización: 04/oct/2026.

> **04/oct/2026 — SUPERA LAS CONCLUSIONES DEL 02/OCT: el registro remoto de personas, de rostros y la habilitación por DNI SÍ funcionan**, con el protocolo PUSH de **control de acceso** (tablas `user`, `extuser`, `biophoto`, `userauthorize`). Las pruebas del 30/set al 02/oct usaban el protocolo de **asistencia** (`USERINFO`), que este firmware (ACC) rechaza con `-629`; por eso se concluyó que no era posible. Ver **sección 0** para el estado actual y `Protocolo_G4Pro_Referencia.md` para la referencia técnica completa del protocolo. Las secciones 1.3, 2.3 a 2.8 y 3 quedan como historial.

> **01/oct/2026 — Confirmado con el equipo físico real, en producción (AWS):** ver sección 2.2. Ya no es solo una prueba simulada contra la instancia local; el equipo real mandó un `rtlog`/`rtstate` de verdad al código de `mollendo-api` desplegado.
>
> **02/oct/2026 — CONCLUSIÓN FINAL (corrige una celebración prematura del 01/oct): el registro remoto de personas NO funciona con este equipo, ni por `USERINFO` ni por `BIOPHOTO`.** El 01/oct se había concluido que `DATA UPDATE BIOPHOTO` solo (con el formato simple de 4 campos) resolvía el problema, porque el equipo respondía `return=0`. **Esa conclusión era incorrecta**: se probó con una persona real (Amiel, con su foto real, PIN=4) y, frente al equipo físico, **no lo reconoce, y tampoco aparece en "Administración de usuarios"** — ni con el `BIOPHOTO` solo, ni agregando `RELOAD OPTIONS` después. El `return=0` solo confirma que el equipo recibió los bytes, no que haya quedado un usuario real y reconocible. Ver sección 2.6 para el detalle completo y la lección de por qué se llegó a la conclusión incorrecta.

> **Nota sobre dos "bugs" que resultaron ser falsas alarmas** (encontradas al probar esta integración, pero no eran reales): (1) el servidor "no arrancaba" — era por probarlo con `tsx src/main.ts` en vez del comando real del proyecto, `npm run start`; con el comando correcto arranca sin problema. (2) una hora "corrida 5 horas" en una verificación por SQL crudo — era solo cómo `psql` muestra una columna `TIMESTAMP` sin zona horaria; leído por la aplicación (vía Prisma) la hora es la correcta. Ninguno de los dos requirió ningún cambio de código. Se dejan documentados acá para no repetir la confusión.

### 0. Estado actual (04/oct/2026): ingreso completo según el diagrama, probado con el equipo real

#### 0.1. Hallazgo

El G4 Pro (`HSR3263100192`, firmware `4.1.109-OCM-4101-3`, variante ACC) responde al protocolo PUSH de **control de acceso**:

| Prueba (04/oct, mini PC, persona de prueba Amiel, DNI 48058719) | Resultado |
|---|---|
| `DATA COUNT user` / `userauthorize` / `biophoto` | Aceptados; responde por `POST /iclock/querydata?type=count&tablename=…` (`user=0` al inicio) |
| `DATA UPDATE user Pin=48058719 … Name=…` | `return=0`; aparece en "Administración de usuarios" |
| Nombre en pantalla | Sale de `extuser` (`FirstName`/`LastName`), no de `user.Name` |
| Rostro registrado a mano, sin permiso | `rtlog event=23` **con `pin=48058719`** |
| `DATA UPDATE userauthorize Pin=… AuthorizeTimezoneId=1 AuthorizeDoorId=1` | `event=0` (permitido; el G4 Pro activa su propio relé, `rtstate relay=01`), **con `pin=0`** |
| `DATA DELETE userauthorize Pin=… AuthorizeDoorId=1` | Otra vez `event=23` con el DNI |
| Usuario borrado (con su rostro manual) y recreado solo con `biophoto` | El equipo generó la plantilla (`DATA QUERY tablename=biodata` → `type=9 valid=1`) y lo reconoció (`event=23` con el DNI). Los `DATA COUNT biodata/biophoto` devuelven 0 aunque el registro existe (inconsistencia del firmware) |

Capturas de tráfico hechas con un contenedor temporal (`nicolaka/netshoot`, tcpdump), luego borrado.

#### 0.2. Qué se programó

- **`push-sdk/comandos-acceso.util.ts`** (con tests): comandos `user`, `extuser`, `biophoto`, `DATA DELETE user`, `userauthorize` (habilitar/deshabilitar); Pin = DNI (solo documentos numéricos).
- **`PushSdkService.sincronizarPersona`**: reemplaza la versión de asistencia. Al crear/editar una persona (`persona.guardada`) envía `user` + `extuser`; al subir la foto (`persona.foto-actualizada`), además `biophoto`; si cambia el número de documento, borra el usuario anterior. `POST /integraciones/g4pro/sincronizar` (Administrador) registra a todo el personal.
- **`POST /iclock/querydata`**: recibe las respuestas a `DATA COUNT/QUERY` (se anotan en el registro). **`POST /iclock/devicecmd`** ahora registra todas las confirmaciones de un mismo mensaje (antes solo la primera).
- **Habilitación por DNI, una persona a la vez** (`EventosAccesoService`, migración `20261004120000_habilitacion_g4pro`, columna `ingreso_pendiente.habilitado_en`): DNI en regla → si nadie está habilitado se emite `g4pro.habilitar` (la integración envía `userauthorize`) y corre 1 minuto; si no, queda en cola (máx. 3 min). Al cerrar la espera se deshabilita y se habilita al siguiente.
- **Resultado (`rtlog`)**: `event=0` → ingreso autorizado (solo puede ser la persona habilitada), `molinete.abrir` → relé de ingreso; `event=23/27` → no cierra la espera, se anota quién era; otro código → denegado por alcohol (sin confirmar con un rechazo real). Esperas vencidas (revisión cada 5 s) → denegado **"No completó rostro y alcohol"** (`evento_acceso.denegado_sin_verificacion`).
- **Panel**: fila "en espera" con foto y cuenta regresiva, "en cola" si otra persona está en su turno; motivo nuevo también en reportes y Dashboard.

#### 0.3. Prueba del flujo completo (04/oct/2026, mini PC)

- 04:02:19 DNI por el lector de ingreso → habilitado en el G4 Pro.
- 04:02:41 G4 Pro `event=0`, `Concentration=0` → ingreso autorizado (evento 113).
- 04:02:47 deshabilitado; 04:02:48 relé de ingreso `ING01`, pulso de 1 s.
- Con un documento vencido: el DNI se denegó al instante y el G4 Pro rechazó a la persona (`event=23`) porque no estaba habilitada.
- Vencimiento: DNI 04:08:20 → habilitado → sin ir al equipo, 04:09:21 → denegado "No completó rostro y alcohol", deshabilitado, sin relé.

#### 0.4. Alcohol (probado el 04/oct/2026)

- El G4 Pro pide soplar después del rostro y muestra el resultado ("Grado de alcohol 0.00 g/L, Sin problemas").
- **Bloquea según su "Umbral de embriaguez"** (Configuración avanzada → Configuración del proceso de prueba de alcohol), que venía en **0.0025 g/L** (2.5 mg/L): una lectura de 0.000413 g/L mostró "Supera el valor estándar. Por favor, contacte al administrador" pero **lo dejó pasar** (`event=0`) porque estaba bajo el umbral. Con el umbral bajado, la misma prueba (enjuague bucal con alcohol) se rechazó.
- **Código del rechazo por alcohol: `event=1`** (tres veces: 04:57:55, 05:04:57 y 05:15:36) → el sistema lo registró como **denegado por alcohol** y no activó el relé. Los soplidos limpios siguieron con `event=0` → autorizado y relé.
- El rtlog **no trae el valor medido**: `Concentration` llega en 0 siempre. El control depende del umbral configurado en el equipo.
- Otros códigos vistos: `event=27` con `verifytype=1` (huella) y `2` (tarjeta) de personas no registradas → rechazados, sin abrir.
- **Configuración obligatoria:** el umbral lo fija el cliente según su política (la guía del DT1700 recomienda 0.02 mg/L = 0.00002 g/L).

#### 0.5. Pendiente (al 05/oct/2026)

| # | Pendiente | De quién depende | Dónde está explicado |
|---|---|---|---|
| 1 | **Umbral de alcohol** del G4 Pro: hoy está bajado solo para la prueba; el valor definitivo lo fija el cliente (la guía del DT1700 recomienda 0.02 mg/L) | Cliente | Sección 0.4 · `docs/despliegue/Registro_Despliegue_MiniPC.md` 8e |
| 2 | **Cablear los relés** a los molinetes: contacto NO + COM de cada módulo → bornera J3 (K1 + COM) de su molinete, y probar que abra | Instalación | `docs/despliegue/Registro_Despliegue_MiniPC.md` 8d · `docs/diagramas/ingreso.svg` y `salida.svg` |
| 3 | **Nombre en el aviso del G4 Pro**: el mensaje "¡Verificación Exitosa!" muestra el nombre como "..." (el DNI sí aparece). El nombre está guardado (`extuser` FirstName/LastName) y la lista de usuarios lo muestra a veces sí y a veces no: parece de la pantalla del equipo, falta revisarlo | Desarrollo / proveedor | Sección 0.1 |
| 4 | **Datos de demostración** (la sincronización diaria está **desactivada** en la mini PC, `G4PRO_HORA_SINCRONIZACION=off`, hasta borrarlos; reactivarla después): borrar los DEMO de la mini PC (incluida la persona de prueba "Amiel Bautista", DNI 48058719, que está en una empresa DEMO) con `prisma/limpiar-demo.sh`, y borrar ese usuario del G4 Pro | Desarrollo | `docs/despliegue/Registro_Despliegue_MiniPC.md` 8b |
| 5 | **Cargar al personal real** en el portal (con foto de frente) y registrarlo en el G4 Pro con `POST /integraciones/g4pro/sincronizar` | Cliente / administrador | `docs/despliegue/Registro_Despliegue_MiniPC.md` 8e |
| 6 | **Servidor de AWS**: tiene una versión anterior (sin lectores, relés, habilitación ni motivo nuevo). Actualizar si se va a seguir usando | Desarrollo | `PROGRESO.md` |
| 7 | **Fotos de calidad**: el equipo necesita fotos de frente, con buena luz y el rostro centrado; si no reconoce a alguien (`event=27`), cambiar su foto | Administrador | Sección 0.2 |
| 7a | **Carné de extranjería y pasaporte en el lector**: el G4 Pro ya los acepta (letras, hasta 24 caracteres; el sistema los registra), pero el lector solo reconoce el DNI (8 dígitos). No se pudo probar por no tener un carné real (05/oct/2026); el sistema ya anota en su registro el contenido de cualquier lectura que no sea un DNI, para ver el formato el día que se pase uno (procedimiento en la guía 8c); los pasaportes normalmente no tienen código de barras (habría que definir otro medio, por ejemplo el vigilante) | Desarrollo / cliente | `docs/despliegue/Registro_Despliegue_MiniPC.md` 8c |
| 8a | **Usuarios registrados a mano en el equipo**: reciben permiso de paso permanente (un usuario manual dejó `userauthorize=50`) y rompen la regla de "una persona habilitada a la vez". Regla: no registrar a mano (guía 8e). El 05/oct se dejó el equipo limpio (2 usuarios, 2 nombres, 50 permisos, 1 rostro) y se volvió a registrar a Amiel desde el sistema. **Mitigado:** la sincronización (manual y diaria a medianoche) borra a los usuarios que el sistema no conoce y quita los permisos sueltos (probado en simulación con un usuario manual de prueba) | Operación | `docs/despliegue/Registro_Despliegue_MiniPC.md` 8e |
| 8 | **Varios G4 Pro**: hoy todos los comandos van a todos los equipos conocidos | Desarrollo (si se agrega otro equipo) | Sección 3.6 |
| 9 | **Relés industriales**: los módulos USB actuales sirven, pero para operación continua se recomiendan relés de red en riel DIN | Cliente | `docs/despliegue/Registro_Despliegue_MiniPC.md` 8d |

### 0b. Revisión del proyecto completo (30/set/2026)

Para evitar seguir generando falsas alarmas, se revisó el proyecto `Proyecto Mollendo` completo (no solo lo tocado en esta integración): arquitectura de despliegue (`docker-compose.prod.yml`, `docs/despliegue/Registro_Despliegue_MiniPC.md`), historial reciente (`PROGRESO.md`), y el portal (`mollendo-portal`). De ahí salieron dos correcciones reales, consecuencia directa de los cambios de esta integración:

- **`prisma/simular-garita.ts` (el simulador de garita, `npm run simular`) estaba roto**: mandaba `alcoholConforme` en el `POST /eventos-acceso/ingreso`, campo que ya no existe en `IngresoDto` — con `forbidNonWhitelisted: true` esa llamada iba a fallar con 400 siempre. Se reescribió para seguir el flujo real en dos fases: manda el DNI, y si queda "pendiente", simula también el `table=rtlog` del G4 Pro (como lo haría el equipo real) antes de poder reportar el resultado. Se encontró de paso una condición de carrera (la correlación corre async respecto al "OK" que responde `/iclock/cdata`, a propósito, para no acoplar módulos) y se agregó un reintento corto. **Probado de verdad** contra la instancia corriendo: los 4 casos (normal, alcohol, documentos, de baja) resuelven bien.
- **La página "Sistema y APIs" del portal** (`mollendo-portal/src/app/(admin)/sistema/page.tsx`) todavía mostraba el contrato viejo del endpoint de ingreso (con `alcoholConforme` en el ejemplo) y describía la integración del G4 Pro como "pendiente" con un ejemplo genérico de ATTLOG. Se actualizó con el contrato real (`estado: "pendiente_verificacion"`), el protocolo real (`RegistryCode`, `rtlog`), y notas aclarando qué está probado y qué no.

Verificado tras estos cambios: `tsc --noEmit` limpio y `eslint` limpio en el portal; `tsc --noEmit`, lint y los 31 tests limpios en la API; el simulador corriendo de verdad contra Postgres real.

---

### 1. Qué se implementó

#### 1.1. Módulo `push-sdk` (`mollendo-api/src/push-sdk/`)

El protocolo ADMS/PUSH real, basado en lo confirmado con el equipo físico `HSR3263100192` (ver `Analisis_Control_Acceso_Mollendo.md` sección 6.1):

| Endpoint | Qué hace |
|---|---|
| `POST /iclock/registry` | Responde `RegistryCode=<código>`, estable por equipo (nunca `OK`) — sin esto el equipo nunca manda datos reales. |
| `POST /iclock/push` | Handshake de sesión (`SessionID`, etc.), descubierto por tráfico real, no documentado por el fabricante. |
| `GET /iclock/getrequest` | Entrega los comandos pendientes en cola para ese equipo. |
| `POST /iclock/devicecmd` | Recibe la confirmación de un comando ejecutado (`ID`, `Return`, `CMD`). |
| `GET/POST /iclock/cdata` | Recibe `table=rtlog` (resultado facial + alcoholímetro) y `table=rtstate` (sensor/relé/puerta) — las dos tablas no documentadas por ZKTeco. También soporta `type=PostVerifyData` (Background Verification) por si algún otro equipo de la familia sí la usa — este G4 Pro específico no la soporta, confirmado. |

Estas rutas están excluidas del prefijo global `/api/v1` en `main.ts`, porque el equipo las llama fijas, sin poder configurar ningún prefijo. Los cuerpos POST de `/iclock/*` se leen siempre como texto plano (el equipo casi nunca manda un `Content-Type` reconocible).

#### 1.2. Tablas nuevas en Postgres

Migraciones `20260930200000_push_sdk_dispositivos` y `20260930203000_ingreso_pendiente`, ya aplicadas contra la base de datos local (`mollendo-postgres`, Docker vía WSL):

- **`dispositivo_acceso`**: un equipo por fila, con su `registry_code` persistente.
- **`comando_dispositivo`**: cola de comandos salientes (`DATA UPDATE USERINFO`, `DATA UPDATE BIOPHOTO`, etc.), con estado `pendiente` → `entregado` → `confirmado`.
- **`verificacion_dispositivo`**: cada evento crudo de `rtlog`/`rtstate` que manda el equipo, con un `evento_acceso_id` opcional para cuando se logra correlacionar.
- **`ingreso_pendiente`**: el puente entre el DNI escaneado y el resultado del G4 Pro (ver sección 1.4).

#### 1.3. Sincronización real de personas al equipo

Proceso completo, de principio a fin:

1. **Registro**: el administrador crea a la persona en el portal y sube su foto. Nada toca al equipo todavía.
2. **Encolar las órdenes**: subir la foto dispara el evento `persona.foto-actualizada` (`PersonasService.guardarFoto`), que `IntegracionesService.registrarRostro` escucha y pasa a `PushSdkService.sincronizarPersona`. Esta encola **dos comandos** en `comando_dispositivo` (estado `pendiente`):
   ```
   DATA UPDATE USERINFO PIN=<id de la persona>   Name=<nombre completo>
   DATA UPDATE BIOPHOTO PIN=<id de la persona>   Content=<foto en base64, ya convertida>
   ```
   El **PIN que usa el equipo es el ID de la persona en la base de datos**, no su DNI. La foto se convierte automáticamente a JPG ≤ 20 KB con `sharp` (instalado para esto), porque el G4 Pro exige ese límite y las fotos que suben los administradores normalmente pesan más.
3. **El equipo las recoge solo**: mientras está prendido y conectado, el G4 Pro llama a `/iclock/getrequest` cada ~2 segundos preguntando si hay órdenes. La próxima vez que pregunte, recibe las dos de arriba (se marcan `entregado`) y las ejecuta por su cuenta: graba esa cara en su propia memoria, con ese PIN.
4. **Confirmación**: el equipo avisa el resultado de cada orden por `/iclock/devicecmd` (`ID`, `Return`, `CMD`) — el servidor marca el comando como `confirmado` con el código que haya devuelto el equipo.
5. **Reconocimiento normal, de ahí en adelante**: cualquiera que se pare frente al equipo se compara contra **todas** las caras que conoce (1:N), incluida la nueva. Si reconoce, toma la prueba de alcohol y manda el `rtlog`. Ya no abre el molinete: desde el 02/oct/2026 lo abre la mini PC con el relé de ingreso.

**El hueco conocido en el paso 5**: el campo `pin` que manda el equipo en el `rtlog` no identifica confiablemente a quién reconoció (llega en `0` siempre, confirmado con el equipo real) — por eso hace falta correlacionarlo con el DNI (pendiente 3.2), no se puede saber "quién fue" solo con este mensaje.

**No se manda** `StartDatetime`/`EndDatetime`/`Expires=1` (la idea original de "registrarla deshabilitada hasta que pase su DNI"): se confirmó con el equipo real que esos campos se rechazan (`return=-629`), incluso con el interruptor `UserValidTimeFun=1` activado. El control de que nadie se salte el DNI queda a cargo del vigilante (ver `Analisis_Control_Acceso_Mollendo.md` sección 6.0).

> **01/oct/2026 — Probado y RECHAZADO** (ver sección 2.3): los pasos 1-3 de este proceso sí se probaron con el equipo físico real, y el paso 3 falla — el equipo rechaza `DATA UPDATE USERINFO` (`return=-629`), con o sin fechas de validez. El registro automático de personas, tal como está descrito arriba, **no funciona con este equipo**. La prueba de la sección 2.2 fue solo del paso 5 (el equipo ya traía sus propias caras enroladas de antes, manualmente).

#### 1.4. Flujo de ingreso en dos fases

El `POST /eventos-acceso/ingreso` ya no recibe `alcoholConforme` en la misma llamada (se quitó del DTO). Ahora:

1. **Fase 1 — DNI**: valida que la persona exista, no esté dada de baja y tenga documentos vigentes. Si falla algo, se deniega ahí mismo (igual que antes). Si todo está en regla, se crea un `IngresoPendiente` y la respuesta es `estado: 'pendiente_verificacion'` — todavía no hay un `EventoAcceso`.
2. **Fase 2 — resultado del G4 Pro**: cuando llega un `rtlog` real (vía `push-sdk`), se emite el evento `dispositivo.rtlog`, que `EventosAccesoService.correlacionarVerificacionDispositivo` escucha. Busca el `IngresoPendiente` más antiguo sin consumir dentro de una ventana de tiempo (FIFO, por si hay varias personas en fila) y recién ahí crea el `EventoAcceso` definitivo (autorizado o denegado por alcohol), y marca la `VerificacionDispositivo` como correlacionada.

**Apertura (actualizado 02/oct/2026):** el G4 Pro **ya no abre el ingreso**. Según el diseño vigente (`docs/diagramas/ingreso.svg`), la mini PC comprueba que el rostro sea el del DNI y que el alcohol sea conforme, y abre con el **relé de ingreso**. Falta en el código la orden al relé de ingreso (`molinete.abrir`), pendiente del modelo del relé.

---

### 2. Qué está verificado y qué no

| | Estado |
|---|---|
| Compila (`tsc --noEmit`) | ✅ Sin errores |
| Tests existentes (31) | ✅ Todos pasan, sin romper nada |
| Migraciones aplicadas contra Postgres real | ✅ (`mollendo-postgres` en Docker/WSL, puerto 5433) |
| Arranque completo del servidor (`npm run start`) | ✅ Arranca bien, mapea todas las rutas (incluidas `/iclock/*`) y conecta a PostgreSQL |
| `/iclock/registry` probado contra la instancia real corriendo | ✅ Responde `RegistryCode=`, estable entre llamadas |
| Flujo completo de ingreso probado con curl (DNI → pendiente → rtlog → correlación) | ✅ Confirmado contra una persona real de la base de datos (ver sección 2.1) |
| Desplegado en AWS (producción real, no local) | ✅ `docker-compose.prod.yml`, los 4 contenedores (ver sección 2.2) |
| Probado contra el equipo G4 Pro real | ✅ **Confirmado 01/oct/2026** — el equipo físico (`HSR3263100192`, IP real `38.25.53.235`) se conectó solo al servidor en AWS y mandó un `rtlog`+`rtstate` real (ver sección 2.2) |
| Tarjeta "Equipos" del portal, en vivo contra el equipo real | ✅ Mostró "1 de 1 en línea" correctamente, sin refrescar la página |
| `sincronizarPersona` (registro de la foto) probado contra el equipo real | ✅ **Confirmado 01/oct/2026**, con el código de producción real desplegado en AWS — `return=0`. El nombre (`USERINFO`) sigue sin funcionar y ya no se manda. Ver sección 2.5 (y 2.3 para el historial de cómo se llegó ahí). |

#### 2.1. Prueba end-to-end con curl (simulando DNI + equipo)

Con la instancia ya corriendo (`npm run start`), se simuló el flujo completo contra una persona real de la base de datos (id 20, documentos vigentes):

1. `POST /api/v1/eventos-acceso/ingreso` (DNI) → `{"estado":"pendiente_verificacion", ...}`, se crea un `IngresoPendiente`.
2. `POST /iclock/registry` + `POST /iclock/push` (el equipo se da de alta).
3. `POST /iclock/cdata?table=rtlog` con un evento real (`event=0`, `Concentration=0`) → el servidor correlaciona automáticamente con el `IngresoPendiente` más antiguo.
4. Resultado: `EventoAcceso` creado con `resultado=autorizado`, `IngresoPendiente` marcado como consumido, y `VerificacionDispositivo` enlazada al evento.

Se verificó además, leyendo con Prisma (no con SQL crudo), que la hora del evento queda guardada y se recupera correctamente en hora de Perú — una columna `TIMESTAMP` sin zona horaria se ve "corrida" si se consulta directo por `psql`, pero la aplicación la interpreta bien siempre.

#### 2.2. Desplegado en AWS y probado con el equipo físico real (01/oct/2026)

Se desplegó el sistema completo (no solo `mollendo-api`) en la instancia EC2 que se venía usando para las pruebas de `pushdemo` (`54.147.214.38`), usando `docker-compose.prod.yml` tal como está pensado para la mini PC:

1. **Se liberó espacio**: el disco estaba casi lleno (1.3 GB libres de 6.7 GB) por los contenedores/imágenes de `pushdemo`, que ya habían cumplido su función (el protocolo que reverse-engineerearon ahí ya está implementado en `push-sdk/`). Se borraron (`docker compose down -v` + `docker system prune -af --volumes`), quedando 3.3 GB libres.
2. **Se armó el `.env` de producción** con secretos generados al azar (`DB_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DEVICE_API_KEY`, contraseñas iniciales) y `CORS_ORIGIN` apuntando al portal en esa IP.
3. **Se subió el proyecto** (sin `node_modules`/`.next`/`dist`, ~658 KB comprimido) y se levantó: `docker compose -f docker-compose.prod.yml up -d --build db api portal backup`. Los 4 contenedores arrancaron bien al primer intento.
4. **Se corrió el seed inicial** (`docker compose run --rm -T api npm run db:seed`) — paso manual que ya estaba documentado en `docs/despliegue/Registro_Despliegue_MiniPC.md` para el primer despliegue, no se había hecho antes.
5. **Se abrieron los puertos 3000 y 3001** en el Security Group de EC2 (no estaban — solo 80/443/3306/8091, los de `pushdemo`). El usuario los agregó desde la consola de AWS.
6. **Se cambió la configuración del equipo físico** (*Cloud Service Settings*): servidor `54.147.214.38`, puerto `3001`, y se reinició.

**Resultado, confirmado paso a paso:**
- El equipo se registró solo, con su **IP pública real** (`38.25.53.235`) — se pudo distinguir de una prueba propia anterior (que había quedado con la IP interna de Docker, `172.18.0.1`) revisando la columna `ip_address` de `dispositivo_acceso`.
- La tarjeta "Equipos (G4 Pro)" de *Sistema y APIs* pasó a **"1 de 1 en línea"** sola, sin recargar la página (el portal ya hace polling cada 15 s).
- Al pedir una prueba real (facial + alcoholímetro) en el equipo, llegaron a `verificacion_dispositivo` exactamente los dos eventos esperados:
  ```
  rtlog:   event=0 (éxito)  verifytype=15 (facial+alcohol)  Concentration=0 (sin alcohol)
  rtstate: relay=01 (puerta abre) → relay=00 (puerta cierra)
  ```
- `evento_acceso_id` quedó vacío en ambos — **esperado**, no es un error: no hay ningún `IngresoPendiente` con qué correlacionar porque la integración del lector de DNI (pendiente 3.2) todavía no existe. Es la primera demostración real, con el equipo físico, de exactamente esa limitación.

**Conclusión**: el código de `mollendo-api` (no un servidor de prueba aparte) ya recibe datos reales del equipo físico en un entorno de producción real (AWS, mismo `docker-compose.prod.yml` que se usará en la mini PC). Lo único que falta para que esto genere un `EventoAcceso` de verdad es la integración del lector de DNI.

**Lo que NO se probó en esta sesión**: `sincronizarPersona` (mandar `DATA UPDATE USERINFO`/`BIOPHOTO` al equipo real) — no se dio de alta a ninguna persona nueva durante esta prueba. (Sí se probó poco después — ver 2.3, con resultado negativo.)

#### 2.3. `sincronizarPersona` probado contra el equipo real — RECHAZADO (01/oct/2026)

Se creó una persona de prueba directo en la API de producción (`POST /api/v1/personas`) y se le subió una foto (`POST /api/v1/personas/:id/foto`), disparando el flujo real descrito en la sección 1.3.

**Resultado:**
- `DATA UPDATE USERINFO PIN=1 Name=Carlos Prueba Real G4Pro Pri=0` → el equipo lo recogió (confirmado por `/iclock/getrequest`) y lo **rechazó**: `return=-629`.
- `DATA UPDATE BIOPHOTO PIN=1 ...` → quedó en estado `entregado` **sin ninguna confirmación**, más de 15 segundos después, con el equipo activo y conectado todo ese tiempo. Lo más probable es que el equipo simplemente ignore la foto de un usuario que no llegó a crear, sin avisar — pero no hay forma de confirmarlo sin más pruebas.

**Esto es un hallazgo distinto al de la sección 1.3 original**: antes se pensaba que el problema eran específicamente los campos de validez temporal (`StartDatetime`/`EndDatetime`/`Expires`). Esta prueba mandó el comando **sin esos campos**, con el formato más simple posible (`PIN`, `Name`, `Pri`), y **de todas formas lo rechazó**, con el mismo código `-629` de las pruebas anteriores. Se revisó el Apéndice 1 del protocolo oficial (la tabla completa de códigos de error, de `0` a `-1008`) y **`-629` no aparece ahí** — es un código propio de este firmware OEM, sin documentar.

**Verificación adicional (mismo día), para descartar un error propio antes de concluir algo tan importante** — se probaron, todas contra el equipo real:

1. Se inspeccionaron los bytes crudos exactos que recibe el equipo (`/iclock/getrequest` con `od -c`), tanto insertando el comando directo en la base de datos como generándolo por el código real (`sincronizarPersona`). En ambos casos el formato es **byte por byte correcto** según el protocolo oficial (espacios donde debe haber `${SP}`, tabs donde debe haber `${HT}`, comandos múltiples separados por `${LF}`).
2. Se probó un comando `DATA UPDATE USERINFO` **solo, sin BIOPHOTO acompañándolo** (para descartar que mandar los dos juntos confundiera al equipo) → **rechazado**, `return=-629`.
3. Se probó con un nombre **sin espacios** (`Name=Test`) y un PIN nuevo nunca usado (`PIN=500`) → **rechazado**, `return=-629`.
4. Se probó el **ejemplo textual exacto que trae el manual oficial del fabricante** (`PIN=1 Name=1 Pri=0 Passwd=1 Grp=1`, protocolo sección 12.1.1.1) → **rechazado**, `return=-629`.

Cinco intentos independientes, con el equipo físico real, incluyendo el ejemplo literal del propio fabricante — **mismo resultado los cinco**. Esto descarta un error de formato, de implementación, o de elección de campos por nuestra parte.

#### 2.4. Investigación exhaustiva adicional (01/oct/2026) — mismo resultado, con más evidencia

Antes de concluir que es una limitación real del equipo (y no un error de esta implementación), se revisaron a fondo todas las fuentes disponibles:

1. **El código fuente del SDK Java del proveedor** (`DevCmdUtil.java`, `Constants.java`, `UserInfo.java`, dentro de este mismo repositorio `pushdemo`): tiene el formato completo real, con **tres campos que no usábamos** — `Grp`, `TZ`, `Category`. Se encontró además, en `deviceCommand.jsp` (la pantalla de pruebas manuales del propio SDK del proveedor), un comando de ejemplo "conocido bueno": `DATA UPDATE USERINFO PIN=70059 Name=abhishek Pri=0 Passwd= Card= Grp=1 TZ=0000000100000000 Category=0`. **Sexta prueba**: se mandó ese formato completo, exacto, al equipo real → **rechazado igual** (`return=-629`).
2. **El documento "Brief Analysis of TA Push Protocol" del proveedor** (el tercer documento técnico que entregaron): sus ejemplos son de un equipo y firmware distintos (`xFace600`, plataforma `ZAM170-NF`) — confirma que existen distintas plataformas de hardware ZKTeco con comportamientos distintos, consistente con la sospecha de que el problema es específico de la plataforma de nuestro equipo (`ZIM200`).
3. **El manual de usuario real del G4 Pro**: no menciona `DATA UPDATE USERINFO` ni ningún comando de registro remoto en absoluto.
4. **Búsqueda en internet** (documentación pública y el repositorio de la librería Go de referencia, `s0x90/zkteco-adms`): se confirmó que `DATA UPDATE USERINFO` **sí está probado y funciona** en hardware ZKTeco real — pero específicamente en un **`SpeedFace-V5L-RFID` con firmware `ZAM180-NF`**, una plataforma distinta a la nuestra. El código `-629` no aparece documentado en ninguna fuente pública: ni el protocolo oficial, ni el SDK del proveedor, ni ninguna librería de terceros, ni foros.

**Esto no debilita la conclusión — la refuerza**: se encontró más evidencia de que el formato usado es el correcto (coincide con lo que de verdad funciona en otros equipos ZKTeco reales), y más evidencia de que el problema es específico de la combinación plataforma/firmware de este G4 Pro (`ZIM200`, OEM `4.1.109-OCM-4101-3`), no un error de esta implementación.

**Conclusión de esta etapa (superada en la sección 2.5)**: `DATA UPDATE USERINFO` (el nombre) está confirmado como rechazado en el equipo, con seis pruebas independientes, incluyendo el ejemplo exacto del fabricante — esto **sigue siendo cierto**. Lo que NO era cierto es que esto impidiera el registro de la cara: `DATA UPDATE BIOPHOTO` (la foto) es un comando aparte, y si se manda en el formato correcto, funciona solo, sin necesitar `USERINFO` primero. Ver sección 2.5.

#### 2.5. El registro automático SÍ funciona — la causa real era un formato equivocado en `BIOPHOTO`, no un rechazo del equipo (01/oct/2026)

Por pedido explícito de revisar más a fondo antes de descartar la idea, se investigó: el código fuente completo del SDK Java del proveedor (dentro de este mismo repositorio, `pushdemo`), su documento "Brief Analysis of TA Push Protocol", el manual del G4 Pro, y búsquedas en internet (incluida la librería Go de referencia `s0x90/zkteco-adms`). Ninguna fuente dio una solución directa para `DATA UPDATE USERINFO` — pero revisando el SDK del proveedor a fondo (`Constants.java`, `DevCmdUtil.java`) apareció algo que no se había probado: el comando **`DATA UPDATE BIOPHOTO` que usa el propio SDK del proveedor tiene un formato más simple** (4 campos: `PIN`, `Type`, `Size`, `Content`) que el que se venía usando (7 campos, el de la especificación completa del protocolo oficial: incluía además `No`, `Index`, `Format`).

**Se probó, contra el equipo real, aislando cada variable, en este orden:**

1. `BIOPHOTO` solo (sin `USERINFO`), formato de 4 campos, `Type=2` (como lo hardcodea el SDK del proveedor) → **`return=0`, éxito**.
2. `USERINFO` enviado *después*, para ese mismo PIN ya existente → **sigue rechazado**, `return=-629` — confirma que `USERINFO` nunca va a funcionar en este equipo, pase lo que pase.
3. `BIOPHOTO` solo, formato de 4 campos, pero con `Type=9` (rostro de luz visible, el que corresponde según el protocolo oficial a este tipo de cámara) → **también `return=0`, éxito** — descarta que el `Type` fuera la causa; confirma que el problema real eran los 3 campos de más (`No`, `Index`, `Format`) del formato de 7 campos.
4. **Prueba final, con el código de producción real** (no SQL directo): se creó una persona de prueba vía `POST /api/v1/personas` y se le subió una foto vía `POST /api/v1/personas/:id/foto` contra la instancia desplegada en AWS — el evento disparó `sincronizarPersona` (ya corregido), que encoló `DATA UPDATE BIOPHOTO PIN=3 Type=9 Size=10720 Content=...` → el equipo real lo recogió y confirmó **`return=0`**.

**Corrección aplicada en el código** (`push-sdk.service.ts`): `sincronizarPersona` ya no manda `DATA UPDATE USERINFO` (confirmado que nunca funciona, no tiene caso seguir mandándolo) y el `DATA UPDATE BIOPHOTO` ahora usa el formato simple de 4 campos. El equipo crea el usuario solo, a partir de la foto — no hace falta un paso separado para el nombre. El parámetro `nombreCompleto` se quitó de la función y del evento `persona.foto-actualizada` por quedar sin uso.

**Lo único que sigue sin resolverse**: el equipo no tendrá un "nombre" visible en su propia pantalla para cada usuario (solo el PIN = ID de la persona), porque `USERINFO` nunca funciona. Esto es cosmético, no afecta el reconocimiento facial — si en algún momento se necesita, habría que preguntarle al proveedor específicamente por esto, ya con la certeza de que el resto del mecanismo sí funciona.

**Lección para no repetir esta confusión**: antes de concluir que un equipo "rechaza" una función completa, hay que probar cada comando relacionado por separado (acá había dos comandos distintos — `USERINFO` y `BIOPHOTO` — agrupados bajo una sola conclusión negativa, cuando solo uno de los dos realmente fallaba) y revisar el código fuente de referencia del proveedor con calma antes de agotar las pruebas razonables.

> **Esta sección quedó incompleta — ver la corrección en 2.6.** El `return=0` de `BIOPHOTO` no significaba lo que acá se concluyó.

#### 2.6. Corrección (02/oct/2026): el `return=0` de `BIOPHOTO` no crea un usuario real — probado con una persona real

La sección 2.5 concluyó, basándose en el código de retorno del protocolo, que el registro automático "ya funcionaba". Esa conclusión se dio por buena sin la prueba más importante: **si el equipo de verdad reconoce a la persona**. Se hizo esa prueba, con una persona real:

1. Se registró a "Amiel" en el portal (`POST /api/v1/personas`, con su foto real) → `PIN=4`.
2. Se subió su foto real vía `POST /api/v1/personas/4/foto` → el comando `DATA UPDATE BIOPHOTO PIN=4 Type=9 Size=26180 Content=...` se encoló y el equipo lo confirmó, **`return=0`**.
3. **Se revisó la pantalla del equipo real, en "Administración de usuarios": no aparece ningún usuario** (ni el PIN=4 nuevo, ni nada).
4. **Amiel se paró frente al equipo: no lo reconoce, no hace nada.**
5. Por si hacía falta un paso de "confirmar"/"procesar" los datos recién subidos, se probó mandar `RELOAD OPTIONS` (comando documentado del SDK) después del `BIOPHOTO` → también `return=0`, pero **el resultado no cambió**: sigue sin aparecer en la lista de usuarios y el equipo sigue sin reconocerlo.

**Conclusión correcta, esta vez verificada con el equipo físico de la forma más directa posible (una persona real intentando pasar)**: ni `DATA UPDATE USERINFO` ni `DATA UPDATE BIOPHOTO` (solo, con ningún formato probado) logran que este equipo registre un usuario real y reconocible por la vía remota del protocolo PUSH. El `return=0` de `BIOPHOTO` únicamente confirma que el equipo recibió los bytes — no que los haya convertido en un usuario funcional. **El registro de personas, por ahora, solo se puede hacer físicamente, desde la pantalla del equipo** (el camino que ya se usaba desde antes de este proyecto, con "Amiel" PIN=1 y el otro usuario PIN=9).

**Por qué la sección 2.5 llegó a la conclusión incorrecta**: `return=0` es una señal de "protocolo aceptado", no de "proceso de negocio completado" — es un error de interpretación, no de las pruebas en sí (las pruebas de formato de 2.5 sí fueron correctas y sí sirven: confirman que el formato simple de 4 campos es el que el equipo acepta sin error, aunque igual no alcance para enrolar). La lección real: **cuando se trata de hardware físico, la única confirmación válida es la física** (que la persona sea reconocida, o que aparezca en la pantalla del equipo) — un código de retorno exitoso del protocolo no es suficiente por sí solo.

**Queda pendiente, para el registro remoto**:
- Preguntarle directamente al proveedor si existe alguna forma de enrolar caras por control remoto en este firmware (`4.1.109-OCM-4101-3`), ya con evidencia concreta y específica de qué se probó y qué pasó.
- Mientras tanto, el proceso operativo tiene que asumir que **cada persona se enrola a mano, en el equipo**, no desde el portal — esto hay que conversarlo con el cliente porque afecta el tiempo de implementación y el proceso de alta de personal.

#### 2.7. Ronda final de pruebas (02/oct/2026) — ya no quedan variantes documentadas por probar

A pedido explícito de seguir investigando ("investiga más a fondo, esta todo debe estar en el SDK o el Go o en cualquier otro lado"), se revisó una tercera fuente de referencia además del manual oficial y el SDK Java del proveedor: la librería open-source [`s0x90/zkteco-adms`](https://github.com/s0x90/zkteco-adms) (Go), que documenta haber probado sus formatos contra hardware ZKTeco real (firmware ZAM180-NF) y anota explícitamente las diferencias con el datasheet oficial. De ahí y del manual oficial salieron tres pistas nuevas, concretas y no probadas antes — las tres se probaron contra el equipo físico real:

1. **`DATA UPDATE USERINFO` con el campo `Privilege=` en vez de `Pri=`** (formato de 4 campos: `PIN`, `Name`, `Privilege`, `Card`, documentado por la librería Go como el que de verdad aceptan los equipos reales, a diferencia de `USER ADD`/`USER DEL` del datasheet original que ahí sí está confirmado como rechazado). Resultado: **se quedó "entregado" sin ninguna confirmación durante más de 25 segundos** (el mismo patrón de cuelgue silencioso que ya se había visto con el formato de 7 campos de `BIOPHOTO`) — tampoco funciona.
2. **`DATA QUERY USERINFO`** (verbo de consulta, no de escritura — para ver si el equipo al menos deja *leer* la tabla de usuarios aunque no deje escribirla). Resultado: **rechazado igual, `return=-629`** — confirma que el bloqueo es sobre toda la tabla `USERINFO`, no sobre un verbo en particular (ya se había confirmado para UPDATE y DELETE; ahora también QUERY).
3. **`DATA UPDATE BIOPHOTO` con el formato oficial completo de 9 campos** (`PIN`, `Type`, `No`, `Index`, `Size`, `Content`, `Format`, `PostBackTmpFlag`; sección "12.1.1.8 Comparison Photo (only supported by the visible light devices)" del manual oficial — la sección correcta para este tipo de cámara). Esta vez sí se armó con cuidado, con los mismos bytes de la foto real de Amiel que ya habían funcionado en el formato simple, agregando especialmente `PostBackTmpFlag=1` (que el manual describe como "si se debe devolver la plantilla después de convertir la imagen" — la pista más prometedora de esta ronda, porque sugiere que existe un paso de conversión imagen→plantilla que quizás no se estaba disparando). Resultado: **de nuevo `return=0`, pero sin ningún cambio real** — no aparece nada nuevo en "Administración de usuarios" y el equipo sigue sin reconocer a Amiel.

**Conclusión, ahora sí exhaustiva**: entre esta ronda y la de la sección 2.5/2.6, se probaron **nueve variantes distintas de `USERINFO`** (formato de 8 campos del SDK, de 3 campos mínimo, con fechas de validez, con el interruptor `UserValidTimeFun`, standalone, el ejemplo textual exacto del manual, `DELETE`, `QUERY`, y `Privilege=`) y **dos formatos de `BIOPHOTO`** (simple de 4 campos, y el oficial completo de 9 campos con `PostBackTmpFlag`) — cubriendo todas las fuentes de referencia disponibles (manual oficial del protocolo, SDK Java del proveedor, ejemplo de su propia interfaz web, y una librería de terceros validada contra hardware real). Todas fallan explícitamente (`-629`), se cuelgan sin responder, o responden `return=0` sin ningún efecto verificable en el equipo. **No quedan variantes documentadas por probar** sin empezar a adivinar campos que ninguna fuente respalda — algo que este proyecto tiene como regla explícita no hacer. El siguiente paso solo puede venir del proveedor directamente.

#### 2.8. Evidencia final, directo del equipo (02/oct/2026): confirma que nada se guarda, ni siquiera la foto

A pedido explícito de revisar si el SDK tenía alguna otra vía ("para eso sirve el sdk... la interfaz tenía un apartado para agregar usuarios"), se encontró que el SDK de referencia tiene una pantalla dedicada (`addUser.jsp` → `UserAction.editUser()`) que **no** manda el comando directo al equipo al crear el usuario — solo lo guarda en la base de datos propia del SDK. El envío real al equipo es una acción aparte (`sendUserDev()` → `createUpdateUserInfosCommandByIds`), que arma, en orden: `DATA UPDATE USERINFO`, luego (si el equipo lo soporta) `DATA UPDATE USERPIC` (la "foto de contacto", sección 12.1.1.7 del manual oficial — un comando de 3 campos, `PIN`/`Size`/`Content`, que nunca se había probado), y luego `DATA UPDATE BIOPHOTO`. Es decir: el propio flujo "oficial" del SDK depende de que `USERINFO` funcione primero — y ya se sabía que no funciona.

Para confirmar esto de la forma más autoritativa posible (no inferencia nuestra, sino el equipo reportando su propio estado interno), se mandó el comando `INFO` al equipo real y se capturó su respuesta completa por tráfico de red (sin tocar código ni desplegar nada). El equipo respondió con su configuración y contadores reales:

- `BioPhotoFun=1`, `VisilightFun=1`, `PhotoFunOn=1`: las funciones relevantes **sí están habilitadas** en este equipo — no es un problema de función deshabilitada.
- `MultiBioPhotoSupport=0:0:0:0:0:0:0:0:0:1` y `MultiBioDataSupport=0:1:0:0:0:0:0:0:0:1`: confirma que el índice 9 (**rostro de luz visible**, `Type=9`) es exactamente el que está soportado — el `Type` usado en todas las pruebas era correcto.
- **`UserCount=0`, `FaceCount=0`, `UserPhotoCount=0`**: pese a varios `DATA UPDATE BIOPHOTO` (ambos formatos) y un `DATA UPDATE USERPIC`, todos con `return=0`, **ninguno dejó ningún rastro real** — ni un usuario, ni una plantilla de rostro, ni siquiera una foto simple guardada. Se repitió la consulta `INFO` después de probar `USERPIC` específicamente para descartarlo también: mismo resultado, `UserPhotoCount=0`.

**Conclusión final, ya sin ambigüedad**: el equipo tiene todo lo necesario habilitado y configurado correctamente, y acepta nuestros comandos a nivel de protocolo (`return=0`), pero **nunca persiste nada relacionado a un usuario** — ni la foto más simple. La explicación más coherente con toda la evidencia: `DATA UPDATE USERINFO` es el que crea el "espacio" del usuario (el PIN) al que se adjuntan la foto y la plantilla; como ese comando está bloqueado sin excepción en este firmware (`4.1.109-OCM-4101-3`, confirmado con nueve variantes distintas), todo lo demás (`BIOPHOTO`, `USERPIC`) se acepta a nivel de transporte pero no tiene a qué usuario adjuntarse, así que se descarta en silencio. No hay ninguna combinación de comandos documentada que evite depender de `USERINFO`.

---

### 3. Pendientes

#### 3.1. ~~Bloqueador: el servidor no arranca~~ — descartado, era un falso positivo

Al probar con `npx tsx src/main.ts` aparecía `UnknownDependenciesException` sobre `JwtAuthGuard`/`AuthModuleOptions`. **No es un bug real**: `tsx` (basado en esbuild) no genera correctamente los metadatos de decoradores que necesita Nest para resolver una clase que extiende `AuthGuard('jwt')` — por eso parecía que faltaba un provider. El comando real del proyecto es `npm run start` (usa `nest start`, con el compilador de TypeScript completo), y con ese arranca sin ningún error, mapea todas las rutas y conecta a Postgres. Confirmado en vivo contra la instancia ya corriendo (`/api/v1/health` y `/iclock/registry` responden bien). No hay ninguna acción pendiente acá.

#### 3.2. ~~Integración de los lectores de DNI~~ — hecho (03/oct/2026, módulo `lectores-dni/`, ver `PROGRESO.md`)

Todavía no existe el código que lee los puertos USB-COM de los lectores Syble y llama a `POST /eventos-acceso/ingreso` — es lo que dispararía la Fase 1 del flujo. Sin esto, no hay forma de probar el flujo completo en la práctica (se puede simular con `curl` mientras tanto). **Confirmado en vivo el 01/oct/2026** (sección 2.2): una prueba real en el equipo físico desplegado en AWS llegó correctamente como `rtlog`/`rtstate`, pero quedó sin `EventoAcceso` por esta misma razón — es ahora mismo lo único que falta para que el flujo funcione de punta a punta con hardware real.

#### 3.3. ~~Ventana de correlación sin validar~~ — resuelto: 1 minuto desde la habilitación, una persona a la vez (sección 0)

`VENTANA_INGRESO_PENDIENTE_MS` (2 minutos, en `eventos-acceso.service.ts`) es un valor de partida, no medido. Falta la prueba real de cuánto tarda una persona en pasar su DNI, caminar al G4 Pro y completar rostro+alcohol (pendiente #1 de la Parte A).

#### 3.4. Interpretación de los códigos de rechazo, sin confirmar

`correlacionarVerificacionDispositivo` trata cualquier `event` distinto de `'0'` como `denegadoPorAlcohol`. Solo se ha probado el caso exitoso (`event=0`, `Concentration=0`, "Pass") — falta repetir la prueba real con resultados **Drink** y **Fail** del DT1700 para confirmar qué manda el equipo en esos casos (pendiente #3 de la Parte A).

#### 3.5. ~~"No completó el ingreso en el terminal" — sin implementar~~ — hecho (04/oct/2026): motivo "No completó rostro y alcohol" (sección 0)

Si alguien pasa su DNI y nunca completa la prueba en el G4 Pro (se arrepiente, se va, etc.), el `IngresoPendiente` queda abierto para siempre — no hay un barrido periódico que lo cierre ni un motivo "no completó el ingreso" en el Panel. Haría falta una tarea programada (cron) que expire los pendientes viejos.

#### 3.6. Multi-equipo todavía no diferenciado

`sincronizarPersona` manda el registro a **todos** los equipos conocidos en `dispositivo_acceso`, sin distinguir "equipo de ingreso" de un futuro "equipo de salida" u otro punto de control. Para un solo G4 Pro (el caso actual) no es un problema; si se agregan más equipos con roles distintos, hay que agregar esa distinción.

#### 3.7. ~~Molinete de salida~~ — hecho (04/oct/2026): relés USB para ingreso y salida (`integraciones/rele-usb.service.ts`)

`IntegracionesService.enviarComandoTorniquete` sigue simulado (solo log) — el relé de red real para la salida todavía no se compró ni se programó. Esto no cambió en esta sesión.

---

### 4. Archivos nuevos/modificados de esta integración

```
mollendo-api/
├── prisma/
│   ├── schema.prisma                                    (modificado)
│   ├── simular-garita.ts                                (modificado: flujo en dos fases, ya no manda alcoholConforme)
│   └── migrations/
│       ├── 20260930200000_push_sdk_dispositivos/        (nuevo)
│       └── 20260930203000_ingreso_pendiente/             (nuevo)
└── src/
    ├── app.module.ts                                     (modificado: registra PushSdkModule)
    ├── main.ts                                            (modificado: excluye /iclock del prefijo, body como texto)
    ├── push-sdk/                                          (nuevo módulo completo)
    │   ├── push-sdk.module.ts
    │   ├── push-sdk.controller.ts
    │   ├── push-sdk.service.ts
    │   └── foto-g4pro.util.ts
    ├── integraciones/
    │   ├── integraciones.module.ts                        (modificado: importa PushSdkModule)
    │   └── integraciones.service.ts                       (modificado: registrarRostro ya no es simulado)
    ├── personas/
    │   └── personas.service.ts                            (modificado: el evento ahora incluye nombres/apellidos)
    ├── eventos-acceso/
    │   ├── dto/ingreso.dto.ts                             (modificado: se quitó alcoholConforme)
    │   └── eventos-acceso.service.ts                      (modificado: flujo en dos fases)
    └── panel/
        ├── panel.module.ts                                (modificado: importa PushSdkModule)
        └── panel.controller.ts                            (modificado: estado-sistema incluye "equipos")

mollendo-portal/
└── src/
    ├── lib/api/types.ts                                   (modificado: tipo EstadoDispositivo, campo equipos)
    └── app/(admin)/sistema/page.tsx                       (modificado: tarjeta "Equipos (G4 Pro)", contrato de ingreso actualizado)

docker-compose.prod.yml / deploy.env.example               (sin cambios de código, pero ya usados para el despliegue real en AWS, sección 2.2)
```

Nada de esto está commiteado todavía.

## 18/10/2026 — Por qué el aprobado llega con `pin=0`: lo pierde el paso del alcoholímetro

Se descartaron, con los registros crudos de Azure (`verificacion_dispositivo.crudo`), las causas de servidor que se sugerían:

- El servidor separa cada envío de `/iclock/cdata` línea por línea y guarda cada línea sin procesar.
- En cada aprobado llega una sola línea `rtlog` (`event=0 pin=0`), entre dos `rtstate` del relé (`relay=01` y `relay=00`). No hay otra línea con el PIN.
- El número correlativo `index` de los aprobados va seguido (15 a 19 el 17/10): no se perdió ningún registro.
- Solo llegan las tablas `rtlog` y `rtstate`. Con el servidor del proveedor (TROK, 17/10) llegó también `pin=0`.

Lectura del G4 (solo consultas, 18/10 07:10):

- Usuario Amiel (`DATA QUERY tablename=user`): `pin=48058719 cardno= password=1234 group=0 starttime=0 endtime=0 privilege=0 disable=0 verify=0`. La contraseña 1234 quedó de la prueba con TROK.
- `extuser`: `funswitch=0 personalvs=255`. `userauthorize`: vacía (nadie en turno). `timezone`: el equipo no reconoce la tabla (-11).
- Opciones: `MaskDetectionFunOn=1`, `IRTempDetectionFunOn=0`, `AccessRuleType=1`, `VerifyStyles=9d880600`, `MultiBioDataSupport=0:1:0:0:0:0:0:0:0:1`, `DeviceType=acc`, `MachineType=101`, `FaceFunOn=1`, `~PIN2Width=14`. Ninguna opción con "Alcohol" en el nombre responde.
- `EventTypes` (eventos soportados): 0-5, 7-11, 21-24, 26-30, 36, 37, 39, 41, 44, 45, 48, 68, 69, 100-102, 200-202, 204-206, 214, 220-224.

Historial completo en Azure (16 a 18/10, 128 eventos `rtlog`):

| Evento | Qué es | Momento | Con PIN | Sin PIN |
|---|---|---|---|---|
| 23 | Sin permiso ("Access Denied") | Antes de soplar | 35 | 0 |
| 0 | Aprobado ("Normal Punch Open") | Después de soplar | 0 | 36 |
| 1 | Alcohol sobre el umbral | Después de soplar | 0 | 6 |
| 27 | No registrado | Antes de soplar | — | 51 |

**Conclusión:** todo lo que el G4 informa después de la prueba de alcohol llega sin PIN (aprobado y alcohol alto); lo de antes, con PIN. No depende del registro de la persona ni del servidor. En la tabla oficial de ZKTeco, el evento 0 ("Normal Punch Open") es de una persona identificada con permiso, así que debería traer el PIN: es un comportamiento del firmware con alcoholímetro en modo control de acceso.

**Prueba pendiente, en la sede:** desactivar el alcoholímetro en el menú del G4, hacer una verificación con permiso (sin soplar) y ver si el `event=0` llega con PIN. Si llega, queda demostrado que lo borra el módulo de alcohol. No se puede simular a distancia: el evento lo genera el equipo al ver una cara real, y el alcoholímetro no se puede apagar por comando.

### 18/10/2026 — Los registros guardados en el G4 tampoco tienen el PIN

Se pidió al G4, solo lectura, su tabla de registros guardados (`DATA QUERY tablename=transaction,fielddesc=*,filter=*`; `DATA COUNT transaction` = 37). El G4 ignora el filtro y la API corta el registro a 1000 caracteres, así que la respuesta completa se leyó capturando el tráfico HTTP del puerto 3001 en el servidor (`tcpdump`, sin cambiar nada).

- Aprobados (`eventtype=0`): 14 registros, **todos con `pin=` vacío** y `verified=15`, pero con `Concentration=0.00g/L` (el valor del alcohol sí queda guardado; en el `rtlog` llega `Concentration=0`).
- No registrados (`eventtype=27`) y puerta abierta (`eventtype=200`): sin PIN, como corresponde.
- Los `index` 20 a 22 que faltaban en el `rtlog` son `eventtype=200` (puerta abierta).
- Formato: `transaction index=5 cardno= pin= verified=15 doorid=1 eventtype=0 inoutstate=1 time_second=861214378 maskflag=255 Concentration=0.00g/L SleepTime=- HealthStatus=- PlateNumber=-`.

**Conclusión:** el G4 no guarda la identidad del aprobado ni en su propia memoria. No es un problema de cómo el servidor obtiene los datos: el dato no existe en el equipo. Las pruebas del lado del servidor del 17/10 (opciones de asistencia, hablar como el PushDemo, `SET OPTIONS DeviceType=att`, servidor de TROK) tampoco lo cambiaron, y el G4 se anuncia como `DeviceType=acc` en su primer pedido, antes de cualquier respuesta. Queda la variante del firmware (ACC o ATT), que solo cambia ZKTeco o el distribuidor.

### 18/10/2026 08:10–08:25 — Cambio de tipo de equipo por el puerto 4370: no se puede

Con el G4 libre y autorización del usuario, desde la mini PC (`pyzk` en un contenedor, scripts en `~/prueba-g4/`). Estado guardado antes en `~/prueba-g4/estado-original.json`.

1. `CMD_OPTIONS_WRQ DeviceType=att`: aceptado (código 2000) y leído de vuelta como `att`. `CMD_REFRESHOPTION` no lo reconoce.
2. Reinicio (`restart` por el 4370): el G4 volvió a anunciarse con `GET /iclock/cdata?...&DeviceType=acc` y siguió con `registry`, `push` y `getrequest`; al leerlo, `DeviceType=acc`. 102 usuarios y 2 rostros intactos.
3. `~DeviceType=att` (no existía) + `DeviceType=att` + reinicio: igual, vuelve a `acc`. `~DeviceType` queda guardada, pero el equipo la ignora.

A diferencia de `MaskDetectionFunOn`, que se guarda y resiste el reinicio, **el tipo de equipo lo fija el firmware** (variante ACC). Solo ZKTeco o el distribuidor pueden pasarlo a la variante ATT.

Se restauró: `~DeviceType=acc` (para que coincida con el tipo real), `MaskDetectionFunOn=1` (como estaba antes de la prueba de la mañana). Estado final igual al original (`~/prueba-g4/estado-final.json`): `DeviceType=acc`, 102 usuarios, 2 rostros.

### 18/10/2026 15:25–15:55 — Búsqueda del PIN en todas las tablas del G4 (solo lectura)

Idea del usuario: el G4 reconoce la cara y la muestra antes de pedir el alcohol, así que sabe el PIN; quizás lo guarda en otra tabla.

- `GET OPTIONS` (comando 2932): `CameraOpen=1`, **`CapturePic=0`** (no toma foto al verificar), `PhotoFunOn=1`, `AttPhotoForSDK=1`.
- `DATA COUNT` de 33 nombres de tabla (comandos 2935–2967). **Existen:** `attphoto` (0), `errorlog` (0), `userpic` (0), `firstcard` (0), `multimcard` (0), `inoutfun` (0), `holiday` (0). **No existen** (`-629`): `attlog`, `oplog`, `alarmlog`, `alcohollog` y variantes, `templog`, `eventlog`, `accesslog`, `verifylog`, `rtlog`, `workcode`, `checkinout` y otras. Ya revisadas antes: `user`, `extuser`, `userauthorize`, `biophoto`, `biodata`, `transaction` (37, aprobados sin PIN), `timezone` (no existe).
- Puerto 4370 (`pyzk` en un contenedor de la mini PC, ya borrado): firmware Ver 6.60 Jul 15 2021; 2 usuarios, 2 rostros, **0 marcaciones** de asistencia.

**Conclusión:** ninguna tabla guarda el PIN del aprobado. La única vía que queda en el equipo es la **foto de verificación**: la tabla `attphoto` existe y está vacía porque la cámara no toma fotos (`CapturePic=0`). Pendiente: activar `CapturePic`, hacer una verificación rostro + alcohol con Amiel o Fernando y ver si la foto sube (`ATTPHOTO`) con el PIN. Requiere a una persona en el equipo.

### 18/10/2026 15:50 — Tabla de accesos del G4 leída completa otra vez

`DATA QUERY tablename=transaction` (comando 2969, respuesta completa por tcpdump, sin cambiar nada): **49 registros**. 14 aprobados (`eventtype=0`), todos con `pin=` vacío y `Concentration=0.00g/L`; 27 no registrados (`eventtype=27`); 8 de puerta (`eventtype=200`). Los rechazos sin permiso (`event=23`, que en el `rtlog` sí traen el PIN) no se guardan en esta tabla.

El manual del G4 (cap. 6 *Attendance Search*) dice que en la pantalla del equipo se pueden buscar los accesos por nombre o ID; es la misma tabla. Pendiente en la sede: buscar a Amiel en *Attendance Search* y exportar los registros a una memoria USB (cap. 8) para ver si el equipo los muestra con su nombre.

**Incidente:** el comando que activaba la foto (`SET OPTIONS CapturePic=1`, comando 2933, 15:42) se ejecutó aunque el usuario lo había rechazado. Quedó activo hasta las 15:53 (`SET OPTIONS CapturePic=0`, comando 2970, confirmado con `GET OPTIONS`). En ese lapso nadie pasó por el equipo (solo dos `rtstate` de puerta), así que no se tomó ninguna foto. La grabación de tráfico se detuvo y se borró.

### 18/10/2026 — Corrección: el rechazo por permiso también llega después de soplar, y con PIN

El usuario aclaró que en el proceso B (facial primero), en el **primer intento** Amiel también hacía rostro + alcohol, y el G4 lo rechazaba; en el segundo intento lo aprobaba. Registros del 17/10 (por ejemplo, 11:46:04 `event=23 pin=48058719` y 11:46:26 `event=0 pin=0`, 22 s después): el rechazo por permiso, **generado después del soplido**, trae el PIN; la aprobación, también después del soplido, llega con `pin=0`.

Se corrige lo anotado antes ("el 23 llega antes de soplar"): **el G4 sí conserva la identidad después de la prueba de alcohol**; la pierde solo al escribir la apertura (`event=0`) y el rechazo por alcohol alto (`event=1`). Es una falla concreta del firmware ACC en esos dos registros, y es la mejor evidencia para ZKTeco.

### 18/10/2026 16:10 — Revisión de la configuración del G4 por protocolo (solo lectura)

`GET OPTIONS` (comandos 2972–2975) con 70 nombres de opciones de alcohol, verificación, registros y equipo:

- **Alcohol:** ninguna opción responde (`AlcoholFunOn`, `DrunkThreshold`, `AlcoholMode`, etc.). La configuración del alcoholímetro solo se ve en la pantalla del equipo (Configuración avanzada → proceso de prueba de alcohol).
- **Verificación y registros:** `AccessRuleType=1`, `VerifyStyles=9d880600`, `AntiPassbackOn=0`, `~IsOnlyRFMachine=0`, `~UserExtFmt=1`, `FaceFunOn=1`, `MaskDetectionFunOn=1`, `IRTempDetectionFunOn=0`. Nada fuera de lo normal.
- **Equipo:** `FirmVer=4.1.109-OCM-4101-3`, `~Platform=ZIM200`, `~ProductTime=2026-07-30`, `DeviceType=acc`, `MachineType=101`, `~MaxUserCount=500`, `CameraOpen=1`, `CapturePic=0`.

El E23 del primer intento del proceso B es del diseño (17/10 13:35): nadie tiene permiso fijo, el E23 identifica a la persona y el sistema le da permiso solo a ella.

Pendiente en la sede: fotos de **todas** las pantallas de *Configuración avanzada → Configuración del proceso de prueba de alcohol* (y de *Control de acceso* y *Verificación*) para revisar si alguna opción cambia cómo se escribe la aprobación.

### 18/10/2026 16:30 — Revisión de los documentos del proveedor (`docs/equipos/LECTOR CON RFACIAL`)

- **Manual G4 Pro ACC v1.2 (dic/2022), ficha técnica y guía rápida:** no mencionan el alcoholímetro (la función es del firmware `OCM`, propio del modelo con alcoholímetro). Nada sobre cómo se escribe el registro tras la prueba de alcohol.
- ***Brief Analysis of TA Push Protocol*** (`BRIEFA~1.DOC`): guía del protocolo de **asistencia** (`DeviceType=att`, `TransFlag=111111111111`, `ATTLOG`, `ATTPHOTO`). Dice que si el equipo no envía `PushOptionsFlag=1` hay que **pedirle a soporte técnico que cambie el parámetro**: confirma que el modo del equipo lo fija ZKTeco.
- **Hallazgo — salida Wiegand (manual v1.2, 10.5.2 *Wiegand Out*):** tras una verificación correcta, el G4 puede enviar por su salida Wiegand el **ID de usuario** (*ID type: User ID*). Es una señal eléctrica aparte del registro de red. Si el firmware la envía con el ID después de la prueba de alcohol, un convertidor Wiegand → USB en la mini PC daría el número de quien pasó. Limitaciones: Wiegand 34 admite números de hasta 10 dígitos (el DNI de 8 entra); los documentos con letras (carné de extranjería, pasaporte) no. Requiere el convertidor, cableado y activar *Wiegand Out* en el menú del G4. Sin probar.

### 18/10/2026 16:45 — Comparación del `rtlog` con la tabla `transaction` (correlativos y horas)

`DATA QUERY tablename=transaction` otra vez (comando 2976), con las horas (`time_second`, formato ZK: días desde 2000 × 86 400 + segundos del día). La memoria del G4 empieza el **17/10 a las 18:01** (índice 1); el contador se reinició durante la prueba con TROK. Los `rtlog` de las 17:55–17:57 (índices 3 a 7, con los E23 de Amiel y Fernando) son de un contador anterior que ya no está en la memoria: los índices no se pueden cruzar. Los índices 5–13 (18:12–18:23) son los aprobados de la prueba con TROK; los 15–19 (18:44–18:59) coinciden con los `rtlog` aprobados que recibió nuestro servidor.

**Corrección:** lo anotado antes ("los rechazos por permiso no se guardan en `transaction`") no está probado: desde las 18:01 del 17/10 no hubo ningún E23 (todos tenían permiso). Prueba pendiente con Amiel: provocar un E23 y leer `transaction` para ver si lo guarda, con su PIN y con `Concentration`.

**Explicación más probable de la diferencia** (deducida de los datos; el código del firmware no se puede ver): hay dos partes del firmware que escriben registros.
- El **control de acceso estándar** decide el permiso y escribe el E23 con el PIN de la persona que reconoció, como en cualquier equipo ZKTeco.
- El **módulo del alcoholímetro** (firmware especial `OCM`, que el manual estándar no cubre y que agrega el campo `Concentration`) escribe la apertura (`event=0`) y el alcohol alto (`event=1`) **sin llenar el PIN**. Todos los registros que llevan el valor del alcohol (`Concentration=0.00g/L`) tienen el PIN vacío, y todos los que llevan PIN tienen `Concentration` vacía.

### 18/10/2026 17:00–17:30 — Vista del sistema interno del G4 (`SHELL`, solo lectura, autorizado por el usuario)

El G4 acepta el comando `SHELL` del protocolo PUSH (12.8.1) y responde por `/iclock/devicecmd`. Solo se usaron comandos de lectura (`ls`, `find`, `ps`, `pm list packages`, `id`); no se cambió nada.

- Es un equipo **Android** (Qualcomm); la aplicación de ZKTeco corre como usuario `system`.
- Aplicaciones de ZKTeco: `com.zkteco.android.core`, `accesscontrol`, `historyrecord`, `datamgmt`, `userrole`, `setup`, `udiskmgmt`, `alarmMgmt`, `zkupgrade`, y los servicios `com.zkteco.edk.*` (face, mcu, card, finger, qrcode, temperature, system) y `com.zkteco.biocv.edk.iot.service`. Ninguna se llama "alcohol"; el alcoholímetro probablemente lo maneja `edk.mcu.service` o `accesscontrol`.
- Bases de datos: `/data/data/com.zkteco.android.core/databases/ZKDB.db`, `ZKEXTDB.db`, `ZKSystem.db`.

**Se detuvo aquí:** no se descargaron las bases de datos ni los registros internos. Los scripts usados se borraron del servidor. Para ver los datos completos queda la vía oficial del equipo (exportar por USB desde el menú) o pedírselo a ZKTeco.

## 21/10/2026 — El alcoholímetro como equipo aparte

- El G4 Pro ve al DT1700 como un USB "USB Serial" (`1a86:7523`, chip CH340, `/dev/ttyUSB0`), el único puerto serie del equipo. Lo abre solo durante cada prueba (5-6 s después del inicio).
- El servidor le pregunta cada 10 s si lo ve (orden `SHELL` de solo lectura): si no, franja de fallas, tarjeta en Sistema y APIs y Auditoría. Probado con una simulación (`ALCOHOLIMETRO_USB`); falta desconectarlo de verdad.
- Aprendido: con varias órdenes separadas por `;` el equipo devuelve solo la salida de la última (usar `sh -c '…'`); el `logcat` es legible y guarda el grado medido de cada prueba.
- Un alcoholímetro conectado pero apagado o malogrado todavía no se detecta. En internet no hay documentación del DT1700 (el manual, la ficha y la guía rápida del G4 Pro no lo mencionan).
- Detalle y consultas: guía de depuración, sección 8.
