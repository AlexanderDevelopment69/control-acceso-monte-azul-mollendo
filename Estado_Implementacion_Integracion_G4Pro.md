# Estado de la implementación: integración G4 Pro en `mollendo-api`

Este documento registra el avance real de código (no solo el análisis técnico) de la integración del equipo ZKTeco G4 Pro dentro del backend `mollendo-api`. Complementa a `Analisis_Control_Acceso_Mollendo.md` (evidencia técnica del protocolo, con el equipo físico) y `Opciones_Integracion_G4Pro.md` (diseño completo del sistema) — este documento es el "qué hay programado hasta ahora y qué falta" dentro del repositorio real.

Última actualización: 01/oct/2026.

> **01/oct/2026 — Confirmado con el equipo físico real, en producción (AWS):** ver sección 2.2. Ya no es solo una prueba simulada contra la instancia local; el equipo real mandó un `rtlog`/`rtstate` de verdad al código de `mollendo-api` desplegado.
>
> **01/oct/2026 — RESUELTO: el registro automático de personas YA FUNCIONA.** Hubo una conclusión negativa intermedia (abajo, tachada) que resultó ser un error de formato nuestro, no del equipo — ver sección 2.5 para el detalle y la causa exacta. `DATA UPDATE USERINFO` (el nombre) sigue sin funcionar y no se manda más, pero `DATA UPDATE BIOPHOTO` (la foto, que es lo que realmente importa para el reconocimiento) **funciona y quedó confirmado con el código de producción real, desplegado en AWS** (`return=0`, el equipo creó el usuario solo a partir de la foto).
>
> ~~**01/oct/2026 — Hallazgo negativo importante:** el registro automático de personas (`sincronizarPersona`, sección 1.3) falla con el equipo real — ver sección 2.3. `DATA UPDATE USERINFO` fue rechazado otra vez (`return=-629`)... El registro automático de caras desde el portal no funciona con este equipo.~~ (Superado — ver 2.5.)

> **Nota sobre dos "bugs" que resultaron ser falsas alarmas** (encontradas al probar esta integración, pero no eran reales): (1) el servidor "no arrancaba" — era por probarlo con `tsx src/main.ts` en vez del comando real del proyecto, `npm run start`; con el comando correcto arranca sin problema. (2) una hora "corrida 5 horas" en una verificación por SQL crudo — era solo cómo `psql` muestra una columna `TIMESTAMP` sin zona horaria; leído por la aplicación (vía Prisma) la hora es la correcta. Ninguno de los dos requirió ningún cambio de código. Se dejan documentados acá para no repetir la confusión.

## 0. Revisión del proyecto completo (30/set/2026)

Para evitar seguir generando falsas alarmas, se revisó el proyecto `Proyecto Mollendo` completo (no solo lo tocado en esta integración): arquitectura de despliegue (`docker-compose.prod.yml`, `Registro_Despliegue_MiniPC.md`), historial reciente (`PROGRESO.md`), y el portal (`mollendo-portal`). De ahí salieron dos correcciones reales, consecuencia directa de los cambios de esta integración:

- **`prisma/simular-garita.ts` (el simulador de garita, `npm run simular`) estaba roto**: mandaba `alcoholConforme` en el `POST /eventos-acceso/ingreso`, campo que ya no existe en `IngresoDto` — con `forbidNonWhitelisted: true` esa llamada iba a fallar con 400 siempre. Se reescribió para seguir el flujo real en dos fases: manda el DNI, y si queda "pendiente", simula también el `table=rtlog` del G4 Pro (como lo haría el equipo real) antes de poder reportar el resultado. Se encontró de paso una condición de carrera (la correlación corre async respecto al "OK" que responde `/iclock/cdata`, a propósito, para no acoplar módulos) y se agregó un reintento corto. **Probado de verdad** contra la instancia corriendo: los 4 casos (normal, alcohol, documentos, de baja) resuelven bien.
- **La página "Sistema y APIs" del portal** (`mollendo-portal/src/app/(admin)/sistema/page.tsx`) todavía mostraba el contrato viejo del endpoint de ingreso (con `alcoholConforme` en el ejemplo) y describía la integración del G4 Pro como "pendiente" con un ejemplo genérico de ATTLOG. Se actualizó con el contrato real (`estado: "pendiente_verificacion"`), el protocolo real (`RegistryCode`, `rtlog`), y notas aclarando qué está probado y qué no.

Verificado tras estos cambios: `tsc --noEmit` limpio y `eslint` limpio en el portal; `tsc --noEmit`, lint y los 31 tests limpios en la API; el simulador corriendo de verdad contra Postgres real.

---

## 1. Qué se implementó

### 1.1. Módulo `push-sdk` (`mollendo-api/src/push-sdk/`)

El protocolo ADMS/PUSH real, basado en lo confirmado con el equipo físico `HSR3263100192` (ver `Analisis_Control_Acceso_Mollendo.md` sección 6.1):

| Endpoint | Qué hace |
|---|---|
| `POST /iclock/registry` | Responde `RegistryCode=<código>`, estable por equipo (nunca `OK`) — sin esto el equipo nunca manda datos reales. |
| `POST /iclock/push` | Handshake de sesión (`SessionID`, etc.), descubierto por tráfico real, no documentado por el fabricante. |
| `GET /iclock/getrequest` | Entrega los comandos pendientes en cola para ese equipo. |
| `POST /iclock/devicecmd` | Recibe la confirmación de un comando ejecutado (`ID`, `Return`, `CMD`). |
| `GET/POST /iclock/cdata` | Recibe `table=rtlog` (resultado facial + alcoholímetro) y `table=rtstate` (sensor/relé/puerta) — las dos tablas no documentadas por ZKTeco. También soporta `type=PostVerifyData` (Background Verification) por si algún otro equipo de la familia sí la usa — este G4 Pro específico no la soporta, confirmado. |

Estas rutas están excluidas del prefijo global `/api/v1` en `main.ts`, porque el equipo las llama fijas, sin poder configurar ningún prefijo. Los cuerpos POST de `/iclock/*` se leen siempre como texto plano (el equipo casi nunca manda un `Content-Type` reconocible).

### 1.2. Tablas nuevas en Postgres

Migraciones `20260930200000_push_sdk_dispositivos` y `20260930203000_ingreso_pendiente`, ya aplicadas contra la base de datos local (`mollendo-postgres`, Docker vía WSL):

- **`dispositivo_acceso`**: un equipo por fila, con su `registry_code` persistente.
- **`comando_dispositivo`**: cola de comandos salientes (`DATA UPDATE USERINFO`, `DATA UPDATE BIOPHOTO`, etc.), con estado `pendiente` → `entregado` → `confirmado`.
- **`verificacion_dispositivo`**: cada evento crudo de `rtlog`/`rtstate` que manda el equipo, con un `evento_acceso_id` opcional para cuando se logra correlacionar.
- **`ingreso_pendiente`**: el puente entre el DNI escaneado y el resultado del G4 Pro (ver sección 1.4).

### 1.3. Sincronización real de personas al equipo

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
5. **Reconocimiento normal, de ahí en adelante**: cualquiera que se pare frente al equipo se compara contra **todas** las caras que conoce (1:N), incluida la nueva. Si reconoce y el alcohol sale bien, abre con su propio relé y manda el `rtlog`.

**El hueco conocido en el paso 5**: el campo `pin` que manda el equipo en el `rtlog` no identifica confiablemente a quién reconoció (llega en `0` siempre, confirmado con el equipo real) — por eso hace falta correlacionarlo con el DNI (pendiente 3.2), no se puede saber "quién fue" solo con este mensaje.

**No se manda** `StartDatetime`/`EndDatetime`/`Expires=1` (la idea original de "registrarla deshabilitada hasta que pase su DNI"): se confirmó con el equipo real que esos campos se rechazan (`return=-629`), incluso con el interruptor `UserValidTimeFun=1` activado. El control de que nadie se salte el DNI queda a cargo del vigilante (ver `Analisis_Control_Acceso_Mollendo.md` sección 6.0).

> **01/oct/2026 — Probado y RECHAZADO** (ver sección 2.3): los pasos 1-3 de este proceso sí se probaron con el equipo físico real, y el paso 3 falla — el equipo rechaza `DATA UPDATE USERINFO` (`return=-629`), con o sin fechas de validez. El registro automático de personas, tal como está descrito arriba, **no funciona con este equipo**. La prueba de la sección 2.2 fue solo del paso 5 (el equipo ya traía sus propias caras enroladas de antes, manualmente).

### 1.4. Flujo de ingreso en dos fases

El `POST /eventos-acceso/ingreso` ya no recibe `alcoholConforme` en la misma llamada (se quitó del DTO). Ahora:

1. **Fase 1 — DNI**: valida que la persona exista, no esté dada de baja y tenga documentos vigentes. Si falla algo, se deniega ahí mismo (igual que antes). Si todo está en regla, se crea un `IngresoPendiente` y la respuesta es `estado: 'pendiente_verificacion'` — todavía no hay un `EventoAcceso`.
2. **Fase 2 — resultado del G4 Pro**: cuando llega un `rtlog` real (vía `push-sdk`), se emite el evento `dispositivo.rtlog`, que `EventosAccesoService.correlacionarVerificacionDispositivo` escucha. Busca el `IngresoPendiente` más antiguo sin consumir dentro de una ventana de tiempo (FIFO, por si hay varias personas en fila) y recién ahí crea el `EventoAcceso` definitivo (autorizado o denegado por alcohol), y marca la `VerificacionDispositivo` como correlacionada.

El G4 Pro **sigue abriendo el ingreso con su propio relé**, como en el diseño original — el backend ya no decide la apertura, solo registra el resultado para el Panel.

---

## 2. Qué está verificado y qué no

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

### 2.1. Prueba end-to-end con curl (simulando DNI + equipo)

Con la instancia ya corriendo (`npm run start`), se simuló el flujo completo contra una persona real de la base de datos (id 20, documentos vigentes):

1. `POST /api/v1/eventos-acceso/ingreso` (DNI) → `{"estado":"pendiente_verificacion", ...}`, se crea un `IngresoPendiente`.
2. `POST /iclock/registry` + `POST /iclock/push` (el equipo se da de alta).
3. `POST /iclock/cdata?table=rtlog` con un evento real (`event=0`, `Concentration=0`) → el servidor correlaciona automáticamente con el `IngresoPendiente` más antiguo.
4. Resultado: `EventoAcceso` creado con `resultado=autorizado`, `IngresoPendiente` marcado como consumido, y `VerificacionDispositivo` enlazada al evento.

Se verificó además, leyendo con Prisma (no con SQL crudo), que la hora del evento queda guardada y se recupera correctamente en hora de Perú — una columna `TIMESTAMP` sin zona horaria se ve "corrida" si se consulta directo por `psql`, pero la aplicación la interpreta bien siempre.

### 2.2. Desplegado en AWS y probado con el equipo físico real (01/oct/2026)

Se desplegó el sistema completo (no solo `mollendo-api`) en la instancia EC2 que se venía usando para las pruebas de `pushdemo` (`54.147.214.38`), usando `docker-compose.prod.yml` tal como está pensado para la mini PC:

1. **Se liberó espacio**: el disco estaba casi lleno (1.3 GB libres de 6.7 GB) por los contenedores/imágenes de `pushdemo`, que ya habían cumplido su función (el protocolo que reverse-engineerearon ahí ya está implementado en `push-sdk/`). Se borraron (`docker compose down -v` + `docker system prune -af --volumes`), quedando 3.3 GB libres.
2. **Se armó el `.env` de producción** con secretos generados al azar (`DB_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DEVICE_API_KEY`, contraseñas iniciales) y `CORS_ORIGIN` apuntando al portal en esa IP.
3. **Se subió el proyecto** (sin `node_modules`/`.next`/`dist`, ~658 KB comprimido) y se levantó: `docker compose -f docker-compose.prod.yml up -d --build db api portal backup`. Los 4 contenedores arrancaron bien al primer intento.
4. **Se corrió el seed inicial** (`docker compose run --rm -T api npm run db:seed`) — paso manual que ya estaba documentado en `Registro_Despliegue_MiniPC.md` para el primer despliegue, no se había hecho antes.
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

### 2.3. `sincronizarPersona` probado contra el equipo real — RECHAZADO (01/oct/2026)

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

### 2.4. Investigación exhaustiva adicional (01/oct/2026) — mismo resultado, con más evidencia

Antes de concluir que es una limitación real del equipo (y no un error de esta implementación), se revisaron a fondo todas las fuentes disponibles:

1. **El código fuente del SDK Java del proveedor** (`DevCmdUtil.java`, `Constants.java`, `UserInfo.java`, dentro de este mismo repositorio `pushdemo`): tiene el formato completo real, con **tres campos que no usábamos** — `Grp`, `TZ`, `Category`. Se encontró además, en `deviceCommand.jsp` (la pantalla de pruebas manuales del propio SDK del proveedor), un comando de ejemplo "conocido bueno": `DATA UPDATE USERINFO PIN=70059 Name=abhishek Pri=0 Passwd= Card= Grp=1 TZ=0000000100000000 Category=0`. **Sexta prueba**: se mandó ese formato completo, exacto, al equipo real → **rechazado igual** (`return=-629`).
2. **El documento "Brief Analysis of TA Push Protocol" del proveedor** (el tercer documento técnico que entregaron): sus ejemplos son de un equipo y firmware distintos (`xFace600`, plataforma `ZAM170-NF`) — confirma que existen distintas plataformas de hardware ZKTeco con comportamientos distintos, consistente con la sospecha de que el problema es específico de la plataforma de nuestro equipo (`ZIM200`).
3. **El manual de usuario real del G4 Pro**: no menciona `DATA UPDATE USERINFO` ni ningún comando de registro remoto en absoluto.
4. **Búsqueda en internet** (documentación pública y el repositorio de la librería Go de referencia, `s0x90/zkteco-adms`): se confirmó que `DATA UPDATE USERINFO` **sí está probado y funciona** en hardware ZKTeco real — pero específicamente en un **`SpeedFace-V5L-RFID` con firmware `ZAM180-NF`**, una plataforma distinta a la nuestra. El código `-629` no aparece documentado en ninguna fuente pública: ni el protocolo oficial, ni el SDK del proveedor, ni ninguna librería de terceros, ni foros.

**Esto no debilita la conclusión — la refuerza**: se encontró más evidencia de que el formato usado es el correcto (coincide con lo que de verdad funciona en otros equipos ZKTeco reales), y más evidencia de que el problema es específico de la combinación plataforma/firmware de este G4 Pro (`ZIM200`, OEM `4.1.109-OCM-4101-3`), no un error de esta implementación.

**Conclusión de esta etapa (superada en la sección 2.5)**: `DATA UPDATE USERINFO` (el nombre) está confirmado como rechazado en el equipo, con seis pruebas independientes, incluyendo el ejemplo exacto del fabricante — esto **sigue siendo cierto**. Lo que NO era cierto es que esto impidiera el registro de la cara: `DATA UPDATE BIOPHOTO` (la foto) es un comando aparte, y si se manda en el formato correcto, funciona solo, sin necesitar `USERINFO` primero. Ver sección 2.5.

### 2.5. El registro automático SÍ funciona — la causa real era un formato equivocado en `BIOPHOTO`, no un rechazo del equipo (01/oct/2026)

Por pedido explícito de revisar más a fondo antes de descartar la idea, se investigó: el código fuente completo del SDK Java del proveedor (dentro de este mismo repositorio, `pushdemo`), su documento "Brief Analysis of TA Push Protocol", el manual del G4 Pro, y búsquedas en internet (incluida la librería Go de referencia `s0x90/zkteco-adms`). Ninguna fuente dio una solución directa para `DATA UPDATE USERINFO` — pero revisando el SDK del proveedor a fondo (`Constants.java`, `DevCmdUtil.java`) apareció algo que no se había probado: el comando **`DATA UPDATE BIOPHOTO` que usa el propio SDK del proveedor tiene un formato más simple** (4 campos: `PIN`, `Type`, `Size`, `Content`) que el que se venía usando (7 campos, el de la especificación completa del protocolo oficial: incluía además `No`, `Index`, `Format`).

**Se probó, contra el equipo real, aislando cada variable, en este orden:**

1. `BIOPHOTO` solo (sin `USERINFO`), formato de 4 campos, `Type=2` (como lo hardcodea el SDK del proveedor) → **`return=0`, éxito**.
2. `USERINFO` enviado *después*, para ese mismo PIN ya existente → **sigue rechazado**, `return=-629` — confirma que `USERINFO` nunca va a funcionar en este equipo, pase lo que pase.
3. `BIOPHOTO` solo, formato de 4 campos, pero con `Type=9` (rostro de luz visible, el que corresponde según el protocolo oficial a este tipo de cámara) → **también `return=0`, éxito** — descarta que el `Type` fuera la causa; confirma que el problema real eran los 3 campos de más (`No`, `Index`, `Format`) del formato de 7 campos.
4. **Prueba final, con el código de producción real** (no SQL directo): se creó una persona de prueba vía `POST /api/v1/personas` y se le subió una foto vía `POST /api/v1/personas/:id/foto` contra la instancia desplegada en AWS — el evento disparó `sincronizarPersona` (ya corregido), que encoló `DATA UPDATE BIOPHOTO PIN=3 Type=9 Size=10720 Content=...` → el equipo real lo recogió y confirmó **`return=0`**.

**Corrección aplicada en el código** (`push-sdk.service.ts`): `sincronizarPersona` ya no manda `DATA UPDATE USERINFO` (confirmado que nunca funciona, no tiene caso seguir mandándolo) y el `DATA UPDATE BIOPHOTO` ahora usa el formato simple de 4 campos. El equipo crea el usuario solo, a partir de la foto — no hace falta un paso separado para el nombre. El parámetro `nombreCompleto` se quitó de la función y del evento `persona.foto-actualizada` por quedar sin uso.

**Lo único que sigue sin resolverse**: el equipo no tendrá un "nombre" visible en su propia pantalla para cada usuario (solo el PIN = ID de la persona), porque `USERINFO` nunca funciona. Esto es cosmético, no afecta el reconocimiento facial — si en algún momento se necesita, habría que preguntarle al proveedor específicamente por esto, ya con la certeza de que el resto del mecanismo sí funciona.

**Lección para no repetir esta confusión**: antes de concluir que un equipo "rechaza" una función completa, hay que probar cada comando relacionado por separado (acá había dos comandos distintos — `USERINFO` y `BIOPHOTO` — agrupados bajo una sola conclusión negativa, cuando solo uno de los dos realmente fallaba) y revisar el código fuente de referencia del proveedor con calma antes de agotar las pruebas razonables.

---

## 3. Pendientes

### 3.1. ~~Bloqueador: el servidor no arranca~~ — descartado, era un falso positivo

Al probar con `npx tsx src/main.ts` aparecía `UnknownDependenciesException` sobre `JwtAuthGuard`/`AuthModuleOptions`. **No es un bug real**: `tsx` (basado en esbuild) no genera correctamente los metadatos de decoradores que necesita Nest para resolver una clase que extiende `AuthGuard('jwt')` — por eso parecía que faltaba un provider. El comando real del proyecto es `npm run start` (usa `nest start`, con el compilador de TypeScript completo), y con ese arranca sin ningún error, mapea todas las rutas y conecta a Postgres. Confirmado en vivo contra la instancia ya corriendo (`/api/v1/health` y `/iclock/registry` responden bien). No hay ninguna acción pendiente acá.

### 3.2. Integración de los lectores de DNI

Todavía no existe el código que lee los puertos USB-COM de los lectores Syble y llama a `POST /eventos-acceso/ingreso` — es lo que dispararía la Fase 1 del flujo. Sin esto, no hay forma de probar el flujo completo en la práctica (se puede simular con `curl` mientras tanto). **Confirmado en vivo el 01/oct/2026** (sección 2.2): una prueba real en el equipo físico desplegado en AWS llegó correctamente como `rtlog`/`rtstate`, pero quedó sin `EventoAcceso` por esta misma razón — es ahora mismo lo único que falta para que el flujo funcione de punta a punta con hardware real.

### 3.3. Ventana de correlación sin validar

`VENTANA_INGRESO_PENDIENTE_MS` (2 minutos, en `eventos-acceso.service.ts`) es un valor de partida, no medido. Falta la prueba real de cuánto tarda una persona en pasar su DNI, caminar al G4 Pro y completar rostro+alcohol (pendiente #1 de `Opciones_Integracion_G4Pro.md`).

### 3.4. Interpretación de los códigos de rechazo, sin confirmar

`correlacionarVerificacionDispositivo` trata cualquier `event` distinto de `'0'` como `denegadoPorAlcohol`. Solo se ha probado el caso exitoso (`event=0`, `Concentration=0`, "Pass") — falta repetir la prueba real con resultados **Drink** y **Fail** del DT1700 para confirmar qué manda el equipo en esos casos (pendiente #3 de `Opciones_Integracion_G4Pro.md`).

### 3.5. "No completó el ingreso en el terminal" — sin implementar

Si alguien pasa su DNI y nunca completa la prueba en el G4 Pro (se arrepiente, se va, etc.), el `IngresoPendiente` queda abierto para siempre — no hay un barrido periódico que lo cierre ni un motivo "no completó el ingreso" en el Panel. Haría falta una tarea programada (cron) que expire los pendientes viejos.

### 3.6. Multi-equipo todavía no diferenciado

`sincronizarPersona` manda el registro a **todos** los equipos conocidos en `dispositivo_acceso`, sin distinguir "equipo de ingreso" de un futuro "equipo de salida" u otro punto de control. Para un solo G4 Pro (el caso actual) no es un problema; si se agregan más equipos con roles distintos, hay que agregar esa distinción.

### 3.7. Molinete de salida (preexistente, no es de esta sesión)

`IntegracionesService.enviarComandoTorniquete` sigue simulado (solo log) — el relé de red real para la salida todavía no se compró ni se programó. Esto no cambió en esta sesión.

---

## 4. Archivos nuevos/modificados de esta integración

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
