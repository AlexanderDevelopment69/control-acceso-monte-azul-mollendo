# Contingencias ante fallas de los equipos del punto de acceso

Sistema de Control de Accesos — Terminal Monte Azul Mollendo (TMAM)

Este documento describe **qué hacer cuando falla un equipo del punto de acceso**: cómo se detecta, quién hace cada cosa (vigilante, soporte y administrador), qué hace el sistema y cómo se vuelve a la normalidad. Cubre el alcoholímetro, el equipo de reconocimiento facial, el corte de internet, el lector de DNI, los relés de los molinetes, la PC de control y el servidor en la nube.

Actualizado al 15/10/2026, con las decisiones del cliente de esa fecha. **Lo que dice "por programar" todavía no existe en el sistema.**

---

## Resumen

| Si falla… | Qué se hace | Quién | ¿Se pierde algún control? | Estado |
|---|---|---|---|---|
| **Alcoholímetro** | Se conecta el **alcoholímetro de repuesto** al equipo facial y se sigue normal (sección 3) | El vigilante informa; soporte lo cambia | No | Decidido. Falta comprar el repuesto |
| **Equipo facial** (y con él el alcoholímetro) | **Verificación manual**: DNI + el vigilante compara la foto + prueba de alcohol a todos con el repuesto (sección 4) | Vigilante o administrador la activan; el vigilante aprueba cada ingreso | No | **Programado** (15/10/2026); falta la prueba en el punto de acceso |
| **Internet** del punto de acceso | **Segunda conexión de otro proveedor** que entra sola (sección 5) | TMAM | No | Decidido, a cargo de TMAM |
| **Lector de DNI** | Mientras tanto, dos opciones: **solo el equipo facial** identifica a la persona (ingreso) o **el vigilante escribe el DNI** en el Panel (ingreso y salida); se conecta el **lector de repuesto** (sección 6) | El vigilante informa y, mientras tanto, opera con la opción elegida; soporte cambia el lector | No | Decidido. Por programar; la opción del equipo facial requiere una prueba; falta el repuesto |
| **Relé de un molinete** | Se cambia por el **relé de repuesto** (sección 7.1) | El vigilante informa; soporte lo cambia | No | Decidido. Falta el repuesto preparado |
| **PC de control** | Se cambia por la **PC de repuesto**; si no la hay, se libera el molinete a mano (sección 7.2) | El vigilante informa; soporte la cambia | Con la PC de repuesto, no | Decidido. Falta la PC de repuesto preparada |
| **Servidor en la nube** | Se recupera solo al reiniciarse; respaldos diarios probados (sección 7.3) | Soporte | No | Funciona hoy |

**Regla general:** en todos los casos el sistema **sigue exigiendo el DNI con documentos vigentes**, y quien no cumple se deniega igual que siempre. Ninguna contingencia decidida deja entrar a alguien sin prueba de alcohol.

**Quién hace qué:**

| Rol | Qué hace ante una falla |
|---|---|
| **Vigilante** | **Informa** la falla a soporte y al administrador. No cambia ni configura equipos. Sigue operando el punto de acceso con lo que el sistema le muestre (por ejemplo, la verificación manual de la sección 4 o el DNI escrito de la sección 6.3) |
| **Administrador** | Gestiona la reparación o la compra de repuestos; puede activar y desactivar la verificación manual |
| **Soporte** | **Cambia los equipos** por sus repuestos y hace la **configuración** que haga falta en la PC de control |

---

## 1. Cómo funciona el punto de acceso normalmente

**Ingreso:**

1. La persona pasa su **DNI** por el lector de ingreso.
2. El sistema revisa que esté **registrada, activa y con sus documentos vigentes**. Si no cumple, se deniega en ese momento.
3. Si cumple, el sistema la **habilita** en el **equipo de reconocimiento facial** (G4 Pro). Las personas están cargadas en el equipo, pero bloqueadas: solo se habilita a quien acaba de pasar su DNI.
4. La persona mira al equipo, que le **reconoce el rostro** y le toma la **prueba de alcohol** con el alcoholímetro (DT1700) conectado a él.
5. El equipo informa el resultado: **apto** o **alcohol**. Si en 1 minuto no llega resultado, el sistema deniega por "No completó rostro y alcohol".
6. Si es apto, el sistema **abre el molinete de ingreso** con su relé.

**Salida:** la persona pasa su DNI por el lector de salida y, si está registrada, se abre el molinete de salida. No usa el equipo facial ni el alcoholímetro.

**Equipos que intervienen:**

| Equipo | Dónde está conectado | Para qué |
|---|---|---|
| Lectores de DNI (ingreso y salida) | PC de control (USB) | Saber quién quiere pasar |
| Equipo facial (G4 Pro) | Servidor en la nube, por internet | Rostro y prueba de alcohol |
| Alcoholímetro (DT1700) | Equipo facial | Prueba de alcohol |
| Relés de los molinetes (ingreso y salida) | PC de control (USB) | Abrir los molinetes |
| Relés de aviso (si están instalados) | PC de control (USB) | Luz o sirena cuando se deniega un paso |
| PC de control | Servidor en la nube, por internet | Lee los DNI y abre los molinetes cuando el servidor lo ordena |
| Servidor en la nube | — | Decide cada ingreso y salida; guarda el personal, los documentos y el historial |

---

## 2. Cómo se entera el vigilante de una falla

| Señal | Dónde | Qué fallas muestra | Estado |
|---|---|---|---|
| **Franja roja de fallas** | Arriba de todas las pantallas del portal, para el administrador y el vigilante | Equipo facial desconectado (2 minutos sin contacto), lector de DNI con el cable desconectado, relé no conectado, PC de control desconectada, respaldos atrasados, sin conexión con el servidor | Ya existe |
| **"Sistema y APIs"** | Portal del administrador | El estado de cada equipo, en detalle | Ya existe |
| **Panel de vigilancia** | Portal del vigilante | Cada ingreso: "esperando rostro y alcohol" con su cuenta regresiva, y el resultado | Ya existe |
| **Pantalla del equipo facial** | En el punto de acceso | Un ícono con **punto rojo** si el alcoholímetro está desconectado (el equipo **no** se lo avisa al sistema) | Ya existe |
| **La propia persona** | En el molinete | Avisa al vigilante si no puede pasar | — |

---

## 3. Falla del alcoholímetro

**Decidido (15/10/2026):** se reemplaza por el **alcoholímetro de repuesto** y el ingreso sigue normal. **No hace falta activar ninguna contingencia.**

### 3.1. Qué pasa cuando falla

- **Salidas:** normales.
- **Ingresos:** nadie puede ingresar, pero **nadie entra sin prueba de alcohol** (comprobado el 07/10/2026, anexo B). El equipo facial reconoce el rostro, muestra *"Verificación de identidad completada. Realice una medición de alcohol."* y se queda esperando. Al minuto, el sistema deniega por "No completó rostro y alcohol" y el molinete **no se abre**.
- **El equipo facial no le avisa al sistema** que el alcoholímetro se desconectó: solo muestra el punto rojo en su pantalla.

### 3.2. Cómo se detecta

La persona que no puede soplar **no se va**: le avisa al vigilante en ese momento. El vigilante se entera **con la primera persona**.

| Señal | Estado |
|---|---|
| La persona dice *"miré al equipo pero no me deja soplar"* | — |
| El Panel muestra "esperando rostro y alcohol" y, al minuto, "Denegado: no completó rostro y alcohol" | Ya existe |
| **Aviso en el Panel**: en el momento en que alguien no completa, aparece arriba del Panel un aviso ámbar con su nombre y la hora: *"Si dice que no pudo soplar: revise si el equipo facial muestra un punto rojo (alcoholímetro desconectado) y avise a soporte."* Se cierra con la ✕ o desaparece solo cuando la siguiente persona ingresa bien; se mantiene al recargar la página. La etiqueta "No completó rostro y alcohol" de la tabla lleva una ⓘ con la misma explicación | Programado (15/10/2026); falta subirlo al servidor |
| Punto rojo en la pantalla del equipo facial | Ya existe |

### 3.3. Qué se hace

1. **Vigilante:** mira la pantalla del equipo facial; si tiene el **punto rojo**, es el alcoholímetro. **Informa** a soporte y al administrador.
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
- **Ingresos:** nadie puede ingresar. La persona pasa su DNI, el sistema la habilita en el equipo, pero el equipo no responde; al minuto queda denegada por "No completó rostro y alcohol". No hay riesgo de ingresos sin control: el molinete no se abre.
- Como el alcoholímetro está conectado al equipo facial, **también se pierde la prueba de alcohol**.
- El sistema lo detecta a los **2 minutos** sin contacto y muestra en la franja roja *"Equipo facial (G4 Pro) desconectado"*.

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

La PC de control y el equipo facial trabajan con el servidor en la nube, por internet.

| Situación | Qué pasa |
|---|---|
| Alguien quiere **ingresar** | **No ingresa nadie.** Se activa el aviso de ingreso denegado |
| Alguien **registrado** quiere **salir** | **Sale.** La PC de control guarda la lista del personal (se renueva cada 10 minutos) y abre el molinete |
| Alguien **no registrado** quiere salir | No sale. Se activa el aviso de salida denegada |
| **Vuelve internet** | La PC de control se reconecta sola y envía al servidor las salidas que registró, con su hora real |

En resumen: sin internet **nadie entra, pero nadie queda encerrado**. No se puede ingresar porque el equipo facial y la revisión de documentos dependen del servidor (anexo A).

**Cómo se nota:** la franja roja muestra *"Controlador desconectado"* (la PC de control) y *"Equipo facial desconectado"*.

### 5.2. Lo que debe tener el punto de acceso (a cargo de TMAM)

| # | Requisito | Para qué |
|---|---|---|
| 1 | **Conexión principal estable** (por ejemplo, fibra óptica) | Uso normal |
| 2 | **Segunda conexión de internet de alta velocidad, de otro proveedor** | Si cae la principal, sigue funcionando. De **otra empresa**, para que no fallen las dos a la vez |
| 3 | **Router con doble salida y cambio automático** (*dual WAN / failover*) | Que pase a la segunda conexión **solo**, en segundos, y vuelva a la principal cuando regrese |
| 4 | **Equipo de respaldo de energía (UPS)** para el router, la PC de control, el equipo facial y el switch de red | Que un corte de luz breve no corte también el internet ni los equipos |
| 5 | **IP pública fija** en la conexión principal (y, si es posible, en la segunda) | Permite que el servidor solo acepte al equipo facial desdel punto de acceso (`docs/seguridad/Seguridad.md`, sección 4.2). Con dos conexiones, se autorizan las dos IP |
| 6 | **No cambiar la configuración de red** de la PC de control ni del equipo facial sin avisar a soporte | Ambos tienen configurada la dirección del servidor |

**Uso de internet del sistema:** bajo. Viajan los datos de cada ingreso y salida y, al registrar o actualizar personal, sus fotos. Cualquier conexión de alta velocidad es suficiente, también la segunda.

**Si fallan las dos conexiones:** se mantiene lo de la sección 5.1 (nadie ingresa, las salidas siguen) hasta que vuelva alguna. La alternativa E del anexo A (ingresar sin internet con rostro y alcohol) queda como **mejora futura**, si TMAM la requiere.

---

## 6. Falla del lector de DNI

**Decidido (15/10/2026):** mientras se cambia el lector hay **dos opciones** para seguir operando (sección 6.3): **usar solo el equipo facial** para identificar a la persona en el ingreso, o que **el vigilante escriba el DNI** en el Panel. Luego se conecta el **lector de repuesto** (sección 6.4). Por programar.

### 6.1. Qué pasa cuando falla

- **Ingreso:** nadie puede ingresar. Sin el DNI, el sistema no sabe quién es la persona y no la habilita en el equipo facial.
- **Salida:** nadie sale por el molinete.
- La franja roja muestra *"Lector de DNI de ingreso (o de salida): cable desconectado"*. El sistema intenta reconectarlo cada 5 segundos y se recupera solo cuando el lector vuelve a funcionar.

### 6.2. Cómo está conectado un lector

Cada lector tiene **dos partes**:

| Parte | Qué es | Qué reconoce el sistema |
|---|---|---|
| **Lector** (Syble XB-7705H) | Lee el código de barras del reverso del DNI | Nada: el sistema no distingue un lector de otro |
| **Adaptador USB** (cable blanco) | Une el lector con la PC de control | **Su número de serie**, que trae de fábrica. La PC de control tiene configurado cuál es el de ingreso y cuál el de salida |

Por eso, lo que haya que hacer al cambiarlo depende de qué parte se malogró (sección 6.4).

### 6.3. Mientras tanto: dos opciones

| | **Opción 1: solo el equipo facial** | **Opción 2: el vigilante escribe el DNI** |
|---|---|---|
| Para qué paso | **Ingreso** (la salida no tiene equipo facial) | **Ingreso y salida** |
| Quién identifica a la persona | El **equipo facial**, por su rostro | El **vigilante**, que escribe el número del DNI en el Panel |
| ¿Hace algo el vigilante? | No: se activa **solo** cuando el lector de ingreso se desconecta | Sí: escribe cada DNI |
| ¿La persona mira el equipo una sola vez? | Sí (se queda unos segundos frente a él) | Sí, como siempre |
| Documentos, rostro, alcohol y quién entró | Se mantienen | Se mantienen |
| Estado | Por programar. **Requiere antes una prueba con el equipo real** (abajo) | Por programar. Funciona seguro: es el mismo proceso de siempre |

**Cómo se usan juntas:** si la prueba con el equipo facial sale bien, el **ingreso** usa la opción 1 (automática) y la **salida** la opción 2. Si la prueba no sale bien, se usa la opción 2 para los dos. La opción 2 queda siempre disponible, también como respaldo de la opción 1.

#### Opción 1: solo el equipo facial (ingreso)

**Por qué no basta con "habilitar a todos" en el equipo:** cuando el equipo facial aprueba a alguien (rostro y alcohol conformes), **no informa quién fue**: el sistema lo sabe porque solo había una persona habilitada. Si se habilitara a todos los que están en regla, el sistema **no sabría quién entró**. El único momento en que el equipo informa quién es la persona es cuando **la rechaza** por estar bloqueada: en ese caso envía su DNI. La opción 1 usa justamente eso.

**Cómo funciona:**

1. El lector de ingreso se desconecta: el sistema pasa **solo** a "identificación por rostro" y el Panel muestra la franja *"Lector de DNI de ingreso sin conexión: identificación por rostro"*.
2. La persona se para frente al equipo facial **y se queda ahí**.
3. El equipo la reconoce y, como está bloqueada, la rechaza e **informa su DNI** al sistema.
4. El sistema revisa sus documentos, como si hubiera pasado el DNI. Si no cumple, se deniega igual que siempre.
5. Si cumple, la habilita en el equipo (~2 segundos).
6. El equipo **la vuelve a reconocer solo**, porque sigue frente a él, y le pide soplar.
7. Si es apta, se abre el molinete. En el historial queda marcado como **"identificado por rostro"**.
8. Cuando el lector vuelve a conectarse, el sistema regresa **solo** al modo normal: como esta opción no baja ningún control, no hace falta que nadie lo active ni lo desactive.

**Prueba pendiente con el equipo real** (no requiere programar): con el equipo conectado al servidor, una persona registrada se para frente al equipo **sin pasar el DNI** y se queda ahí. Comprobar:

1. Que el equipo informe su DNI al rechazarla, y cuánto tarda.
2. Si, una vez habilitada, el equipo **la vuelve a reconocer solo** sin que se mueva, y qué muestra en su pantalla durante esos segundos.

Si el equipo no la vuelve a reconocer sola, la persona tendría que mirar dos veces, y esta opción no se usa.

#### Opción 2: el vigilante escribe el DNI (ingreso y salida)

El Panel de vigilancia tendrá un campo **"Ingresar DNI manualmente"**, uno para el ingreso y otro para la salida. Hace exactamente lo mismo que el lector; solo cambia de dónde sale el número.

- **Ingreso:** la persona le muestra su DNI al vigilante, que escribe el número en el campo de **ingreso**. Desde ahí todo sigue igual que siempre (sección 1): documentos, equipo facial (rostro y alcohol) y molinete.
- **Salida:** el vigilante escribe el número en el campo de **salida** y, si la persona está registrada, se abre el molinete de salida.

Cada paso queda en el historial marcado como **"DNI escrito por el vigilante"**, con el nombre del vigilante. El campo se puede usar en cualquier momento, no solo cuando falla el lector: por ejemplo, si un DNI está gastado y el lector no lo lee.

### 6.4. Cambio por el repuesto

| Qué se malogró | ¿Basta con conectar el repuesto? | Qué hay que hacer |
|---|---|---|
| **El lector** (el adaptador está bien) | **Sí**, si el lector de repuesto ya está configurado | Conectar el lector de repuesto **al mismo adaptador**. El lector nuevo se configura **una sola vez, con anticipación**, con su folleto (Factory Default → RS232 → 115200) |
| **El adaptador** (cable blanco) | Depende de la opción elegida (abajo) | El adaptador nuevo tiene otro número de serie |
| **Los dos** | Igual que el adaptador | Las dos cosas |

**Para el adaptador hay dos opciones** (decisión 11 de la sección 8, pendiente):

| Opción | Cómo | Ventaja | Desventaja |
|---|---|---|---|
| **A. Soporte lo registra al cambiarlo** | Soporte conecta el repuesto y registra el adaptador nuevo en la PC de control | No requiere programar nada | Un paso más para soporte en el momento del cambio |
| **B. Adaptador de repuesto registrado desde antes** (recomendada) | La PC de control acepta, para cada lector, **también** el adaptador de repuesto | Soporte **lo conecta y funciona solo** | Requiere un cambio pequeño de programación |

**Qué se hace:**

1. **Vigilante:** ve la franja roja *"Lector de DNI: cable desconectado"*, o nota que el lector no lee. **Informa** a soporte y al administrador.
2. **Mientras tanto** se sigue operando con las opciones de la sección 6.3: en el ingreso, el equipo facial identifica a la persona (si la opción 1 está disponible) o el vigilante escribe el DNI; en la salida, el vigilante escribe el DNI.
3. **Soporte:** conecta el repuesto (lector y, si hace falta, su adaptador). Con la opción B funciona solo; con la A, registra el adaptador nuevo.
4. **Soporte:** comprueba que el aviso desaparezca y que el lector lea un DNI.
5. **Administrador:** gestiona la reparación o la compra de otro repuesto.

**Requisitos del repuesto:** un **lector del mismo modelo, ya configurado**, y su **adaptador USB**. Conviene **etiquetar** los adaptadores ("INGRESO", "SALIDA", "REPUESTO") y **probar el cambio una vez** antes de necesitarlo.

---

### 6.5. Trabajador sin DNI, o DNI que el lector no lee: tarjeta de contingencia

Hecho el 20/10/2026. El administrador crea e imprime en el portal (**Tarjetas de contingencia**) una tarjeta con un QR y se la entrega al vigilante. La tarjeta **sola no abre**: reemplaza al DNI del trabajador en ese momento.

- **Ingreso** (orden "facial primero"): el trabajador avisa al vigilante, hace rostro y alcohol y, cuando el Panel muestra *"Aprobó … pase su DNI"*, el vigilante pasa la tarjeta por el lector de ingreso en esos 15 segundos. Entra el trabajador que aprobó, con sus documentos revisados como siempre. Si hay dos personas esperando su DNI a la vez, no abre.
- **Salida:** el vigilante toca **"Salida sin DNI"** en el Panel, elige al trabajador (solo aparecen quienes figuran dentro) y tiene 2 minutos para pasar la tarjeta por el lector de salida.
- El ingreso o la salida queda **a nombre del trabajador**, marcado *"Tarjeta de contingencia"* (en la salida, con el vigilante que lo eligió). Cada uso, aceptado o no, queda en la lista de usos de la tarjeta; la tarjeta pasada en otro momento no abre y suena el aviso.
- El administrador puede ponerle fecha de vencimiento o dejarla sin vencer, desactivarla y **cambiar su código** si se pierde o alguien le toma una foto (la impresa deja de servir). El vigilante solo ve las tarjetas.
- Sin internet no sirve (el sistema no sabe quién es). Con la verificación manual activa tampoco: decide el vigilante en el Panel.

## 7. Otras fallas

### 7.1. Relé de un molinete

**Decidido (15/10/2026):** se cambia **de inmediato** por el **relé de repuesto**.

**Qué pasa cuando falla:** el sistema valida a la persona y da la orden de abrir, pero el molinete **no se abre**. La franja roja muestra el relé como *"No conectado"*. El ingreso o la salida **queda registrado** en el sistema, porque la validación se hizo.

**Qué se hace:**

1. **Vigilante:** ve el aviso del relé en la franja roja (o que el molinete no abre aunque el Panel dice "Autorizado"). **Informa** a soporte y al administrador.
2. **Soporte:** desconecta el relé malogrado de la PC de control y **conecta el de repuesto** en su lugar.
3. **Soporte:** comprueba en la franja roja que el aviso desaparezca (el sistema reconecta el relé solo) y prueba un paso por el molinete.
4. **Administrador:** gestiona la reparación o la compra de otro repuesto.

**Requisito del repuesto:** cada relé tiene grabada una **serie** que la PC de control usa para saber cuál es cuál (ingreso `ING01`, salida `SAL01` y, si hay, avisos `DEN01` y `DSA01`). Un relé nuevo viene de fábrica con otra serie, así que **el repuesto debe dejarse preparado por soporte** con la serie que va a reemplazar (`deploy/controlador/README.md`, paso 6). Con un solo repuesto, soporte le graba la serie del molinete que falle, o se tienen dos repuestos ya preparados (uno para ingreso y uno para salida). **Probar el cambio una vez** antes de necesitarlo.

**Relés de aviso** (luz o sirena): si fallan, el sistema sigue funcionando normal; solo se pierde la señal de "denegado". Se cambian igual que los de los molinetes, sin urgencia.

### 7.2. PC de control

**Decidido (15/10/2026):** se cambia por la **PC de repuesto**; si no la hay a mano, se **libera el molinete a mano**.

**Qué pasa cuando falla:** sin la PC de control no funcionan los **lectores de DNI** ni los **relés**: nadie pasa por el sistema, ni para ingresar ni para salir. La franja roja muestra *"Controlador desconectado"*. El equipo facial sigue conectado al servidor, pero sin DNI nadie llega a usarlo.

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
| **El servidor se reinicia** | Todo arranca solo: base de datos, sistema, portal y respaldos. Comprobado el 15/10/2026: el portal volvió en ~24 segundos, con los mismos datos y la misma dirección IP. La PC de control y el equipo facial se reconectan solos |
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
| 8 | ¿Qué se hace si falla el **lector de DNI**? | Mientras tanto, **solo el equipo facial** identifica a la persona en el ingreso (si la prueba con el equipo sale bien) o **el vigilante escribe el DNI** (ingreso y salida); se conecta el **lector de repuesto** (15/10/2026) |
| 9 | ¿Qué se hace si falla el **relé de un molinete**? | Se cambia de inmediato por el **repuesto** (15/10/2026) |
| 10 | ¿Qué se hace si falla la **PC de control**? | **PC de repuesto**; si no la hay, liberar el molinete a mano y anotar los pasos (15/10/2026) |
| 11 | ¿El **adaptador del lector de repuesto** lo registra soporte en el momento (A) o queda registrado desde antes (B)? | **Pendiente** (se recomienda B; sección 6.4). No haría falta si se programa la vista opcional de la sección 10 |
| 12 | ¿Qué se hace si el trabajador **olvidó su DNI** o el lector **no lo lee**? | **Tarjeta de contingencia** (QR) que el vigilante pasa en lugar del DNI, después de rostro y alcohol; en la salida, el vigilante elige al trabajador en el Panel. La imprime el administrador; puede vencer o no (20/10/2026) |

---

## 9. Lo que falta

**Comprar o preparar (TMAM y soporte):**

| Qué | Para qué | Responsable |
|---|---|---|
| Alcoholímetro de repuesto **DT1700** (o compatible) | Secciones 3 y 4 | TMAM compra; soporte prueba el cambio una vez |
| Relé de repuesto, **con la serie grabada** | Sección 7.1 | TMAM compra; soporte lo prepara |
| PC de control de repuesto, **instalada y configurada** | Sección 7.2 | TMAM compra; soporte la prepara |
| Segunda conexión de internet, router con doble salida, UPS e IP fija | Sección 5.2 | TMAM |
| Lector de DNI de repuesto **con su adaptador USB**, el lector ya configurado | Sección 6.4 | TMAM compra; soporte lo configura (y, con la opción B, registra el adaptador) |

**Programar (soporte):**

| Qué | Sección |
|---|---|
| ~~Verificación manual~~ Hecho el 15/10/2026 (falta subirlo a la nube y probarlo en el punto de acceso) | 4 |
| ~~Aviso en el Panel junto a "no completó rostro y alcohol"~~ Hecho el 15/10/2026 (falta subirlo al servidor) | 3.2 |
| Identificación por rostro en el ingreso, automática al desconectarse el lector (opción 1; solo si la prueba sale bien) | 6.3 |
| Campo "Ingresar DNI manualmente" en el Panel (ingreso y salida), con la marca en el historial (opción 2) | 6.3 |
| Adaptador de repuesto registrado desde antes (si se elige la opción B) | 6.4 |
| *Opcional:* vista "Configuración de equipos" en el portal, para que soporte asigne lectores y relés de repuesto sin entrar a la PC de control | 10 |

**Probar en el punto de acceso:**

| Qué | Sección |
|---|---|
| Cambiar el alcoholímetro por el repuesto | 3.4 |
| Verificación manual con el equipo facial apagado (una vez programada) | 4.4 |
| Cambiar un relé por el repuesto | 7.1 |
| Cambiar la PC de control por la de repuesto | 7.2 |
| Cambiar un lector de DNI por el repuesto | 6.4 |
| Identificación por rostro con el equipo real (antes de programar la opción 1) | 6.3 |

---

## 10. Desarrollo opcional: configuración de equipos desde el portal

> **Pendiente, opcional** (15/10/2026). No es necesario para las contingencias de este documento: sin esta vista, soporte hace la configuración directamente en la PC de control, como hoy. Se programa solo si el cliente lo pide.

### 10.1. Para qué sirve

Hoy, cuando soporte cambia un **lector de DNI** (su adaptador USB) o un **relé** por un repuesto, tiene que entrar a la PC de control, editar su configuración y reiniciar el programa; y el relé de repuesto debe tener grabada la serie correcta antes de conectarlo (secciones 6.4 y 7.1). Con esta vista, soporte haría esa configuración **desde el portal**, sin entrar a la PC de control.

### 10.2. Cómo sería

Una pantalla **"Configuración de equipos"**, solo para soporte (y el administrador, si el cliente lo decide; **nunca el vigilante**). Muestra los equipos que la PC de control tiene conectados en ese momento:

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
| **Asignar un lector** | Soporte conecta el adaptador de repuesto, aparece como "nuevo" y elige si es de ingreso o de salida. La PC de control lo empieza a usar al instante |
| **Asignar un relé** | Soporte conecta el relé de repuesto, aparece con la serie de fábrica y elige su uso (molinete de ingreso, de salida o aviso). El sistema le **graba la serie** y lo empieza a usar |
| **Probar un relé** | Un botón que lo activa un segundo, para comprobar que abre el molinete correcto |

Cada cambio queda en la **auditoría**: quién, cuándo, qué equipo y para qué uso.

### 10.3. Qué cambiaría

| | Hoy | Con la vista |
|---|---|---|
| Dónde configura soporte | Entrando a la PC de control | **Desde el portal** |
| Preparar el repuesto antes (grabar la serie del relé, registrar el adaptador) | Necesario | **No hace falta**: se asigna al conectarlo |
| Registro de los cambios | No | **Sí**, en la auditoría |
| Decisión 11 (adaptador de repuesto, opción A o B) | Pendiente | Ya no haría falta |

### 10.4. A tener en cuenta

- **Necesita internet:** la vista habla con la PC de control a través del servidor. Sin internet no se puede configurar, aunque los equipos ya configurados siguen funcionando.
- **Relés nuevos de uno en uno:** todos los relés nuevos traen de fábrica la misma serie; si se conectan dos a la vez, el sistema no puede distinguirlos.
- **La configuración se guarda en la PC de control** y se respeta aunque se reinicie. La configuración inicial de la instalación sigue sirviendo como base.
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

Hoy no se puede ingresar sin internet por dos motivos: (1) los **documentos y las bajas** están en el servidor; (2) el **equipo facial** está conectado al servidor, que es quien lo habilita y recibe el resultado. Alternativas evaluadas:

| Alternativa | Cómo funciona | Por qué no se eligió |
|---|---|---|
| Solo DNI | Ingresa quien esté en regla según una lista guardada en la PC de control | Sin rostro ni alcohol |
| Verificación manual | Como la sección 4, con una lista guardada en la PC de control | Más lenta; con la segunda conexión de internet (sección 5.2) los cortes deberían ser raros |
| PC de control como respaldo completo | La PC de control tendría una copia de todo el sistema | Muy compleja: dos sistemas que mantener sincronizados |
| **E. Ingreso como la salida** | La PC de control guarda la lista de quién puede ingresar (con las fechas de vencimiento) y el equipo facial se conecta a ella. Con internet, le pasa todo al servidor; sin internet, la PC habilita a la persona en el equipo, este hace rostro y alcohol como siempre y la PC abre el molinete. Al volver internet, envía los ingresos | **Mejora futura.** Mantiene rostro y alcohol sin internet y cubre también una caída del servidor; solo se perderían las bajas hechas durante el corte. Requiere programación considerable y pruebas con el equipo real |

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

### B.2. Alcoholímetro conectado a la PC de control (07/10/2026)

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
