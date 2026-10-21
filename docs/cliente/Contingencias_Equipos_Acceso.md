# Contingencias ante fallas de los equipos del punto de acceso

Sistema de Control de Accesos — Terminal Monte Azul Mollendo (TMAM)

Este documento describe **qué hacer cuando falla un equipo del punto de acceso**: cómo se detecta, quién hace cada cosa (vigilante, soporte y administrador), qué hace el sistema y cómo se vuelve a la normalidad. Cubre el alcoholímetro, el equipo de reconocimiento facial, el corte de internet, el lector de DNI, el personal sin DNI (tarjeta de contingencia), los relés de los molinetes, el Controlador (PC) y el servidor en la nube.

Actualizado al 21/10/2026, con las decisiones del cliente hasta esa fecha. **Lo que dice "por programar" todavía no existe en el sistema.**

---

## Resumen

| Si falla… | Qué se hace | Quién | ¿Se pierde algún control? | Estado |
|---|---|---|---|---|
| **Alcoholímetro** | Se conecta el **alcoholímetro de repuesto** al equipo facial y se sigue normal (sección 3) | El vigilante informa; soporte lo cambia | No | Decidido. Falta comprar el repuesto |
| **Equipo facial** (y con él el alcoholímetro) | **Verificación manual**: DNI + el vigilante compara la foto + prueba de alcohol a todos con el repuesto (sección 4) | Vigilante o administrador la activan; el vigilante aprueba cada ingreso | No | **Programado** (15/10/2026); falta la prueba en el punto de acceso |
| **Internet** del punto de acceso | **Segunda conexión de otro proveedor** que entra sola (sección 5) | TMAM | No | Decidido, a cargo de TMAM |
| **Lector de DNI** | Mientras tanto, contingencia **"sin lector"**, que se activa sola: el **ingreso** es solo con rostro y alcohol y la **salida** la abre el vigilante desde **"Presentes ahora"**; se conecta el **lector de repuesto** (sección 6) | El vigilante informa y abre las salidas; soporte cambia el lector | En el ingreso, el DNI: la persona se identifica solo por su rostro | **Programado** (21/10/2026); falta probarlo en el punto de acceso y el repuesto |
| **Personal sin DNI**, o DNI que el lector no lee | El vigilante pasa la **tarjeta de contingencia** en lugar del DNI, después de rostro y alcohol; en la salida elige al personal en el Panel (sección 6.5) | El personal avisa; el vigilante pasa la tarjeta; el administrador la imprime y la administra | No: rostro, alcohol y documentos se revisan igual | **Programado** (20/10/2026); falta probar el QR en el lector. Tarjeta digital pendiente |
| **Relé de un molinete** | Se cambia por el **relé de repuesto** (sección 7.1) | El vigilante informa; soporte lo cambia | No | Decidido. Falta el repuesto preparado |
| **Controlador (PC)** | Se cambia por la **PC de repuesto**; si no la hay, se libera el molinete a mano (sección 7.2) | El vigilante informa; soporte la cambia | Con la PC de repuesto, no | Decidido. Falta la PC de repuesto preparada |
| **Servidor en la nube** | Se recupera solo al reiniciarse; respaldos diarios probados (sección 7.3) | Soporte | No | Funciona hoy |

**Regla general:** en todos los casos el sistema **sigue exigiendo el DNI con documentos vigentes**, y quien no cumple se deniega igual que siempre. Ninguna contingencia decidida deja entrar a alguien sin prueba de alcohol.

**Quién hace qué:**

| Rol | Qué hace ante una falla |
|---|---|
| **Vigilante** | **Informa** la falla a soporte y al administrador. No cambia ni configura equipos. Sigue operando el punto de acceso con lo que el sistema le muestre (por ejemplo, la verificación manual de la sección 4 o la salida desde "Presentes ahora" de la sección 6.3). Guarda la tarjeta de contingencia y la pasa cuando el personal no tiene DNI (sección 6.5) |
| **Administrador** | Gestiona la reparación o la compra de repuestos; puede activar y desactivar la verificación manual; crea, imprime y administra las tarjetas de contingencia |
| **Soporte** | **Cambia los equipos** por sus repuestos y hace la **configuración** que haga falta en el Controlador (PC) |

---

## 1. Cómo funciona el punto de acceso normalmente

**Ingreso.** El equipo facial (G4 Pro) trabaja en **modo asistencia** (desde el 19/10/2026): reconoce a todo el personal registrado, le toma la **prueba de alcohol** con el alcoholímetro (DT1700) conectado a él y envía al sistema quién sopló y el grado. El sistema decide según el **orden del ingreso**, que se elige en *Sistema y APIs → Orden del ingreso*:

**Facial + Alcohol → DNI** (el que se usa):

1. La persona mira al equipo, que le **reconoce el rostro** y le pide soplar.
2. Sopla. Unos 8 segundos después de medir, el equipo dice **"correcto"** (en total, unos 20 segundos desde que miró al equipo).
3. Casi al mismo tiempo, el Panel muestra **"Aprobó [nombre] · pase su DNI"**, con su foto. Tiene **30 segundos** para pasar su **DNI**.
4. El sistema revisa que esté **activa, con sus documentos vigentes** y que no figure dentro (antipassback). Si cumple, **abre el molinete de ingreso** con su relé.
5. Si no pasa el DNI a tiempo: *"No pasó su DNI a tiempo"*. Si pasa el DNI sin haber hecho antes la prueba: *"DNI antes del facial"*.

**DNI → Facial + Alcohol:**

1. La persona pasa su **DNI**. Si no cumple (baja, documentos o antipassback), se deniega en ese momento.
2. Si cumple, tiene **1 minuto** para hacer rostro y alcohol en el equipo facial (el Panel la muestra "en espera").
3. Si es apta, el sistema **abre el molinete** cuando el equipo dice "correcto" (unos 25 segundos después del DNI). Vale la prueba soplada dentro del minuto aunque el aviso del equipo llegue después; si no la hace, *"No completó rostro y alcohol"*.

En los dos órdenes, si la prueba da **alcohol**, se deniega con su nombre y suena el aviso.

**Salida:** la persona pasa su DNI por el lector de salida y, si está registrada y figura dentro, se abre el molinete de salida. No usa el equipo facial ni el alcoholímetro.

**Equipos que intervienen:**

| Equipo | Dónde está conectado | Para qué |
|---|---|---|
| Lectores de DNI (ingreso y salida) | Controlador (PC) (USB) | Saber quién quiere pasar |
| Equipo facial (G4 Pro) | Servidor en la nube, por internet | Rostro y prueba de alcohol |
| Alcoholímetro (DT1700) | Equipo facial | Prueba de alcohol |
| Relés de los molinetes (ingreso y salida) | Controlador (PC) (USB) | Abrir los molinetes |
| Relés de aviso (si están instalados) | Controlador (PC) (USB) | Luz o sirena cuando se deniega un paso |
| Controlador (PC) | Servidor en la nube, por internet | Lee los DNI y abre los molinetes cuando el servidor lo ordena |
| Servidor en la nube | — | Decide cada ingreso y salida; guarda el personal, los documentos y el historial |

---

## 2. Cómo se entera el vigilante de una falla

| Señal | Dónde | Qué fallas muestra | Estado |
|---|---|---|---|
| **Franja roja de fallas** | Arriba de todas las pantallas del portal, para el administrador y el vigilante | Equipo facial desconectado (unos 20 segundos sin contacto), alcoholímetro desconectado del equipo facial (unos 10 segundos), lector de DNI con el cable desconectado, relé no conectado, Controlador (PC) desconectado, respaldos atrasados, sin conexión con el servidor. Aparece y desaparece en el momento, junto con "Sistema y APIs" | Ya existe |
| **"Sistema y APIs"** | Portal del administrador | El estado de cada equipo, en detalle | Ya existe |
| **Auditoría** | Portal del administrador | Cada desconexión y cada vuelta de un equipo, con cuánto duró (buscar "equipos") | Ya existe |
| **Panel de vigilancia** | Portal del vigilante | Cada ingreso: "esperando rostro y alcohol" con su cuenta regresiva, y el resultado | Ya existe |
| **Pantalla del equipo facial** | En el punto de acceso | Un ícono con **punto rojo** si el alcoholímetro está desconectado (visto el 07/10; falta confirmar que aparece en el modo actual) | Ya existe |
| **La propia persona** | En el molinete | Avisa al vigilante si no puede pasar | — |

---

## 3. Falla del alcoholímetro

**Decidido (15/10/2026):** se reemplaza por el **alcoholímetro de repuesto** y el ingreso sigue normal. **No hace falta activar ninguna contingencia.**

### 3.1. Qué pasa cuando falla

- **Salidas:** normales.
- **Ingresos:** nadie puede ingresar, pero **nadie entra sin prueba de alcohol** (comprobado el 07/10/2026, anexo B). El equipo facial reconoce el rostro, muestra *"Verificación de identidad completada. Realice una medición de alcohol."* y se queda esperando. Al minuto, el sistema deniega por "No completó rostro y alcohol" y el molinete **no se abre**.
- **El sistema vigila el alcoholímetro** (21/10/2026): cada 10 segundos le pregunta al equipo facial si lo ve conectado por USB. Si se desconecta, aparece en la franja roja de fallas (*"Nadie puede ingresar: el equipo facial no puede tomar la prueba de alcohol"*), en "Sistema y APIs" (tarjeta "Alcoholímetro (DT1700)") y en la Auditoría. **Límite:** un alcoholímetro conectado pero malogrado (no mide) no se detecta así, porque el equipo solo le habla durante una prueba; para ese caso quedan las señales de la tabla siguiente (pendiente: avisar cuando varias pruebas seguidas empiezan y no dan resultado).

### 3.2. Cómo se detecta

La persona que no puede soplar **no se va**: le avisa al vigilante en ese momento. El vigilante se entera **con la primera persona**.

| Señal | Estado |
|---|---|
| La persona dice *"miré al equipo pero no me deja soplar"* | — |
| El Panel muestra "esperando rostro y alcohol" y, al minuto, "Denegado: no completó rostro y alcohol" | Ya existe |
| **Aviso en el Panel**: en el momento en que alguien no completa, aparece arriba del Panel un aviso ámbar con su nombre y la hora: *"Si dice que no pudo soplar: revise si el equipo facial muestra un punto rojo (alcoholímetro desconectado) y avise a soporte."* Se cierra con la ✕ o desaparece solo cuando la siguiente persona ingresa bien; se mantiene al recargar la página. La etiqueta "No completó rostro y alcohol" de la tabla lleva una ⓘ con la misma explicación | Programado (15/10/2026); falta subirlo al servidor |
| **Franja roja de fallas y "Sistema y APIs"**: "Alcoholímetro (DT1700): Desconectado" (unos 10 segundos) | Ya existe (21/10/2026); falta la prueba desconectándolo de verdad |
| Punto rojo en la pantalla del equipo facial | Ya existe |

### 3.3. Qué se hace

1. **Vigilante:** mira la franja roja de fallas y la pantalla del equipo facial; si dice "Alcoholímetro (DT1700): Desconectado" o tiene el **punto rojo**, es el alcoholímetro. **Informa** a soporte y al administrador.
2. **Soporte:** desconecta el alcoholímetro malogrado y **conecta el de repuesto** al equipo facial.
3. **Soporte:** comprueba con una persona que el equipo le pida soplar y la apruebe. La persona que no pudo pasar vuelve a pasar su DNI e ingresa normal.
4. **Administrador:** gestiona la reparación del alcoholímetro malogrado.

Mientras soporte hace el cambio, nadie puede ingresar. Si el cambio va a demorar, el vigilante o el administrador pueden activar la **verificación manual** de la sección 4 (con el alcoholímetro de repuesto usado solo).

### 3.4. Requisitos del repuesto

- Debe ser **el mismo modelo (DT1700)** u otro que el equipo facial acepte. Un alcoholímetro portátil cualquiera **no se puede conectar** al equipo facial.
- El DT1700 **también funciona solo** (pantalla, botón "Test" y registro de pruebas; anexo B), así que el mismo repuesto sirve para la verificación manual de la sección 4.
- **Probar el cambio una vez** antes de necesitarlo: conectar el repuesto al equipo facial y comprobar que lo reconoce y mide bien. Puede requerir algún ajuste en el menú del equipo.
- Conviene que use la misma escala: apto por debajo de **0,090 mg/L** (la del DT1700).

---

## 4. Falla del equipo facial: verificación manual

**Decidido (15/10/2026):** si falla el equipo facial (G4 Pro), se usa la **verificación manual**: el DNI sigue igual, el vigilante compara el rostro con la foto registrada y toma la **prueba de alcohol a todos** con el alcoholímetro de repuesto. **Programado el 15/10/2026**; falta la prueba en el punto de acceso.

### 4.1. Qué pasa cuando falla

- **Salidas:** normales.
- **Ingresos:** nadie puede ingresar. Sin el equipo no hay prueba de rostro y alcohol: con el orden Facial + Alcohol → DNI, el DNI queda en *"DNI antes del facial"*; con DNI → Facial + Alcohol, al minuto queda *"No completó rostro y alcohol"*. No hay riesgo de ingresos sin control: el molinete no se abre.
- Como el alcoholímetro está conectado al equipo facial, **también se pierde la prueba de alcohol**.
- El sistema lo detecta a los **~20 segundos** sin contacto, muestra en la franja roja *"Terminal facial … Desconectado"* y lo registra en la Auditoría.

### 4.2. Decisiones

| Pregunta | Decisión |
|---|---|
| ¿Qué se hace? | Verificación manual |
| Prueba de alcohol | **A todos**, con el alcoholímetro de repuesto usado solo |
| ¿Quién activa y desactiva la verificación manual? | **El vigilante y el administrador** |
| ¿Quién aprueba cada ingreso? | El vigilante de turno |
| Tiempo máximo | **Ninguno**: dura hasta que se repare el equipo |

### 4.3. Paso a paso

**1. Se detecta la falla.** Aparece la franja roja *"Terminal facial desconectado"*, con el botón **"Activar verificación manual"**. Si alguien no completó rostro y alcohol en ese momento, el aviso ámbar del Panel dice *"El equipo facial está desconectado: nadie puede completar rostro y alcohol. Avise a soporte."*

**2. Se activa.** El vigilante o el administrador presiona **"Activar verificación manual"** en el Panel de vigilancia y escribe el **motivo** (por ejemplo, "equipo facial apagado"). Queda en la **auditoría** quién, cuándo y por qué. Mientras dure, el Panel muestra una franja fija:

> **Verificación manual activa** desde 15/10 08:30, activada por *vigilante 1*. Motivo: equipo facial apagado.

**3. Ingreso de cada persona.**

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

**4. Mientras dure.**

- Las **salidas** siguen normales.
- Cada ingreso queda **marcado como "verificación manual"** en el historial y en los reportes, con el vigilante y el resultado.
- Si el equipo facial vuelve a conectarse, el Panel avisa: *"El equipo facial volvió a conectarse. ¿Volver a modo normal?"*

**5. Fin.** El vigilante o el administrador presiona **"Volver a modo normal"** (queda en la auditoría). No vuelve solo, a propósito: si el equipo se conectara y desconectara varias veces seguidas, el modo cambiaría a cada rato y el vigilante no sabría en cuál está.

### 4.4. Lo que se necesita

| Qué | Estado |
|---|---|
| Alcoholímetro para la prueba manual | El repuesto DT1700 (sección 3.4). También sirve el que estaba conectado al equipo facial, que funciona solo |
| Foto de cada persona | Ya se guarda en el sistema |
| Activar y desactivar (vigilante y administrador), con motivo y auditoría | Programado |
| Franja fija con el modo vigente en el Panel | Programado |
| Ventana con la foto y los botones, con límite de 2 minutos | Programado |
| Abrir el molinete desde "Apto: abrir" | Programado |
| Marca "Manual" con quien decidió en historial y reportes; motivo "Rostro no coincide" | Programado |
| Aviso "¿volver a modo normal?" | Programado |
| En modo manual no se envían órdenes al equipo facial (al volver, nadie queda habilitado) | Programado |

Una vez programado, se hace una **prueba en el punto de acceso**: apagar el equipo facial, activar la verificación manual y usar el alcoholímetro de repuesto.

---

## 5. Corte de internet

**Decidido (15/10/2026):** la conexión a internet del punto de acceso y su respaldo quedan **a cargo de TMAM**.

### 5.1. Qué pasa sin internet

El Controlador (PC) y el equipo facial trabajan con el servidor en la nube, por internet.

| Situación | Qué pasa |
|---|---|
| Alguien quiere **ingresar** | **No ingresa nadie.** Se activa el aviso de ingreso denegado |
| Alguien **registrado** quiere **salir** | **Sale.** El Controlador (PC) guarda la lista del personal (se renueva cada 10 minutos) y abre el molinete |
| Alguien **no registrado** quiere salir | No sale. Se activa el aviso de salida denegada |
| **Vuelve internet** | El Controlador (PC) se reconecta solo y envía al servidor las salidas que registró, con su hora real |

En resumen: sin internet **nadie entra, pero nadie queda encerrado**. No se puede ingresar porque el equipo facial y la revisión de documentos dependen del servidor (anexo A).

**Cómo se nota:** la franja roja muestra *"Controlador desconectado"* y *"Equipo facial desconectado"*.

### 5.2. Lo que debe tener el punto de acceso (a cargo de TMAM)

| # | Requisito | Para qué |
|---|---|---|
| 1 | **Conexión principal estable** (por ejemplo, fibra óptica) | Uso normal |
| 2 | **Segunda conexión de internet de alta velocidad, de otro proveedor** | Si cae la principal, sigue funcionando. De **otra empresa**, para que no fallen las dos a la vez |
| 3 | **Router con doble salida y cambio automático** (*dual WAN / failover*) | Que pase a la segunda conexión **solo**, en segundos, y vuelva a la principal cuando regrese |
| 4 | **Equipo de respaldo de energía (UPS)** para el router, el Controlador (PC), el equipo facial y el switch de red | Que un corte de luz breve no corte también el internet ni los equipos |
| 5 | **IP pública fija** en la conexión principal (y, si es posible, en la segunda) | Permite que el servidor solo acepte al equipo facial desdel punto de acceso (`docs/seguridad/Seguridad.md`, sección 4.2). Con dos conexiones, se autorizan las dos IP |
| 6 | **No cambiar la configuración de red** del Controlador (PC) ni del equipo facial sin avisar a soporte | Ambos tienen configurada la dirección del servidor |

**Uso de internet del sistema:** bajo. Viajan los datos de cada ingreso y salida y, al registrar o actualizar personal, sus fotos. Cualquier conexión de alta velocidad es suficiente, también la segunda.

**Si fallan las dos conexiones:** se mantiene lo de la sección 5.1 (nadie ingresa, las salidas siguen) hasta que vuelva alguna. La alternativa E del anexo A (ingresar sin internet con rostro y alcohol) queda como **mejora futura**, si TMAM la requiere.

---

## 6. Falla del lector de DNI

**Decidido (21/10/2026):** mientras se cambia el lector, el sistema pasa **solo** a la contingencia **"sin lector"** (sección 6.3): el ingreso es solo con rostro y alcohol y la salida la abre el vigilante desde "Presentes ahora". Luego se conecta el **lector de repuesto** (sección 6.4). **Programado el 21/10/2026.**

### 6.1. Qué pasa cuando falla

- **Ingreso:** sin el DNI, el sistema no puede revisar los documentos de la persona, así que nadie ingresa por la vía normal.
- **Salida:** nadie sale por el molinete.
- La franja roja muestra *"Lector de DNI de ingreso (o de salida): cable desconectado"*. El sistema intenta reconectarlo cada 5 segundos y se recupera solo cuando el lector vuelve a funcionar.
- Mientras tanto, se activa sola la contingencia "sin lector" (sección 6.3).

### 6.2. Cómo está conectado un lector

Cada lector tiene **dos partes**:

| Parte | Qué es | Qué reconoce el sistema |
|---|---|---|
| **Lector** (Syble XB-7705H) | Lee el código de barras del reverso del DNI | Nada: el sistema no distingue un lector de otro |
| **Adaptador USB** (cable blanco) | Une el lector con el Controlador (PC) | **Su número de serie**, que trae de fábrica. El Controlador (PC) tiene configurado cuál es el de ingreso y cuál el de salida |

Por eso, lo que haya que hacer al cambiarlo depende de qué parte se malogró (sección 6.4).

### 6.3. Mientras tanto: contingencia "sin lector"

Hecho el 21/10/2026 (decisión del cliente: que se active sola y que avise). Con el lector de DNI de una puerta desconectado y el Controlador (PC) en línea, el sistema pasa **solo** a esta contingencia y vuelve **solo** al modo normal cuando el lector se conecta. Nadie la activa ni la desactiva.

**Cómo avisa:** además de la franja roja de equipos (en todas las páginas), el Panel de vigilancia muestra una franja por cada puerta:

- *"**Lector de DNI de ingreso sin conexión.** El ingreso es solo con rostro y alcohol, sin pasar el DNI."*
- *"**Lector de DNI de salida sin conexión.** Abra la salida desde «Presentes ahora»."*, con el botón **"Ir a Presentes ahora"**.

#### Ingreso: solo con rostro y alcohol

Funciona con el orden **"facial primero"**. Con el orden "facial primero", el equipo facial informa quién aprobó rostro y alcohol (por eso el Panel muestra *"Aprobó [nombre]"*), así que no hace falta la prueba con el equipo que se pedía antes.

1. La persona hace rostro y alcohol, como siempre.
2. El sistema revisa sus documentos, bajas y antipassback, como si hubiera pasado su DNI.
3. Si cumple, **se abre el molinete sin esperar el DNI**. Si no cumple, se deniega igual que siempre.
4. En el Panel queda marcado *"Sin lector de DNI: identificado por rostro"*.

**Qué control se pierde:** el DNI. La persona se identifica **solo por su rostro**; el equipo facial podría confundir a dos personas muy parecidas. Por eso queda marcado en el Panel y en el reporte.

Con el **orden normal** (DNI primero) no hay ingreso sin lector: el sistema no sabe quién es la persona hasta que pasa el DNI.

#### Salida: desde "Presentes ahora"

1. El vigilante toca **"Ir a Presentes ahora"** en la franja del Panel. La página muestra a todo el personal que figura dentro, con un buscador por nombre, DNI o empresa.
2. Busca a la persona y toca **"Salida"** en su fila.
3. Confirma en la ventana *"¿Abrir la salida de … (DNI …)? Se abre el molinete de salida."* con **"Abrir salida"**.
4. Se abre el molinete de salida. La salida queda **a nombre de la persona**, marcada *"Salida sin lector"* y con el vigilante que la abrió.

El botón **"Salida"** aparece **solo mientras el lector de salida está desconectado**; con el lector conectado, la página es solo de consulta. Mientras tanto, **"Salida sin DNI"** (tarjeta de contingencia) queda desactivado, porque la tarjeta se pasa por el lector de salida. Para estar seguro de quién es, el vigilante puede pedirle el DNI a la persona y buscarla por el número.

#### En el reporte

En el Excel de ingresos y salidas, la columna "Verificación" dice *"Sin lector de DNI (identificado por rostro)"* en el ingreso y *"Salida sin lector (eligió …)"* en la salida, con el correo del vigilante.

#### Lo que no cubre

- **Sin el Controlador (PC)** no se abre ningún molinete: la contingencia no se activa (sección 7.2).
- **Sin internet:** igual que siempre (sección 5).
- **Verificación manual activa** (falla del equipo facial): el ingreso lo decide el vigilante y necesita el DNI.

### 6.4. Cambio por el repuesto

| Qué se malogró | ¿Basta con conectar el repuesto? | Qué hay que hacer |
|---|---|---|
| **El lector** (el adaptador está bien) | **Sí**, si el lector de repuesto ya está configurado | Conectar el lector de repuesto **al mismo adaptador**. El lector nuevo se configura **una sola vez, con anticipación**, con su folleto (Factory Default → RS232 → 115200) |
| **El adaptador** (cable blanco) | Depende de la opción elegida (abajo) | El adaptador nuevo tiene otro número de serie |
| **Los dos** | Igual que el adaptador | Las dos cosas |

**Para el adaptador hay dos opciones** (decisión 11 de la sección 8, pendiente):

| Opción | Cómo | Ventaja | Desventaja |
|---|---|---|---|
| **A. Soporte lo registra al cambiarlo** | Soporte conecta el repuesto y registra el adaptador nuevo en el Controlador (PC) | No requiere programar nada | Un paso más para soporte en el momento del cambio |
| **B. Adaptador de repuesto registrado desde antes** (recomendada) | El Controlador (PC) acepta, para cada lector, **también** el adaptador de repuesto | Soporte **lo conecta y funciona solo** | Requiere un cambio pequeño de programación |

**Qué se hace:**

1. **Vigilante:** ve la franja roja *"Lector de DNI: cable desconectado"*, o nota que el lector no lee. **Informa** a soporte y al administrador.
2. **Mientras tanto** se sigue operando con la contingencia "sin lector" de la sección 6.3: en el ingreso, solo con rostro y alcohol; en la salida, el vigilante la abre desde "Presentes ahora".
3. **Soporte:** conecta el repuesto (lector y, si hace falta, su adaptador). Con la opción B funciona solo; con la A, registra el adaptador nuevo.
4. **Soporte:** comprueba que el aviso desaparezca y que el lector lea un DNI.
5. **Administrador:** gestiona la reparación o la compra de otro repuesto.

**Requisitos del repuesto:** un **lector del mismo modelo, ya configurado**, y su **adaptador USB**. Conviene **etiquetar** los adaptadores ("INGRESO", "SALIDA", "REPUESTO") y **probar el cambio una vez** antes de necesitarlo.

---

### 6.5. Personal sin DNI, o DNI que el lector no lee: tarjeta de contingencia

Hecho el 20/10/2026. Sirve cuando el personal **olvidó su DNI** o el lector **no lo reconoce** (DNI dañado). El vigilante pasa una **tarjeta con un código QR** por el lector en lugar del DNI. La tarjeta **sola no abre**: reemplaza al DNI de ese personal en ese momento, y el sistema revisa todo lo demás igual que siempre (rostro, alcohol, documentos, bajas y antipassback).

#### 6.5.1. La tarjeta

- Tiene el tamaño de un carné (85,6 × 54 mm), con el logo de Monte Azul, el nombre *"Tarjeta de contingencia"*, su número (N.º 1, N.º 2…), su vencimiento y el QR.
- El QR lleva un código al azar (`TMAM-CONT-` y 20 letras y números). **No lleva el DNI ni el nombre de nadie**: la tarjeta no es de una persona, es del punto de acceso.
- Puede **no vencer** (*"Vigente hasta que se desactive"*) o **vencer un día** (*"Pierde vigencia después de esa fecha"*).
- La imprime el administrador y **la guarda el vigilante**. No se presta ni se le entrega al personal.

#### 6.5.2. Dónde está en el portal

Menú **Contingencias → Tarjetas de contingencia**. Las tarjetas se ven como un carné (azul si está vigente; gris si está desactivada o vencida), en un carrusel que se pasa con las flechas, con los puntos de abajo o arrastrando. Al costado de cada una: su último uso, la fecha de su código y los botones. Debajo, la **lista de usos** de todas las tarjetas.

| Qué | Administrador | Vigilante |
|---|---|---|
| Ver las tarjetas y la lista de usos | Sí | No |
| Crear una tarjeta (con o sin vencimiento) | Sí | No |
| Imprimir (vista previa en el portal, tamaño carné) | Sí | No |
| Cambiar el vencimiento | Sí | No |
| Desactivar y volver a activar | Sí | No |
| Cambiar el código | Sí | No |
| Eliminar (solo si nunca se usó) | Sí | No |

El código no se muestra en el portal: solo va en el QR impreso.

#### 6.5.3. Ingreso paso a paso

Funciona con el orden **"facial primero"** (rostro y alcohol antes del DNI). El Panel no cambia y el vigilante no presiona ningún botón.

1. **Personal:** avisa al vigilante que no tiene su DNI o que el lector no lo reconoce.
2. **Personal:** hace rostro y alcohol en el equipo facial, como siempre.
3. **Panel:** muestra *"Aprobó … pase su DNI"*.
4. **Vigilante:** en esos 30 segundos, pasa la tarjeta por el **lector de ingreso**, donde el personal pasaría su DNI.
5. **Sistema:** revisa la tarjeta y los documentos de quien aprobó y, si todo está en regla, abre el molinete.
6. El ingreso queda **a nombre del personal**, marcado *"Tarjeta de contingencia"* en el Panel.

Si la tarjeta se pasa un instante antes de que llegue el resultado de la prueba, el sistema la espera hasta 8 segundos, igual que con un DNI.

#### 6.5.4. Salida paso a paso

En la salida no hay equipo facial que diga quién es, por eso el vigilante lo elige:

1. **Personal:** avisa al vigilante.
2. **Vigilante:** en el Panel toca **"Salida sin DNI"** y elige al personal (solo aparecen quienes figuran dentro; se puede buscar).
3. **Panel:** muestra una franja con la cuenta regresiva de **2 minutos** y el botón *"Cancelar"*.
4. **Vigilante:** pasa la tarjeta por el **lector de salida**.
5. La salida queda **a nombre del personal**, marcada *"Tarjeta de contingencia"* y con el vigilante que lo eligió.

#### 6.5.5. Cuándo la tarjeta no abre

En todos estos casos el molinete no se abre, **suena el aviso de denegado** de esa puerta y el intento queda en la lista de usos con el motivo:

| Caso | Motivo en la lista de usos | Qué hacer |
|---|---|---|
| Se pasó sin que nadie aprobara rostro y alcohol | *Nadie aprobó rostro y alcohol antes de pasar la tarjeta* | El personal hace primero la prueba |
| Dos personas aprobaron a la vez y esperan su DNI | *Varias personas aprobaron rostro y alcohol a la vez* | Esperar a que pase la otra persona y repetir la prueba |
| El personal no pasó el alcohol | *No pasó el alcohol* | Igual que con DNI: no ingresa |
| El orden no es "facial primero" | *La tarjeta solo es válida con el orden "facial primero"* | Solo se usa con ese orden |
| Verificación manual activa (falla del equipo facial) | *Verificación manual activa: el ingreso lo decide el vigilante en el Panel* | La tarjeta no se usa en verificación manual |
| Salida sin elegir al personal (o pasaron los 2 minutos) | *Nadie eligió al personal en el Panel ("Salida sin DNI")* | Tocar "Salida sin DNI" y elegirlo |
| Tarjeta desactivada | *Tarjeta desactivada* | El administrador la activa, si corresponde |
| Tarjeta vencida | *Tarjeta vencida* | El administrador cambia el vencimiento |
| Tarjeta con el código cambiado, o QR que no es del sistema | *Tarjeta no registrada (o con un código cambiado)* | Usar la tarjeta impresa nueva |

Si la tarjeta es aceptada pero el personal **no cumple** (documentos vencidos, dado de baja o antipassback), se deniega igual que con su DNI.

#### 6.5.6. Cuidados

- **Se perdió o se copió** (por ejemplo, alguien leyó el QR con su celular): el administrador usa **"Cambiar código"**. La tarjeta impresa queda **anulada** y debe imprimirse de nuevo.
- **No se va a usar por un tiempo:** **desactivarla**. Queda sin vigencia hasta que se vuelva a activar.
- **Eliminar** solo se puede si nunca se pasó por un lector. La que ya se usó se desactiva, para que su historial siga diciendo con qué tarjeta fue cada ingreso y salida.
- Todo cambio (crear, vencimiento, desactivar, cambiar código, eliminar) queda en la **Auditoría**.

#### 6.5.7. Lo que la tarjeta no cubre

- **Falla del lector de DNI:** la tarjeta se pasa por el mismo lector, así que tampoco se lee. Se usa la contingencia "sin lector" de la sección 6.3.
- **Verificación manual** (falla del equipo facial): la tarjeta no es válida; decide el vigilante en el Panel.
- **Sin internet:** no es válida, igual que el DNI (el sistema no puede saber quién es).

#### 6.5.8. Pendiente

- **Probar** con una tarjeta impresa que el lector de DNI lee el QR.
- **Tarjeta digital** (por decidir y programar): mostrar el QR en el **celular del vigilante** en lugar de imprimirlo. La opción recomendada es un QR que **cambia solo cada 30 segundos**, abierto en el portal con el usuario del vigilante: una captura o una foto deja de servir al rato. Un QR fijo en el celular se podría copiar con una captura y servir para siempre. Antes hay que probar que el lector lee el QR desde la pantalla de un celular (brillo y reflejo).

---

## 7. Otras fallas

### 7.1. Relé de un molinete

**Decidido (15/10/2026):** se cambia **de inmediato** por el **relé de repuesto**.

**Qué pasa cuando falla:** el sistema valida a la persona y da la orden de abrir, pero el molinete **no se abre**. La franja roja muestra el relé como *"No conectado"*. El ingreso o la salida **queda registrado** en el sistema, porque la validación se hizo.

**Qué se hace:**

1. **Vigilante:** ve el aviso del relé en la franja roja (o que el molinete no abre aunque el Panel dice "Autorizado"). **Informa** a soporte y al administrador.
2. **Soporte:** desconecta el relé malogrado del Controlador (PC) y **conecta el de repuesto** en su lugar.
3. **Soporte:** comprueba en la franja roja que el aviso desaparezca (el sistema reconecta el relé solo) y prueba un paso por el molinete.
4. **Administrador:** gestiona la reparación o la compra de otro repuesto.

**Requisito del repuesto:** cada relé tiene grabada una **serie** que el Controlador (PC) usa para saber cuál es cuál (ingreso `ING01`, salida `SAL01` y, si hay, avisos `DEN01` y `DSA01`). Un relé nuevo viene de fábrica con otra serie, así que **el repuesto debe dejarse preparado por soporte** con la serie que va a reemplazar (`deploy/controlador/README.md`, paso 6). Con un solo repuesto, soporte le graba la serie del molinete que falle, o se tienen dos repuestos ya preparados (uno para ingreso y uno para salida). **Probar el cambio una vez** antes de necesitarlo.

**Relés de aviso** (luz o sirena): si fallan, el sistema sigue funcionando normal; solo se pierde la señal de "denegado". Se cambian igual que los de los molinetes, sin urgencia.

### 7.2. Controlador (PC)

**Decidido (15/10/2026):** se cambia por la **PC de repuesto**; si no la hay a mano, se **libera el molinete a mano**.

**Qué pasa cuando falla:** sin el Controlador (PC) no funcionan los **lectores de DNI** ni los **relés**: nadie pasa por el sistema, ni para ingresar ni para salir. La franja roja muestra *"Controlador desconectado"*. El equipo facial sigue conectado al servidor, pero sin DNI nadie llega a usarlo.

El **vigilante informa** a soporte y al administrador. Luego:

**Opción 1 (recomendada): PC de repuesto** (la hace soporte)

1. Desconectar de la PC malograda los lectores de DNI y los relés, y conectarlos a la PC de repuesto, en los mismos puertos.
2. Encender la PC de repuesto: se conecta sola al servidor y descarga la lista del personal.
3. Comprobar en la franja roja que desaparezca *"Controlador desconectado"* y que lectores y relés figuren conectados.
4. Probar un ingreso y una salida.

Requisitos: la PC de repuesto debe estar **instalada y configurada por soporte con anticipación** (mismo programa y misma configuración que la principal: dirección del servidor, clave de equipos, lectores y relés) y **probada una vez**. Conviene revisarla cada cierto tiempo, para que esté actualizada.

**Opción 2 (si no hay PC de repuesto): liberar el molinete a mano**

- **Soporte** libera el molinete a mano.
- El vigilante controla el paso. Mientras tanto **el sistema no registra los ingresos ni las salidas** y no revisa los documentos, así que el vigilante debe **anotar** a cada persona (nombre, DNI, hora y, en el ingreso, el resultado de la prueba de alcohol con el alcoholímetro de repuesto).
- Es el **último recurso**, hasta que la PC funcione o llegue el repuesto.

### 7.3. Servidor en la nube

| Situación | Qué pasa |
|---|---|
| **El servidor se reinicia** | Todo arranca solo: base de datos, sistema, portal y respaldos. Comprobado el 15/10/2026: el portal volvió en ~24 segundos, con los mismos datos y la misma dirección IP. El Controlador (PC) y el equipo facial se reconectan solos |
| **Pérdida o daño de los datos** | Respaldo diario a las 04:00 (base de datos, documentos y fotos), guardado 30 días. La restauración se probó el 15/10/2026 en el propio servidor: datos completos e iguales al sistema |
| **El servidor no responde** | Igual que un corte de internet (sección 5.1): nadie ingresa, las salidas siguen con la lista guardada. Soporte revisa el servidor |

Pendientes de la instalación (no de contingencia): copia de los respaldos fuera del servidor y confirmar con TMAM que la IP del servidor de Azure (`74.163.89.6`) sea fija (IP pública estática).

---

## 8. Decisiones del cliente

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | ¿Qué se hace si falla el **alcoholímetro**? | Se reemplaza por el **repuesto** conectado al equipo facial, sin contingencia (15/10/2026) |
| 2 | ¿Qué se hace si falla el **equipo facial**? | **Verificación manual**, prueba de alcohol a todos (15/10/2026) |
| 3 | ¿Quién activa la verificación manual? ¿Quién aprueba cada ingreso? | La activan y desactivan **el vigilante y el administrador**; cada ingreso lo aprueba el vigilante de turno (15/10/2026) |
| 4 | ¿Habrá un **alcoholímetro de repuesto**? | **Sí**, DT1700 u otro compatible con el equipo facial (15/10/2026) |
| 5 | ¿Tiempo máximo para la verificación manual? | **No** (15/10/2026) |
| 6 | ¿Aviso por "varias personas seguidas sin completar la prueba"? | **No**: la persona avisa al vigilante en ese momento. En su lugar, un aviso en el Panel con la primera persona que no completa (15/10/2026) |
| 7 | ¿Qué se hace ante un **corte de internet**? | **A cargo de TMAM**: segunda conexión con los requisitos de la sección 5.2. Si fallan las dos, nadie ingresa y las salidas siguen (15/10/2026) |
| 8 | ¿Qué se hace si falla el **lector de DNI**? | Contingencia **"sin lector"**, que se activa sola y avisa: ingreso solo con rostro y alcohol; la salida la abre el vigilante desde **"Presentes ahora"**. Se conecta el **lector de repuesto** (21/10/2026; reemplaza lo decidido el 15/10/2026) |
| 9 | ¿Qué se hace si falla el **relé de un molinete**? | Se cambia de inmediato por el **repuesto** (15/10/2026) |
| 10 | ¿Qué se hace si falla el **Controlador (PC)**? | **PC de repuesto**; si no la hay, liberar el molinete a mano y anotar los pasos (15/10/2026) |
| 11 | ¿El **adaptador del lector de repuesto** lo registra soporte en el momento (A) o queda registrado desde antes (B)? | **Pendiente** (se recomienda B; sección 6.4). No haría falta si se programa la vista opcional de la sección 10 |
| 12 | ¿Qué se hace si el personal **olvidó su DNI** o el lector **no lo lee**? | **Tarjeta de contingencia** (QR) que el vigilante pasa en lugar del DNI, después de rostro y alcohol; en la salida, el vigilante elige al personal en el Panel. La imprime el administrador; puede vencer o no (20/10/2026) |

---

## 9. Lo que falta

**Comprar o preparar (TMAM y soporte):**

| Qué | Para qué | Responsable |
|---|---|---|
| Alcoholímetro de repuesto **DT1700** (o compatible) | Secciones 3 y 4 | TMAM compra; soporte prueba el cambio una vez |
| Relé de repuesto, **con la serie grabada** | Sección 7.1 | TMAM compra; soporte lo prepara |
| Controlador (PC) de repuesto, **instalado y configurado** | Sección 7.2 | TMAM compra; soporte la prepara |
| Segunda conexión de internet, router con doble salida, UPS e IP fija | Sección 5.2 | TMAM |
| Lector de DNI de repuesto **con su adaptador USB**, el lector ya configurado | Sección 6.4 | TMAM compra; soporte lo configura (y, con la opción B, registra el adaptador) |

**Programar (soporte):**

| Qué | Sección |
|---|---|
| ~~Verificación manual~~ Hecho el 15/10/2026 (falta subirlo a la nube y probarlo en el punto de acceso) | 4 |
| ~~Aviso en el Panel junto a "no completó rostro y alcohol"~~ Hecho el 15/10/2026 (falta subirlo al servidor) | 3.2 |
| ~~Contingencia "sin lector": ingreso solo con rostro y salida desde "Presentes ahora"~~ Hecho el 21/10/2026 | 6.3 |
| Adaptador de repuesto registrado desde antes (si se elige la opción B) | 6.4 |
| *Pendiente:* tarjeta de contingencia digital, con QR que cambia cada 30 segundos en el celular del vigilante | 6.5.8 |
| *Opcional:* vista "Configuración de equipos" en el portal, para que soporte asigne lectores y relés de repuesto sin entrar al Controlador (PC) | 10 |

**Probar en el punto de acceso:**

| Qué | Sección |
|---|---|
| Cambiar el alcoholímetro por el repuesto | 3.4 |
| Verificación manual con el equipo facial apagado (una vez programada) | 4.4 |
| Cambiar un relé por el repuesto | 7.1 |
| Cambiar el Controlador (PC) por la PC de repuesto | 7.2 |
| Cambiar un lector de DNI por el repuesto | 6.4 |
| Contingencia "sin lector": desconectar un lector y comprobar el ingreso por rostro, la salida desde "Presentes ahora" y que vuelva solo al conectarlo | 6.3 |
| Pasar una tarjeta de contingencia impresa por los lectores de ingreso y salida (y, para la tarjeta digital, desde la pantalla de un celular) | 6.5 |

---

## 10. Desarrollo opcional: configuración de equipos desde el portal

> **Pendiente, opcional** (15/10/2026). No es necesario para las contingencias de este documento: sin esta vista, soporte hace la configuración directamente en el Controlador (PC), como hoy. Se programa solo si el cliente lo pide.

### 10.1. Para qué sirve

Hoy, cuando soporte cambia un **lector de DNI** (su adaptador USB) o un **relé** por un repuesto, tiene que entrar al Controlador (PC), editar su configuración y reiniciar el programa; y el relé de repuesto debe tener grabada la serie correcta antes de conectarlo (secciones 6.4 y 7.1). Con esta vista, soporte haría esa configuración **desde el portal**, sin entrar al Controlador (PC).

### 10.2. Cómo sería

Una pantalla **"Configuración de equipos"**, solo para soporte (y el administrador, si el cliente lo decide; **nunca el vigilante**). Muestra los equipos que el Controlador (PC) tiene conectados en ese momento:

| Lectores de DNI detectados | Uso | Estado |
|---|---|---|
| Adaptador `FQCLb114J19` | Lector de ingreso | Conectado |
| Adaptador `A_BCb14C705` | Lector de salida | Conectado |
| Adaptador `ZX91Kd02P44` (nuevo) | *Sin asignar* → elegir "Lector de ingreso" o "Lector de salida" | Conectado |

| Relés detectados | Uso | Estado |
|---|---|---|
| `ING01` | Molinete de ingreso | Conectado |
| `SAL01` | Molinete de salida | Conectado |
| `S2OD2` (nuevo, serie de fábrica) | *Sin asignar* → elegir el uso; el sistema le graba la serie | Conectado |

| Acción | Qué hace |
|---|---|
| **Asignar un lector** | Soporte conecta el adaptador de repuesto, aparece como "nuevo" y elige si es de ingreso o de salida. El Controlador (PC) lo empieza a usar al instante |
| **Asignar un relé** | Soporte conecta el relé de repuesto, aparece con la serie de fábrica y elige su uso (molinete de ingreso, de salida o aviso). El sistema le **graba la serie** y lo empieza a usar |
| **Probar un relé** | Un botón que lo activa un segundo, para comprobar que abre el molinete correcto |

Cada cambio queda en la **auditoría**: quién, cuándo, qué equipo y para qué uso.

### 10.3. Qué cambiaría

| | Hoy | Con la vista |
|---|---|---|
| Dónde configura soporte | Entrando al Controlador (PC) | **Desde el portal** |
| Preparar el repuesto antes (grabar la serie del relé, registrar el adaptador) | Necesario | **No hace falta**: se asigna al conectarlo |
| Registro de los cambios | No | **Sí**, en la auditoría |
| Decisión 11 (adaptador de repuesto, opción A o B) | Pendiente | Ya no haría falta |

### 10.4. A tener en cuenta

- **Necesita internet:** la vista habla con el Controlador (PC) a través del servidor. Sin internet no se puede configurar, aunque los equipos ya configurados siguen funcionando.
- **Relés nuevos de uno en uno:** todos los relés nuevos traen de fábrica la misma serie; si se conectan dos a la vez, el sistema no puede distinguirlos.
- **La configuración se guarda en el Controlador (PC)** y se respeta aunque se reinicie. La configuración inicial de la instalación sigue sirviendo como base.
- **Solo soporte (o el administrador):** una asignación equivocada, por ejemplo cruzar ingreso con salida, cambiaría cómo funciona el punto de acceso.

---

## Anexo A. Alternativas evaluadas y no elegidas

Se dejan como referencia, por si el cliente las necesita más adelante. **No se programan** salvo que el cliente lo pida.

### A.1. Modos que bajan controles

| Modo | Cuándo | Cómo se ingresa | Qué se pierde |
|---|---|---|---|
| **Sin alcoholímetro** | Falla el alcoholímetro y no hay repuesto | DNI + rostro | La prueba de alcohol. Además, hay que desactivar la prueba de alcohol en el menú del equipo facial (Configuración avanzada → proceso de prueba de alcohol); el sistema no puede cambiarlo a distancia |
| **Solo DNI** | Falla el equipo facial | DNI con documentos en regla | Rostro y prueba de alcohol; alguien podría usar un DNI ajeno |

No hacen falta: con el alcoholímetro de repuesto y la verificación manual se mantienen todos los controles.

### A.2. Ingresar sin internet

Hoy no se puede ingresar sin internet por dos motivos: (1) los **documentos y las bajas** están en el servidor; (2) el **equipo facial** está conectado al servidor, que es quien recibe el resultado y decide. Alternativas evaluadas:

| Alternativa | Cómo funciona | Por qué no se eligió |
|---|---|---|
| Solo DNI | Ingresa quien esté en regla según una lista guardada en el Controlador (PC) | Sin rostro ni alcohol |
| Verificación manual | Como la sección 4, con una lista guardada en el Controlador (PC) | Más lenta; con la segunda conexión de internet (sección 5.2) los cortes deberían ser raros |
| Controlador (PC) como respaldo completo | El Controlador (PC) tendría una copia de todo el sistema | Muy compleja: dos sistemas que mantener sincronizados |
| **E. Ingreso como la salida** | El Controlador (PC) guarda la lista de quién puede ingresar (con las fechas de vencimiento) y el equipo facial se conecta a ella. Con internet, le pasa todo al servidor; sin internet, la PC habilita a la persona en el equipo, este hace rostro y alcohol como siempre y la PC abre el molinete. Al volver internet, envía los ingresos | **Mejora futura.** Mantiene rostro y alcohol sin internet y cubre también una caída del servidor; solo se perderían las bajas hechas durante el corte. Requiere programación considerable y pruebas con el equipo real |

---

## Anexo B. Pruebas realizadas

### B.1. Alcoholímetro desconectado (07/10/2026)

Con una persona habilitada en el equipo facial y el sistema registrando todo lo que el equipo envía:

| Paso | Resultado |
|---|---|
| Verificaciones con el alcoholímetro conectado | Aprobadas: el equipo informa "apto" |
| Desconectar el alcoholímetro | El equipo **no envía nada** al sistema; solo muestra un ícono con punto rojo en su pantalla |
| Verificación sin el alcoholímetro | Reconoce el rostro, muestra *"Verificación de identidad completada. Realice una medición de alcohol."* y **queda esperando**: no aprueba ni informa nada |
| Volver a conectar el alcoholímetro | El equipo **no envía nada** al sistema |

**Conclusión:** sin alcoholímetro **nadie ingresa sin prueba de alcohol**; el problema es solo operativo (nadie puede ingresar).

### B.2. Alcoholímetro conectado al Controlador (PC) (07/10/2026)

| Prueba | Resultado |
|---|---|
| ¿La PC lo reconoce? | Sí, como puerto serie USB |
| ¿Mide sin el equipo facial? | **Sí.** Funciona solo: botón "Test", sopla, muestra el resultado en su pantalla y guarda las pruebas ("Data") |
| ¿Envía el resultado a la PC? | **No.** Nada en reposo ni al hacer una prueba (escuchado a 4 800 – 115 200 baudios) |

- El alcoholímetro solo entrega el resultado cuando el equipo facial se lo pide, con una orden no documentada. Para usarlo desde la PC habría que pedir el protocolo a ZKTeco o al proveedor; probar órdenes al azar podría descalibrarlo.
- En operación normal debe ir **conectado al equipo facial**.
- **Funciona como alcoholímetro portátil** (pantalla y batería propias): por eso el repuesto DT1700 sirve tanto para cambiarlo en el equipo facial como para la verificación manual.
- **Escala de fábrica:** apto ("Pass") por debajo de **0,090 mg/L**; "Drink" de 0,090 a 0,363 mg/L; "Drunk" sobre 0,363 mg/L. Es una referencia para el umbral del equipo facial, que fija el cliente.

### B.3. Servidor en la nube (15/10/2026)

| Prueba | Resultado |
|---|---|
| Restaurar el respaldo diario en una base de prueba aparte, en el propio servidor | Sin errores; personal, ingresos y salidas, documentos, empresas, usuarios y auditoría iguales al sistema; todos los archivos presentes |
| Reiniciar el servidor | Todo arrancó solo; el portal respondió a los ~24 segundos, con los mismos datos y la misma IP |
