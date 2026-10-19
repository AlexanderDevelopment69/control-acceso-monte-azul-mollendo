# Checklist de pruebas: G4 Pro en modo asistencia

Pruebas en la garita con el G4 Pro **HSR3263100192** en modo asistencia (ATT). El modo se elige en **Sistema y APIs → Orden del ingreso**:

- **Modo 1 (Normal):** interruptor "Facial primero" apagado. Primero el DNI y después rostro y alcohol.
- **Modo 2 (Facial primero):** interruptor encendido. Primero rostro y alcohol y después el DNI.

**Reglas que valen en los dos modos:**

- El G4 avisa cada prueba al servidor **10 a 15 s después del soplido**, con el DNI y el grado.
- Hay alcohol alto si el grado es **≥ 0.0001 g/L**.
- **Facial primero:** hay **15 s** para pasar el DNI desde que aparece "pase su DNI" en el Panel (unos 25 s desde el "correcto"). Si el DNI llega antes que el aviso del G4, el sistema espera en silencio hasta 8 s.
- **Vale la primera marcación del pase.** Si la persona vuelve a soplar en los 20 s siguientes, se ignora. Después de 20 s, un soplido nuevo es otro intento, sin bloqueo.

Marque `[x]` cuando la prueba pase. Anote la hora y lo que vio si algo sale distinto.

Personas de prueba:

- **Jose Vilchez**, DNI 71988749 (vigilante)
- **Fernando Herrera Broncal**, DNI 15724705

---

## Antes de empezar

- [x] El G4 está en línea y en modo asistencia (Sistema y APIs → Equipo G4 Pro "En línea").
- [x] Sincronización: el equipo tiene las mismas personas que el sistema, todas con rostro.
- [x] Al editar los datos o la foto de una persona, el cambio llega solo al G4.
- [x] Lector de ingreso y lector de salida leen y abren su molinete. El adaptador de salida falló en el puerto USB 9; se arregló cambiando de puerto.
- [ ] Recargar el Panel (F5) antes de cada sesión de pruebas.
- [ ] Confirmar que el relé del propio G4 **no** abre el molinete por su cuenta (solo lo abre el sistema).

---

## MODO 1: Normal (primero el DNI)

Interruptor "Facial primero" **apagado**.

| # | Prueba | Qué debe pasar | Pasa |
|---|---|---|---|
| 1.1 | DNI en la entrada | El Panel muestra la fila "en espera" con su foto y una cuenta de 60 s | [x] |
| 1.2 | DNI y después rostro y soplido con 0.00 | Ingreso **autorizado**; el molinete se abre 10-15 s después del soplido | [x] |
| 1.3 | DNI y después soplido con enjuague (alcohol alto) | **Denegado "Alcohol"** con su nombre; suena el aviso; no abre | [x] |
| 1.4 | DNI y no hace la prueba en 1 minuto | **Denegado "No completó rostro y alcohol"** | [x] |
| 1.5 | Rostro y soplido **sin** pasar antes el DNI | No vale: no aparece fila "pase su DNI" ni se abre | [ ] |
| 1.6 | Lo anterior y después el DNI y una prueba nueva | La primera no cuenta; con la prueba nueva después del DNI, **autorizado** | [ ] |
| 1.7 | Soplido con alcohol alto **sin** pasar el DNI | **Denegado "Alcohol"** con su nombre, aunque no pasó el DNI | [ ] |
| 1.8 | DNI y dos soplidos seguidos: bien y después alto | Vale el primero: **autorizado**; el segundo se ignora | [ ] |
| 1.9 | DNI y dos soplidos seguidos: alto y después bien | Vale el primero: **denegado "Alcohol"**; no abre | [ ] |
| 1.10 | Dos personas: las dos pasan su DNI y luego cada una sopla | Cada una entra con su propia prueba, en cualquier orden | [ ] |
| 1.11 | Salida con ingreso registrado | **Autorizada**; se abre la salida | [x] |
| 1.12 | Salida sin ingreso registrado | **Denegada "No registra ingreso"** | [x] |
| 1.13 | DNI en la entrada estando "dentro" | **Denegado "Ya figura dentro"** | [x] |
| 1.14 | El Panel muestra la cuenta de 60 s al pasar el DNI (con el Panel recargado) | Se ve la fila con la cuenta y la barra | [ ] |

---

## MODO 2: Facial primero (primero rostro y alcohol)

Interruptor "Facial primero" **encendido**.

| # | Prueba | Qué debe pasar | Pasa |
|---|---|---|---|
| 2.1 | Rostro y soplido con 0.00 (el equipo dice "correcto") y **no** pasa el DNI | 10-12 s después aparece "Aprobó Jose Vilchez · pase su DNI" con **su foto** y una cuenta de **0:15** | [ ] |
| 2.2 | "Correcto" y el DNI **enseguida** (antes de que aparezca la fila) | Espera en silencio unos segundos y **autorizado**, sin ningún rechazo | [ ] |
| 2.3 | Rostro y soplido con alcohol alto | **Denegado "Alcohol"** con su nombre, sin pasar el DNI; suena el aviso | [x] |
| 2.4 | Alcohol alto y enseguida el DNI | Se le responde con el mismo rechazo; no se crea otra fila | [x] |
| 2.5 | DNI **sin** haber hecho rostro y alcohol | Nada en el Panel (sin cuenta regresiva); **a los 8 s, "DNI antes del facial"** | [ ] |
| 2.6 | DNI primero y después rostro y soplido con 0.00 | El DNI: "DNI antes del facial"; la prueba queda como "pase su DNI"; con el DNI otra vez, entra | [ ] |
| 2.7 | DNI primero y después soplido con alcohol alto | **"Alcohol"** con su nombre (una sola fila) | [ ] |
| 2.8 | DNI **16 s o más** después de aparecer "pase su DNI" | Fuera de plazo: **"DNI antes del facial"** (y "Sin DNI" por la aprobación vencida) | [ ] |
| 2.9 | Aprueba y **no** pasa su DNI en los 15 s de la cuenta | **Denegado "Sin DNI"** con su nombre | [ ] |
| 2.10 | Dos soplidos seguidos: bien y después alto | Vale el primero: con el DNI, **autorizado** | [ ] |
| 2.11 | Dos soplidos seguidos: alto y después bien | Vale el primero: **"Alcohol"**; con el DNI, se le responde el rechazo | [ ] |
| 2.12 | Alcohol alto y, pasados 20 s, otro soplido con 0.00 y el DNI | Otro intento, sin bloqueo: **autorizado** | [ ] |
| 2.13 | Aprueba Jose y pasa el DNI de Fernando | A Fernando, a los 8 s: **"DNI antes del facial"**; Jose entra con su DNI | [ ] |
| 2.14 | Dos personas: las dos soplan y después cada una pasa su DNI | Cada una entra con su DNI, en cualquier orden | [ ] |
| 2.15 | Aprueba y pasa el DNI estando "dentro" | **Denegado "Ya figura dentro"** | [ ] |
| 2.16 | Salida | **Autorizada**, igual que en el modo 1 | [x] |

---

## Otras pruebas

| # | Prueba | Qué debe pasar | Pasa |
|---|---|---|---|
| 3.1 | Cambiar de modo 1 a modo 2 y volver | Cada modo se aplica desde el cambio, sin reiniciar nada | [ ] |
| 3.2 | Persona registrada a mano en el G4 (no está en el sistema) | Su prueba no se usa; "Sincronizar ahora" la borra del equipo | [x] |
| 3.3 | Verificación manual activa | El G4 no decide: decide el vigilante en el Panel | [ ] |
| 3.4 | Reporte de ingresos (Excel) | Aparecen los motivos: Alcohol, DNI antes del facial, Sin DNI, No completó | [ ] |
| 3.5 | Persona de baja o con documentos vencidos que aprueba | Denegado por baja o por documentos al pasar el DNI | [ ] |

---

## Registro de personas en el G4

| # | Prueba | Qué debe pasar | Pasa |
|---|---|---|---|
| 4.1 | Registrar una persona nueva con foto en el portal | En segundos aparece en el G4 y la reconoce | [ ] |
| 4.2 | Cambiar el DNI de una persona | Se borra el DNI anterior del G4 y se registra el nuevo con su foto | [x] |
| 4.3 | Cambiar la foto | El G4 la reconoce con la foto nueva | [x] |
| 4.4 | Cambiar el nombre | El G4 muestra el nombre nuevo | [ ] |
| 4.5 | Dar de baja a una persona | Si hace el facial y pasa el DNI: **denegado "Dado de baja"** | [ ] |
| 4.6 | Persona sin foto | Queda registrada sin rostro y Sistema y APIs avisa "sin rostro" | [ ] |
| 4.7 | Cambiar el nombre o ponerle contraseña a alguien en el menú del G4 y luego "Sincronizar ahora" | "Datos corregidos: 1"; el G4 vuelve a tener los datos del sistema | [ ] |
| 4.8 | Revisión diaria activada | Al día siguiente, "Última sincronización" muestra la de la madrugada | [ ] |

---

## Fallas y casos especiales

| # | Prueba | Qué debe pasar | Pasa |
|---|---|---|---|
| 5.1 | Persona que no está registrada se para frente al G4 | No pasa nada en el Panel; si pasa un DNI no registrado: **"No registrado"** | [ ] |
| 5.2 | Desconectar el G4 de la red (o apagarlo) | Sistema y APIs lo marca **desconectado** en unos 20 s; nadie entra (no hay prueba) | [ ] |
| 5.3 | Volver a conectar el G4 | Se reconecta solo; las pruebas hechas sin conexión llegan tarde, se guardan y **no abren** nada (más de 2 min) | [ ] |
| 5.4 | Cortar internet de la garita (mini PC sin conexión) | Ingreso: **no se permite**, con aviso. Salida: se deja salir y se registra al volver | [ ] |
| 5.5 | Volver internet | El controlador se reconecta solo y sube las salidas pendientes | [ ] |
| 5.6 | Pasar el DNI dos veces seguidas (doble lectura) | Una sola fila (las lecturas repetidas de menos de 3 s se ignoran) | [ ] |
| 5.7 | Desconectar el lector de DNI de la entrada | Sistema y APIs lo muestra desconectado; al volver a conectarlo, se reabre solo | [ ] |
| 5.8 | Reinicio del sistema (actualización) en medio de un pase | Quien estaba esperando pierde el pase y debe repetirlo; nadie entra sin prueba | [ ] |
| 5.9 | Hora del G4 | Sigue igual a la del servidor (diferencia de 1-2 s); si se desajusta, avisar | [ ] |
| 5.10 | Alcoholímetro desconectado del G4 | El equipo no deja hacer la prueba: nadie entra | [ ] |

---

## Panel y reportes

| # | Prueba | Qué debe pasar | Pasa |
|---|---|---|---|
| 6.1 | Contador "Prueba de alcohol test positivo hoy" | Sube con cada "Alcohol", también los de antes del DNI | [ ] |
| 6.2 | Contador "Accesos restringidos hoy" | Cuenta todos los denegados del día | [ ] |
| 6.3 | Historial filtrado por DNI o nombre | Muestra los pases de esa persona con el motivo correcto | [ ] |
| 6.4 | Reporte de horas-hombre | Cuenta el tiempo entre ingreso y salida autorizados | [ ] |
| 6.5 | Panel abierto en dos pantallas | Las dos ven las filas en vivo al mismo tiempo | [ ] |

---

## Pendiente de confirmar

- [x] **Demora del aviso del G4.** Llega 10-12 s después del "correcto" (con alcohol alto, 15-17 s). Resuelto el 19/10 17:38: plazo de 15 s desde el "correcto" y espera en silencio de hasta 8 s para un DNI pasado antes de que llegue el aviso.

- [ ] En los ingresos de las 16:30 y 16:31 del 19/10, ¿el vigilante **sopló**? Si no sopló y el G4 registró 0.00 g/L, el equipo estaría aceptando la prueba sin soplido. Para comprobarlo: pararse frente al G4 **sin soplar** y ver si aparece algo en el Panel.
- [ ] Lecturas del lector con el formato `71988749 JOSE VILCHEZ`: el sistema las ignora. Confirmar qué documento las produce.
