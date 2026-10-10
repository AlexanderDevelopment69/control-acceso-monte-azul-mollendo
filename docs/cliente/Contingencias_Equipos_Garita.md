# Contingencias ante fallas de los equipos de garita

Sistema de Control de Accesos — Terminal Portuario de Mollendo

Este documento describe qué ocurre cuando falla el **alcoholímetro**, el **equipo de reconocimiento facial** o la **conexión a internet** de la garita, y las alternativas de contingencia para que el terminal siga operando mientras el equipo se repara o se reemplaza. Las alternativas **bajan o reemplazan controles de seguridad**, por lo que su uso debe ser aprobado por el cliente (ver la sección 7).

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

---

## 3. Falla del equipo de reconocimiento facial

### 3.1. Qué ocurre hoy

- **Salidas:** normales.
- **Ingresos:** **nadie puede ingresar.** La persona pasa su DNI, el sistema la habilita en el equipo, pero el equipo no responde; después de 1 minuto queda denegada por "No completó rostro y alcohol".
- Como el alcoholímetro está conectado al equipo facial, **también se pierde la prueba de alcohol**.
- No hay riesgo de ingresos sin control: sin el equipo, el molinete de ingreso no se abre.
- El sistema detecta que el equipo dejó de comunicarse y lo muestra como **"Desconectado"** en "Sistema y APIs". Hoy no se avisa en el Panel de vigilancia.

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

## 5. Cómo se activaría la contingencia (propuesta)

- **Quién:** un **administrador**, desde "Sistema y APIs", elige el modo: **Normal**, **Sin alcoholímetro** o **Solo DNI** (alternativa A), o habilita la **verificación manual** (alternativa B). Debe escribir el **motivo**, por ejemplo "alcoholímetro en reparación".
- **Aviso en la garita:** mientras la contingencia esté activa, el **Panel de vigilancia muestra una franja** con el modo vigente, para que el vigilante sepa qué control no se está haciendo.
- **Registro:**
  - Cada ingreso del periodo queda **marcado** en el historial y en los reportes: "sin prueba de alcohol", "solo DNI" o "verificación manual", con el vigilante y el resultado de la prueba manual cuando corresponda.
  - La activación y la desactivación quedan en la **auditoría**: quién, cuándo y por qué.
- **Fin:** al reparar o reemplazar el equipo, el administrador vuelve a **Normal**. La contingencia **no se activa ni se desactiva sola**, a propósito: si el sistema bajara los controles por su cuenta, una falla podría pasar inadvertida.

---

## 6. Corte de internet (modalidad con servidor en la nube)

Cuando el sistema está en un servidor en la nube y la PC de la garita trabaja como controlador, la garita depende de internet para decidir los ingresos.

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

**Recomendación:**
- **Principal: D (internet de respaldo).** Hace que el corte sea muy poco probable sin bajar ningún control.
- **Si aun así se corta: B (verificación manual),** la misma contingencia propuesta para la falla del equipo facial.
- **A** baja la seguridad: se ingresaría sin prueba de alcohol.
- **C** es mucho trabajo y agrega puntos de falla.

---

## 7. Decisiones pendientes del cliente

1. Con el **alcoholímetro** malogrado: ¿se permite el ingreso **sin prueba de alcohol** (A), **con alcoholímetro portátil** (B) o **no ingresa nadie** hasta repararlo?
2. Con el **equipo facial** malogrado: ¿se permite el ingreso **solo con DNI** (A), **con verificación manual** (B) o **no ingresa nadie** hasta repararlo?
3. ¿Quién puede activar la contingencia: **solo administradores** o también **vigilancia**? En la alternativa B, ¿cada apertura manual la puede hacer **cualquier vigilante** o necesita la **autorización de un supervisor**?
4. ¿Habrá un **alcoholímetro portátil de respaldo** en la garita? (Si falla el equipo facial, el propio alcoholímetro del equipo sirve como portátil; ver la sección 8.1. Si falla el alcoholímetro, haría falta otro.)
5. ¿Hay un **tiempo máximo** para la contingencia (por ejemplo, 48 horas), tras el cual se debe reautorizar?
6. Como el equipo no avisa la desconexión del alcoholímetro, ¿se quiere una **alerta en el Panel** cuando varias personas seguidas no completan la verificación ("posible falla del alcoholímetro o del equipo facial")?
7. Ante un **corte de internet** (modalidad con servidor en la nube): ¿se mantiene que **no ingrese nadie**, o se permite el ingreso **solo con DNI** (A), **con verificación manual** (B) o con la **PC de la garita como respaldo completo** (C)? ¿Se instalará un **internet de respaldo** (D)?

Con estas respuestas se programa un único "Modo de contingencia" que cubre los dos equipos y, si se decide, el ingreso sin internet.

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
| **Lector de DNI desconectado** | "Sistema y APIs" lo muestra como "Cable desconectado"; el sistema vuelve a intentar abrirlo cada 5 segundos y se recupera solo al reconectarlo |
| **Relé del molinete desconectado** | "Sistema y APIs" lo muestra como "No conectado"; el sistema registra la orden de abrir y se recupera solo al reconectarlo |
