# Contingencias ante fallas de los equipos de garita

Sistema de Control de Accesos — Terminal Portuario de Mollendo

Este documento describe qué ocurre cuando falla el **alcoholímetro**, el **equipo de reconocimiento facial**, el **lector de DNI** o la **conexión a internet** de la garita, y las alternativas de contingencia para que el terminal siga operando mientras el equipo se repara o se reemplaza. Las alternativas **bajan o reemplazan controles de seguridad**, por lo que su uso debe ser aprobado por el cliente (ver la sección 7).

> **Estado al 15/10/2026:** el cliente comprará un **alcoholímetro de repuesto** (mismo modelo DT1700). Si falla **solo el alcoholímetro**, se conecta el repuesto al equipo facial y se sigue normal, sin contingencia (sección 2.2). Si falla el **equipo facial**, se usa la **verificación manual con prueba de alcohol a todos**, con el repuesto usado solo (sección 5). La **conexión a internet** de la garita queda **a cargo de TMAM**, con los requisitos de la sección 6.5. Queda pendiente la **falla del lector de DNI** (sección 10). Nada de esto está programado todavía.

---

## 1. Cómo funciona el ingreso normalmente

1. La persona pasa su **DNI** por el lector de ingreso.
2. El sistema revisa que esté **registrada, activa y con sus documentos vigentes**. Si no cumple, se deniega en ese momento.
3. Si cumple, el sistema le da permiso en el **equipo de reconocimiento facial** (G4 Pro), que le **reconoce el rostro** y le toma la **prueba de alcohol** con el alcoholímetro (DT1700), conectado al propio equipo.
4. El equipo informa al sistema el resultado: **apto** o **alcohol**. El valor medido de alcohol no se envía, solo el resultado.
5. Si es apto, el sistema **abre el molinete de ingreso**.

La **salida** solo pide el DNI: no usa el equipo facial ni el alcoholímetro.

---

## 2. Falla del alcoholímetro

### 2.1. Qué ocurre hoy

- **Salidas:** normales.
- **Ingresos: nadie puede ingresar, pero nadie entra sin control** (comprobado el 07/10/2026, ver la sección 8). Sin el alcoholímetro, el equipo facial reconoce el rostro, muestra *"Verificación de identidad completada. Realice una medición de alcohol."* y **se queda esperando la prueba**: no aprueba y no informa nada al sistema. Después de 1 minuto, el sistema deniega a la persona por "No completó rostro y alcohol".
- **El equipo no avisa la desconexión:** al desconectar o volver a conectar el alcoholímetro, el equipo facial no envía ninguna señal al sistema. Solo muestra un ícono con un punto rojo en su propia pantalla. El sistema solo puede notarlo de forma indirecta, por ejemplo si varias personas seguidas quedan en "No completó rostro y alcohol".

### 2.2. Qué se hace (decidido el 15/10/2026): reemplazo por el repuesto

Si falla **solo el alcoholímetro**, **no hace falta contingencia**: se conecta el alcoholímetro de repuesto al equipo facial y el ingreso sigue normal, con todos los controles.

**Cómo se sabe que falló:**

| Forma | Cómo | Estado |
|---|---|---|
| Pantalla del equipo facial | Ícono con un punto rojo | Ya existe (hay que estar mirando el equipo) |
| Aviso en el portal | Si **varias personas seguidas** no completan la prueba (el equipo reconoce el rostro pero no llega el resultado del alcohol), la franja roja de fallas muestra *"Posible falla del alcoholímetro: revisar el equipo facial"* | Por programar (pequeño) |

**Pasos:**

1. Aparece el aviso o el vigilante ve el punto rojo en el equipo facial.
2. Se desconecta el alcoholímetro malogrado y se conecta el de repuesto.
3. Se comprueba con una persona que el equipo pida soplar y apruebe.
4. El aviso desaparece solo cuando las personas vuelven a completar la prueba.

**Requisitos del repuesto:**

- Debe ser **el mismo modelo (DT1700)** u otro que el equipo facial acepte: un alcoholímetro portátil cualquiera **no se puede conectar** al equipo facial.
- El DT1700 **también funciona solo** (pantalla, botón "Test" y registro de pruebas; sección 8.1), así que el mismo repuesto sirve para la verificación manual si falla el equipo facial (sección 5).
- **Probar el cambio una vez** antes de necesitarlo: conectar el repuesto al equipo facial y comprobar que lo reconoce y mide bien (puede requerir algún ajuste en el menú del equipo).

---

## 3. Falla del equipo de reconocimiento facial

### 3.1. Qué ocurre hoy

- **Salidas:** normales.
- **Ingresos:** **nadie puede ingresar.** La persona pasa su DNI, el sistema la habilita en el equipo, pero el equipo no responde; después de 1 minuto queda denegada por "No completó rostro y alcohol".
- Como el alcoholímetro está conectado al equipo facial, **también se pierde la prueba de alcohol**.
- No hay riesgo de ingresos sin control: sin el equipo, el molinete de ingreso no se abre.
- El sistema detecta que el equipo dejó de comunicarse (2 minutos sin contacto) y lo muestra como **"Desconectado"** en "Sistema y APIs" y en la **franja roja de fallas** que aparece arriba de todas las pantallas, también para el vigilante.

---

## 4. Alternativas de contingencia

### 4.1. Alternativa A — Seguir con los equipos que quedan

El sistema deja de usar el equipo que falló y sigue con los demás, hasta que se repare o reemplace.

| Equipo que falla | Modo | Cómo se ingresa | Controles que se pierden |
|---|---|---|---|
| Alcoholímetro | **Sin alcoholímetro** | DNI + rostro | Prueba de alcohol |
| Equipo facial | **Solo DNI** | DNI (con documentos en regla) | Rostro y prueba de alcohol |

- **Sin alcoholímetro:** además de activar el modo en el sistema, hay que **desactivar la prueba de alcohol en el propio equipo facial**, desde su menú (Configuración avanzada → proceso de prueba de alcohol). El sistema no puede cambiar ese ajuste a distancia. Mientras siga activado, el equipo pedirá soplar y nadie terminará la verificación.
- **Solo DNI:** si la persona está en regla, el molinete se abre directamente al pasar el DNI.

### 4.2. Alternativa B — Verificación manual por el vigilante

El vigilante reemplaza al equipo que falló:

- **Alcohol:** toma la prueba con un **alcoholímetro portátil** de respaldo.
- **Rostro** (si falló el equipo facial): compara a la persona con **su foto registrada**, que el Panel de vigilancia muestra en grande al pasar el DNI.

Si la persona está en regla, el Panel muestra el botón **"Abrir con verificación manual"**. El vigilante registra el resultado de la prueba de alcohol y abre el molinete.

### 4.3. Comparación

| | A. Seguir con los equipos que quedan | B. Verificación manual |
|---|---|---|
| Rapidez en la garita | Igual que siempre | Más lenta (el vigilante revisa a cada persona) |
| Control de alcohol | **No hay** | Sí, con alcoholímetro portátil |
| Control de identidad si falla el equipo facial | **Solo el DNI** (alguien podría usar un DNI ajeno) | El vigilante compara la foto |
| Equipo adicional | Ninguno | Alcoholímetro portátil de respaldo |
| Carga para el vigilante | Ninguna | Revisar a cada persona |

**Combinación posible:** modo "Solo DNI" con la foto de la persona en el Panel, para que el vigilante la vea antes de que pase.

En todas las alternativas el sistema **sigue revisando con el DNI** que la persona esté registrada, activa y con sus documentos vigentes. Quien no cumple se deniega igual que siempre.

---

## 5. Contingencia decidida: verificación manual (falla del equipo facial)

Decidido por el cliente el 15/10/2026: si falla el **equipo facial**, **alternativa B (verificación manual), con prueba de alcohol a todos**. Como el alcoholímetro va conectado al equipo facial, también se pierde; la prueba se toma con el **repuesto usado solo**. La pueden activar **el vigilante y el administrador** y **no tiene tiempo máximo**: dura hasta que se repare el equipo. Pendiente de programar.

Si falla **solo el alcoholímetro**, no se usa esta contingencia: se reemplaza por el repuesto (sección 2.2). La verificación manual queda como respaldo si en ese momento no hubiera repuesto a mano.

### 5.1. Decisiones

| Pregunta | Decisión |
|---|---|
| ¿Qué se hace si falla el equipo facial? | Verificación manual (alternativa B) |
| ¿Y si falla solo el alcoholímetro? | Se reemplaza por el repuesto, sin contingencia (sección 2.2) |
| Prueba de alcohol durante la contingencia | **A todos**, con el alcoholímetro de repuesto usado solo |
| ¿Quién activa y desactiva la contingencia? | **Vigilante y administrador** |
| ¿Quién aprueba cada ingreso? | El vigilante de turno |
| Tiempo máximo | **Ninguno** |

### 5.2. Paso a paso

**1. Se detecta la falla**

A los 2 minutos sin comunicación aparece la franja roja *"Equipo facial (G4 Pro) desconectado"* arriba de todas las pantallas (ya existe).

**2. Se activa**

El vigilante o el administrador presiona **"Activar verificación manual"** en el Panel de vigilancia y escribe el **motivo** (por ejemplo, "equipo facial apagado"). Queda en la **auditoría** quién, cuándo y por qué. Mientras dure, el Panel muestra una franja fija:

> **Verificación manual activa** desde 15/10 08:30, activada por *vigilante 1*. Motivo: equipo facial apagado.

**3. Ingreso de cada persona**

1. Pasa su **DNI** por el lector, como siempre.
2. El sistema revisa que esté registrada, activa y con sus documentos vigentes. Si no cumple, **se deniega igual que siempre**.
3. Si cumple, el Panel muestra una ventana grande con su **foto registrada**, nombre, DNI y empresa.
4. El vigilante **compara el rostro** con la foto y le toma la **prueba de alcohol** con el alcoholímetro de repuesto.
5. El vigilante elige:

| Botón | Qué hace | Cómo queda en el historial |
|---|---|---|
| **"Apto: abrir"** | Abre el molinete de ingreso | Autorizado, verificación manual, con el vigilante que lo aprobó |
| **"Alcohol: no apto"** | No abre; activa el aviso de ingreso denegado | Denegado por alcohol, verificación manual |
| **"No es la persona"** | No abre; activa el aviso de ingreso denegado | Denegado: el rostro no coincide con el DNI |

Si el vigilante no elige en **2 minutos**, el ingreso se deniega y la ventana se cierra.

**4. Mientras dure**

- Las **salidas** siguen normales (no usan el equipo facial).
- Cada ingreso queda **marcado como "verificación manual"** en el historial y en los reportes, con el vigilante y el resultado.
- Si el equipo facial vuelve a conectarse, el Panel avisa: *"El equipo facial volvió a conectarse. ¿Volver a modo normal?"*

**5. Fin**

El vigilante o el administrador presiona **"Volver a modo normal"** (queda en la auditoría). No vuelve solo, a propósito: si el equipo se conectara y desconectara varias veces seguidas, el modo cambiaría a cada rato y el vigilante no sabría en cuál está.

### 5.3. Lo que se necesita

| Qué | Estado |
|---|---|
| Alcoholímetro para la prueba manual | El **repuesto DT1700** que comprará el cliente, usado solo (decisión 4 de la sección 7). También sirve el que estaba conectado al equipo facial, que funciona solo (sección 8.1) |
| Foto de cada persona | Ya se guarda en el sistema |
| Activar y desactivar (vigilante y administrador), con motivo y auditoría | Por programar |
| Franja fija con el modo vigente en el Panel | Por programar |
| Ventana con la foto y los botones, con límite de 2 minutos | Por programar |
| Abrir el molinete desde "Apto: abrir" | Por programar (la orden de abrir ya existe) |
| Marca "verificación manual" en historial y reportes | Por programar |
| Aviso "¿volver a modo normal?" | Por programar |

Una vez programado, se hace una **prueba en la garita**: apagar el equipo facial y usar el alcoholímetro de repuesto.

### 5.4. Modos que bajan controles (alternativa A)

Con la prueba de alcohol a todos, los modos **"Solo DNI"** y **"Sin alcoholímetro"** (sección 4.1) no son necesarios. Quedan descritos solo como referencia; no se programan salvo que el cliente lo pida.

---

## 6. Corte de internet (modalidad con servidor en la nube)

Cuando el sistema está en un servidor en la nube y la PC de la garita trabaja como controlador, la garita depende de internet para decidir los ingresos.

> **Responsable:** la conexión a internet de la garita y su respaldo quedan **a cargo de TMAM** (15/10/2026). Lo que debe tener está en la sección 6.5.

### 6.1. Qué ocurre hoy

| Situación sin internet | Qué pasa |
|---|---|
| Alguien quiere **ingresar** | **No ingresa nadie.** Se activa el aviso de ingreso denegado |
| Alguien **registrado** quiere **salir** | **Sale.** La PC de la garita guarda la lista del personal (se actualiza cada 10 minutos) y abre el molinete |
| Alguien **no registrado** quiere salir | No sale. Se activa el aviso de salida denegada |
| **Vuelve internet** | La PC de la garita se reconecta sola y envía al servidor las salidas que registró, con su hora real |

En resumen: sin internet **nadie entra, pero nadie queda encerrado**.

### 6.2. Por qué no se puede ingresar sin internet

Para ingresar hacen falta dos controles:

1. **Documentos y bajas:** están en el servidor. Se podría resolver guardando en la PC de la garita una lista de quién puede ingresar cada día, como ya se hace con la lista para salir.
2. **Rostro y alcohol:** el equipo facial está conectado al **servidor en la nube**. Sin internet, el servidor no puede habilitar a la persona en el equipo y el equipo no puede informar el resultado. **Este es el impedimento principal.**

### 6.3. Alternativas para permitir el ingreso sin internet

| Alternativa | Cómo funciona | Ventaja | Desventaja |
|---|---|---|---|
| **A. Solo DNI** | Si la persona está en regla según la lista guardada en la garita, ingresa solo con su DNI | Sencilla | **Sin control de rostro ni de alcohol** mientras dure el corte |
| **B. Verificación manual** | Ingresa con su DNI en regla; el vigilante compara su foto y le toma la prueba con un alcoholímetro portátil (como en la sección 4.2) | Mantiene los controles | Más lenta; depende del vigilante |
| **C. PC de la garita como respaldo completo** | El equipo facial se conecta a la PC de la garita y esta al servidor. Sin internet, la PC de la garita hace todo localmente | Todo funciona igual, con rostro y alcohol | **Es la más compleja:** duplica el sistema y obliga a mantener sincronizados el personal, los documentos y las fotos |
| **D. Internet de respaldo** | Una segunda conexión (por ejemplo, un router 4G) que entra sola si se cae la principal | No requiere programación; el sistema sigue completo | Costo del equipo y del plan de datos |
| **E. Ingreso como la salida** | La PC de la garita guarda también la lista de quién puede ingresar y hace de intermediaria con el equipo facial (ver 6.4) | **Mantiene rostro y alcohol** sin internet; sirve aunque falle el servidor en la nube | Programación considerable y pruebas con el equipo facial real; cambia cómo se conecta el equipo |

**Recomendación:**
- **Principal: D (internet de respaldo).** Hace que el corte sea muy poco probable sin bajar ningún control.
- **Si aun así se corta: B (verificación manual),** la misma contingencia propuesta para la falla del equipo facial.
- **A** baja la seguridad: se ingresaría sin prueba de alcohol.
- **C** es mucho trabajo y agrega puntos de falla.
- **E** es la mejor solución técnica si el cliente quiere que se ingrese sin internet con todos los controles; conviene después de D, por su costo de programación y pruebas.

### 6.4. Alternativa E en detalle: ingreso como la salida

**Idea:** hacer con el ingreso lo mismo que ya se hace con la salida (sección 6.1). Es posible porque el equipo facial **ya guarda las caras del personal y mide el alcohol por su cuenta**: del servidor solo necesita la orden de habilitar a la persona, y luego informa el resultado.

**Cambio principal:** hoy el equipo facial se conecta directo al servidor en la nube. Pasaría a conectarse a la **PC de la garita** (misma red local), que hace de intermediaria:

- **Con internet:** la PC de la garita le pasa todo al servidor, sin cambios; el sistema funciona como ahora.
- **Sin internet:** la PC de la garita atiende sola al equipo facial.

**Cómo sería un ingreso sin internet:**

| Paso | Qué hace la PC de la garita |
|---|---|
| Cada 10 minutos, con internet | Guarda la lista de quién puede ingresar: activos, con sus documentos y fechas de vencimiento (junto con la lista para salir) |
| La persona pasa su DNI | Revisa en la lista que esté activa y con sus documentos vigentes **ese día** |
| | Habilita a la persona en el equipo facial |
| | El equipo reconoce el rostro y toma la prueba de alcohol, como siempre |
| | Si es apto, abre el molinete de ingreso |
| Vuelve internet | Envía al servidor los ingresos con su hora real y el resultado de la prueba |

**Qué se mantiene y qué no sin internet:**

| Control | ¿Se mantiene? |
|---|---|
| DNI registrado y documentos vigentes | Sí, con la lista guardada (las fechas de vencimiento se revisan en el día) |
| Rostro y alcohol | Sí, los hace el equipo facial |
| Bajas hechas **durante** el corte | No: la PC de la garita se entera al volver internet (riesgo pequeño) |
| Ingresos en vivo en el portal | Aparecen al volver internet |

**Esfuerzo y riesgos:**

- **Programación considerable:** la PC de la garita debe hablar el protocolo del equipo facial (ADMS) y reenviar al servidor, además de guardar la lista de ingreso y los ingresos pendientes.
- **Pruebas con el equipo real en la garita**, incluido cortar internet varias veces.
- **Nuevo punto de falla:** si la PC de la garita se apaga, el equipo facial queda sin servidor (hoy, sin la PC de la garita tampoco hay lectores de DNI ni molinetes, así que el ingreso ya depende de ella).
- **Ventaja sobre D:** también cubre una caída del servidor en la nube, no solo del internet de la garita.

**Sugerencia:** primero D (internet de respaldo), por ser barato e inmediato; E si el cliente necesita ingresar sin internet con todos los controles.

### 6.5. Lo que debe tener la garita (a cargo de TMAM)

Para que un corte de internet no detenga los ingresos, la garita debe contar con:

| # | Requisito | Para qué |
|---|---|---|
| 1 | **Conexión principal estable** (por ejemplo, fibra óptica) | Uso normal: la PC de la garita y el equipo facial se comunican con el servidor todo el tiempo |
| 2 | **Conexión de respaldo de otro proveedor** (por ejemplo, 4G/5G o una segunda fibra de otra empresa) | Si cae la principal, sigue funcionando. Conviene que sea de **otra empresa**, para que no fallen las dos a la vez |
| 3 | **Router con doble salida y cambio automático** (*dual WAN / failover*) | Que pase a la conexión de respaldo **solo**, en segundos, sin que nadie tenga que hacer nada, y que vuelva a la principal cuando regrese |
| 4 | **Equipo de respaldo de energía (UPS)** para el router, la PC de la garita, el equipo facial y el switch de red | Que un corte de luz breve no corte también el internet ni los equipos |
| 5 | **IP pública fija** en la conexión principal (y, si es posible, también en la de respaldo) | Permite cerrar el puerto del equipo facial en el servidor para que solo acepte la garita (ver `docs/seguridad/Seguridad.md`, sección 4.2). Con dos conexiones, se autorizan las dos IP |
| 6 | **Que nadie cambie la configuración de red** de la PC de la garita ni del equipo facial sin avisar a soporte | Ambos tienen configurada la dirección del servidor; un cambio de red puede dejarlos sin conexión |

**Consumo de datos:** bajo. Por internet viajan los datos de cada ingreso y salida y, al registrar o actualizar personal, sus fotos. Un plan de datos móviles básico alcanza para la conexión de respaldo.

**Cómo se nota un corte:** el sistema ya muestra en la franja roja de fallas *"Controlador desconectado"* (la PC de la garita) y *"Equipo facial desconectado"* cuando dejan de comunicarse con el servidor.

**Si aun así fallan las dos conexiones**, se mantiene lo de la sección 6.1: nadie ingresa, pero las salidas siguen funcionando. La alternativa E (ingreso como la salida) queda como mejora futura si TMAM la requiere.

---

## 7. Decisiones del cliente

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | Con el **alcoholímetro** malogrado: ¿ingreso **sin prueba de alcohol** (A), **con alcoholímetro portátil** (B) o **no ingresa nadie**? | **Se reemplaza por el repuesto** conectado al equipo facial, sin contingencia (sección 2.2; 15/10/2026) |
| 2 | Con el **equipo facial** malogrado: ¿ingreso **solo con DNI** (A), **con verificación manual** (B) o **no ingresa nadie**? | **B**, prueba a todos (15/10/2026) |
| 3 | ¿Quién activa la contingencia? ¿Cada apertura manual la hace cualquier vigilante o necesita un supervisor? | **Vigilante y administrador** activan y desactivan; cada ingreso lo aprueba el vigilante de turno (15/10/2026) |
| 4 | ¿Habrá un **alcoholímetro de respaldo** en la garita? | **Sí**: el cliente comprará un repuesto, que debe ser **DT1700** u otro compatible con el equipo facial (15/10/2026) |
| 5 | ¿Hay un **tiempo máximo** para la contingencia? | **No** (15/10/2026) |
| 6 | ¿Se quiere una **alerta** cuando varias personas seguidas no completan la verificación ("posible falla del alcoholímetro")? | **Sí**, para saber cuándo cambiar el alcoholímetro (sección 2.2; 15/10/2026) |
| 7 | Ante un **corte de internet**: ¿no ingresa nadie, **solo DNI** (A), **verificación manual** (B), **PC de la garita como respaldo completo** (C) o **como la salida, con rostro y alcohol** (E)? ¿Se instalará **internet de respaldo** (D)? | **A cargo de TMAM**: internet de respaldo (D) con los requisitos de la sección 6.5 (15/10/2026). Si fallan las dos conexiones, nadie ingresa y las salidas siguen. La alternativa E queda como mejora futura |
| 8 | Con el **lector de DNI** malogrado: ¿el vigilante **escribe el DNI** en el Panel, o se usa la **identificación por rostro** (sección 10)? | **Pendiente**: se verá más adelante (requiere una prueba con el equipo facial) |

---

## 8. Prueba realizada (07/10/2026)

Con una persona habilitada en el equipo facial y el sistema registrando todo lo que el equipo envía:

| Paso | Resultado |
|---|---|
| Verificaciones con el alcoholímetro conectado | Aprobadas: el equipo informa "apto" (rostro con alcohol) |
| Desconectar el alcoholímetro | El equipo **no envía nada** al sistema (solo muestra un ícono con punto rojo en su pantalla) |
| Verificación sin el alcoholímetro | Reconoce el rostro, muestra *"Verificación de identidad completada. Realice una medición de alcohol."* y **queda esperando**: no aprueba ni informa nada |
| Volver a conectar el alcoholímetro | El equipo **no envía nada** al sistema |

**Conclusión:** sin alcoholímetro **no hay ingresos sin control de alcohol**; el riesgo es solo operativo (nadie puede ingresar). Para usar la alternativa A ("Sin alcoholímetro") habría que desactivar la prueba de alcohol en el menú del equipo facial.

### 8.1. Alcoholímetro conectado a la PC de la garita (07/10/2026)

Se probó conectar el alcoholímetro a la PC de la garita en lugar del equipo facial, para que el sistema pudiera saber si está conectado y recibir el valor medido.

| Prueba | Resultado |
|---|---|
| ¿La PC lo reconoce? | Sí, como puerto serie USB |
| ¿Mide sin el equipo facial? | **Sí.** Funciona solo: botón "Test", sopla, muestra el resultado en su pantalla y guarda las pruebas ("Data") |
| ¿Envía el resultado a la PC? | **No.** Nada en reposo ni al hacer una prueba (escuchado a 4 800 – 115 200 baudios) |

- **El alcoholímetro trabaja a pedido:** solo entrega el resultado cuando el equipo que lo controla (el equipo facial) le envía una orden. Esa orden no está documentada. Para usarlo desde la PC habría que pedir a **ZKTeco o al proveedor el protocolo de comunicación** del alcoholímetro. Probar órdenes al azar podría desconfigurarlo o descalibrarlo.
- **En operación normal debe ir conectado al equipo facial**, como está diseñado; esa integración funciona y es segura.
- **Sirve como alcoholímetro portátil:** como mide solo, con pantalla y batería propias, **si falla el equipo facial** se puede usar desconectado para la verificación manual del vigilante (alternativa B), sin comprar otro equipo.
- **Escala que trae de fábrica:** apto ("Pass") por debajo de **0,090 mg/L**; "Drink" de 0,090 a 0,363 mg/L; "Drunk" sobre 0,363 mg/L. Es una referencia para el umbral del equipo facial, que fija el cliente.

---

## 9. Otras fallas ya contempladas

| Falla | Qué ocurre |
|---|---|
| **Corte de internet** (con el servidor en la nube) | Ver la sección 6. |
| **Lector de DNI desconectado** | "Sistema y APIs" lo muestra como "Cable desconectado"; el sistema vuelve a intentar abrirlo cada 5 segundos y se recupera solo al reconectarlo. Para seguir operando mientras tanto, ver la sección 10 |
| **Relé del molinete desconectado** | "Sistema y APIs" lo muestra como "No conectado"; el sistema registra la orden de abrir y se recupera solo al reconectarlo |

---

## 10. Falla del lector de DNI (propuesta, por confirmar)

> **Pendiente** (15/10/2026): se verá más adelante. Antes de decidir hace falta la prueba con el equipo facial de la sección 10.4.

### 10.1. Qué ocurre hoy

- **Ingreso:** nadie puede ingresar. Sin el DNI, el sistema no sabe quién es la persona y no la habilita en el equipo facial.
- **Salida:** nadie sale por el molinete (la salida solo usa el DNI).
- El sistema lo detecta y lo muestra como **"Cable desconectado"** en la franja roja de fallas.

### 10.2. Por qué no basta con "solo rostro"

Las personas están cargadas en el equipo facial pero **bloqueadas** hasta que pasan su DNI. Cuando el equipo aprueba a alguien (rostro y alcohol conformes), **no informa quién fue** (envía "persona 0"); el sistema lo sabe porque solo había una persona habilitada. Si se habilitara a todos los que están en regla para usar solo el rostro, el sistema **no sabría quién entró**. Por eso no se recomienda.

El único momento en que el equipo informa **quién es** la persona es cuando **la rechaza** por estar bloqueada: en ese caso envía su DNI.

### 10.3. Alternativas

| Alternativa | Cómo funciona | ¿Una sola mirada al equipo? | ¿Se sabe quién entró? | Estado |
|---|---|---|---|---|
| **Lector de repuesto** | Se cambia el lector malogrado | Sí | Sí | Solo requiere comprarlo |
| **El vigilante escribe el DNI** | En el Panel, un campo "Ingresar DNI manualmente" que hace lo mismo que el lector | Sí | Sí | Por programar (pequeño). Sirve también para la **salida** |
| **Identificación por rostro (automática)** | Con el lector desconectado, la persona se para frente al equipo facial: el equipo la rechaza e informa su DNI; el sistema revisa sus documentos y la habilita (~2 s); si el equipo **la vuelve a reconocer solo** mientras sigue frente a él, toma la prueba de alcohol y se abre el molinete | Sí, si el equipo vuelve a reconocer solo (la persona se queda unos segundos) | Sí | **Requiere una prueba con el equipo real** antes de programar |
| Habilitar a todos (solo rostro) | Todos los que están en regla quedan habilitados | Sí | **No** (salvo que el equipo guarde quién pasó y se pueda consultar; por probar) | No recomendada |

### 10.4. Prueba pendiente con el equipo facial

Con el equipo conectado al servidor y una persona registrada con foto, la persona se para frente al equipo **sin pasar el DNI** y se queda ahí. Comprobar:

1. Que el equipo informe su DNI al rechazarla, y cuánto tarda.
2. Si, una vez habilitada, el equipo **la vuelve a reconocer solo** sin que se mueva, y qué muestra en su pantalla.
3. Si el registro interno del equipo guarda quién pasó en los ingresos aprobados (para la alternativa "habilitar a todos").

No requiere programar nada; toma unos 15 minutos.

### 10.5. Recomendación

- **Ingreso:** identificación por rostro si la prueba sale bien; si no, el vigilante escribe el DNI.
- **Salida:** el vigilante escribe el DNI.
- En ambos casos conviene tener un **lector de repuesto**.
