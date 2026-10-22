/** APIs con las que se integran los equipos de la garita, con ejemplos para la lista de "Sistema y APIs". */
export interface ApiIntegracion {
  nombre: string;
  endpoint: string;
  metodo: "POST" | "GET" | "PUT" | "GET · PUT" | "GET · POST" | "GET · POST · DELETE" | "RS232" | "USB";
  descripcion: string;
  autenticacion: string;
  /** real: funciona hoy · mock: simulado (solo queda en el log) · pendiente: por programar. */
  tipo: "real" | "mock" | "pendiente";
  headers: string[];
  ejemploRequest: string;
  ejemploRespuesta: string;
  notas: string;
}

export const APIS_INTEGRACION: ApiIntegracion[] = [
  {
    nombre: "Terminal ZKTeco G4 Pro + alcoholímetro (protocolo PUSH, modo asistencia)",
    endpoint: "/iclock/cdata · /iclock/getrequest · /iclock/devicecmd",
    metodo: "POST",
    descripcion:
      "El G4 Pro se conecta directo al servidor con el protocolo PUSH del fabricante. Desde el 19/10/2026 está en modo asistencia (ATT), que envía cada prueba con el DNI de quien sopló y el grado de alcohol (table=ATTLOG), también cuando el alcohol sale alto. Por ahí recibe las personas (USERINFO, con el DNI como número de usuario y su nombre) y su foto (biophoto, que el equipo convierte en el rostro que reconoce). En este modo no hay permisos de paso: el equipo verifica a todo su personal y el sistema decide con el DNI y el grado. El servidor detecta solo el modo del equipo (asistencia o control de acceso).",
    autenticacion: "Número de serie (G4PRO_SN_PERMITIDOS) e IP de la sede (G4PRO_IPS_PERMITIDAS): el equipo no manda ningún token — las rutas /iclock/* no llevan X-API-Key",
    tipo: "real",
    headers: ["El equipo no manda Content-Type reconocible; el servidor siempre lee el cuerpo como texto plano"],
    ejemploRequest: `// Al conectarse, el equipo anuncia su modo y pide sus opciones:
GET /iclock/cdata?SN=HSR3263100192&options=all&pushver=2.4.1&DeviceType=att

// Órdenes que el servidor le deja: las recoge al consultar /iclock/getrequest
// (campos separados por tabulador)
DATA UPDATE USERINFO PIN=12345678\tName=Juan Pérez\tPri=0\tPasswd=\tCard=\tGrp=1\tTZ=0000000100000000\tVerify=-1\tViceCard=
DATA UPDATE biophoto PIN=12345678\tType=9\tSize=…\tContent=<foto JPG ≤ 20 KB en base64>\tFormat=0\tUrl=\tPostBackTmpFlag=0
DATA DELETE USERINFO PIN=12345678
DATA QUERY USERINFO   // lista de usuarios (responde por table=OPERLOG y table=BIODATA)
SHELL cat /sys/bus/usb/devices/*/uevent | grep -c PRODUCT=1a86/7523/   // cada 10 s: ¿está el alcoholímetro? (2 / 0)`,
    ejemploRespuesta: `// Cada prueba (table=ATTLOG), campos separados por tabulador:
// DNI, hora, estado (255), verificación (15 = rostro), código de trabajo,
// 2 reservados, mascarilla (255 = apagada), temperatura, temperatura convertida,
// N.º de marcación, grado de alcohol y 3 campos sin uso
POST /iclock/cdata?SN=HSR3263100192&table=ATTLOG&Stamp=9999
71988749\t2026-10-19 17:00:20\t255\t15\t0\t0\t0\t255\t0\t0\t6\t0.00g/L\t-\t-\t-       // aprobó
71988749\t2026-10-19 16:33:26\t255\t15\t0\t0\t0\t255\t0\t0\t9\t0.000595g/L\t-\t-\t-   // alcohol alto`,
    notas:
      "Probado con el equipo real HSR3263100192 (19/oct/2026). El estado es siempre 255: el sistema decide con el grado (alcohol alto desde 0.0001 g/L, el umbral del equipo; G4PRO_UMBRAL_ALCOHOL). El aviso llega 10-12 s después del soplido (15-17 s con alcohol alto). Las marcaciones repetidas se ignoran y las de más de 2 minutos (enviadas al volver la conexión) se guardan sin decidir nada. El N.º de marcación sube de uno en uno: el Monitor del G4 Pro avisa si falta alguno. Para ver los mensajes crudos del equipo, PUSH_SDK_DEPURAR=true en el .env del servidor (apagado por defecto; ver docs/g4pro/Depuracion_y_Pruebas_G4Pro.md). En modo control de acceso (ACC) el equipo usa /iclock/registry, /iclock/push y table=rtlog, y el aprobado llega sin DNI (pin=0).",
  },
  {
    nombre: "Lectores de DNI (Syble XB-7705H)",
    endpoint: "Puerto serie del adaptador USB-RS232 (/dev/serial/by-id/…)",
    metodo: "RS232",
    descripcion:
      "Cada lector lee el código de barras del reverso del DNI y envía el número por RS232 (115200 baudios, 8N1). El backend lee el puerto y registra el ingreso o la salida según el adaptador por el que llegó (igual que POST /eventos-acceso/ingreso|salida).",
    autenticacion: "No aplica (lectura local del puerto)",
    tipo: "real",
    headers: ["LECTOR_DNI_INGRESO_DISPOSITIVO / LECTOR_DNI_SALIDA_DISPOSITIVO en .env (ruta fija del adaptador)"],
    ejemploRequest: `// Lo que envía el lector al pasar un DNI:
48058719\\r\\n`,
    ejemploRespuesta: `// Registro del backend:
Lector de DNI de ingreso conectado en /dev-servidor/serial/by-id/usb-Prolific…-port0 (115200 baudios)
DNI leído en ingreso: pendiente_verificacion`,
    notas:
      "El lector viene en modo USB: se configura con el folleto de la caja (Factory Default → RS232 → 115200). Se ignora la misma lectura dentro de 3 s; si el adaptador se desconecta, se reintenta cada 5 s. El estado (Cable conectado / desconectado) corresponde al cable de datos, no a la energía del lector. Si lee el QR de una tarjeta de contingencia (TMAM-CONT-…), la manda a POST /eventos-acceso/tarjeta en lugar de un DNI.",
  },
  {
    nombre: "Ingreso",
    endpoint: "/eventos-acceso/ingreso",
    metodo: "POST",
    descripcion:
      "El DNI del ingreso (lo usan los lectores; también se puede llamar con la clave de equipo). Si la persona no está registrada, está de baja, ya figura dentro, no tiene documentos o tiene alguno vencido, se deniega aquí mismo. Si está en regla, se junta con la prueba de rostro y alcohol del G4 Pro de esa misma persona, según el orden del ingreso (Sistema y APIs → Orden del ingreso). Normal: vale la prueba hecha después del DNI; queda en espera 1 minuto y, sin prueba, No completó rostro y alcohol. Facial primero: vale la prueba hecha antes del DNI; tiene 30 s desde que el Panel muestra pase su DNI; si el DNI llega antes que el aviso del G4, espera en silencio hasta 8 s; sin prueba previa, DNI antes del facial. Aprobado → ingreso autorizado y relé de ingreso; alcohol alto → denegado Alcohol con su nombre.",
    autenticacion: "Clave de equipo (X-API-Key)",
    tipo: "real",
    headers: ["Content-Type: application/json", "X-API-Key: <DEVICE_API_KEY>"],
    ejemploRequest: `{
  "tipoDocumentoIdentidad": "DNI",
  "numeroDocumento": "12345678",
  "torniqueteId": "Ingreso"
}`,
    ejemploRespuesta: `// 201 Created — documentos en regla, esperando el resultado del equipo
{
  "estado": "pendiente_verificacion",
  "persona": { "id": 1, "nombres": "Juan", "apellidos": "Pérez" },
  "numeroDocumento": "12345678",
  "mensaje": "Documentos en regla. Esperando el resultado del equipo (rostro + alcoholímetro)."
}

// 201 Created — facial primero, ya aprobó rostro y alcohol: autorizado
{
  "eventoId": 187,
  "tipoMovimiento": "ingreso",
  "resultado": "autorizado",
  "persona": { "id": 1, "nombres": "Juan", "apellidos": "Pérez" },
  "numeroDocumento": "12345678",
  "motivos": {},
  "facialPrimero": true,
  "dniQueSoplo": "12345678"
}

// 201 Created — denegado de inmediato (documentos, baja, ya dentro)
{
  "eventoId": 43,
  "tipoMovimiento": "ingreso",
  "resultado": "denegado",
  "persona": { "id": 2, "nombres": "Ana", "apellidos": "Torres" },
  "numeroDocumento": "87654321",
  "motivos": {
    "dadoDeBaja": false,
    "sinDocumentos": false,
    "documentos": true,
    "documentosVencidos": ["SCTR"]
  }
}

// 201 Created — documento no registrado (queda en el historial sin persona)
{
  "eventoId": 45,
  "resultado": "denegado",
  "persona": null,
  "numeroDocumento": "99999999",
  "motivos": { "personaNoRegistrada": true }
}

// 401 — X-API-Key inválida o ausente`,
    notas:
      "Varias personas pueden estar en proceso a la vez: cada prueba del G4 trae el DNI de quien sopló. Vale la primera prueba de cada pase: volver a soplar en los 20 s siguientes no cambia el resultado (sin bloqueo después). La hora de la prueba es la del G4 (difiere 1-2 s de la del servidor). Con la verificación manual activa decide el vigilante. Si la misma persona vuelve a pasar el DNI mientras espera, mantiene su espera.",
  },
  {
    nombre: "Salida",
    endpoint: "/eventos-acceso/salida",
    metodo: "POST",
    descripcion:
      "Registro de salida: con un documento registrado (aunque la persona esté dada de baja o tenga documentos vencidos) y un ingreso registrado antes, se autoriza y se activa el relé de salida.",
    autenticacion: "Clave de equipo (X-API-Key)",
    tipo: "real",
    headers: ["Content-Type: application/json", "X-API-Key: <DEVICE_API_KEY>"],
    ejemploRequest: `{
  "tipoDocumentoIdentidad": "DNI",
  "numeroDocumento": "12345678",
  "torniqueteId": "Salida"
}`,
    ejemploRespuesta: `// 201 Created — autorizado
{
  "eventoId": 44,
  "tipoMovimiento": "salida",
  "resultado": "autorizado",
  "persona": { "id": 1, "nombres": "Juan", "apellidos": "Pérez" },
  "numeroDocumento": "12345678",
  "motivos": {}
}

// 201 Created — documento no registrado: no se abre y queda en el historial
{
  "eventoId": 46,
  "resultado": "denegado",
  "persona": null,
  "numeroDocumento": "99999999",
  "motivos": { "personaNoRegistrada": true }
}`,
    notas:
      "Antipassback estricto: sin un ingreso registrado se deniega (No registra ingreso) y no se abre. Si el controlador estaba sin internet, deja salir y la registra después con su hora.",
  },
  {
    nombre: "Tarjetas de contingencia y de acceso (QR)",
    endpoint: "/eventos-acceso/tarjeta",
    metodo: "POST",
    descripcion:
      "El QR de una tarjeta leído por un lector de DNI (lo manda el controlador; las dos usan el mismo formato y el servidor decide por el tipo). Tarjeta de contingencia (sin DNI): sola no abre; en el ingreso (orden facial primero) entra quien aprobó rostro y alcohol y espera su DNI, si es una sola persona; si la prueba todavía no llegó, la espera hasta 8 s, como un DNI. En la salida, sale el personal elegido en el Panel (Salida sin DNI). Baja, antipassback y documentos se revisan igual que con el DNI, y el ingreso o la salida queda a nombre del personal, con la tarjeta. Tarjeta de acceso (visitas, autoridades): abre sola el molinete de esa puerta, sin rostro, alcohol ni DNI (también con la verificación manual activa o en cualquier orden); queda sin persona, como Tarjeta de acceso N.º …, y no cuenta en Presentes ni en horas-hombre. Una tarjeta no registrada, desactivada o vencida, o una de contingencia pasada sin nadie esperando, se rechaza: suena el aviso de denegado de esa puerta y queda en los usos de la tarjeta.",
    autenticacion: "Clave de equipo (X-API-Key)",
    tipo: "real",
    headers: ["Content-Type: application/json", "X-API-Key: <DEVICE_API_KEY>"],
    ejemploRequest: `{
  "codigo": "TMAM-CONT-K3QZ7M2XWB5RTA4NJD6P",
  "tipoMovimiento": "ingreso",
  "torniqueteId": "Ingreso"
}`,
    ejemploRespuesta: `// 201 Created — aprobó rostro y alcohol: autorizado a su nombre
{
  "eventoId": 212,
  "tipoMovimiento": "ingreso",
  "resultado": "autorizado",
  "persona": { "id": 1, "nombres": "Juan", "apellidos": "Pérez" },
  "numeroDocumento": "12345678",
  "motivos": {},
  "facialPrimero": true,
  "dniQueSoplo": "12345678"
}

// 201 Created — tarjeta de acceso: abre sola, sin persona
{
  "eventoId": 213,
  "tipoMovimiento": "ingreso",
  "resultado": "autorizado",
  "persona": null,
  "numeroDocumento": null,
  "motivos": {},
  "tarjetaAcceso": 1
}

// 201 Created — rechazada (no abre)
{
  "resultado": "denegado",
  "mensaje": "Nadie eligió al personal en el Panel (Salida sin DNI)"
}`,
    notas:
      "Las tarjetas las maneja el administrador en Contingencias → Tarjetas de contingencia y Tarjetas de acceso, en el menú (GET/POST /tarjetas-contingencia, con ?tipo=acceso o tipo: acceso para las de acceso; cada tipo con su numeración; PATCH y DELETE /tarjetas-contingencia/:id (eliminar, solo si nunca se usó), POST /tarjetas-contingencia/:id/cambiar-codigo y GET /tarjetas-contingencia/:id/qr para imprimir); solo el administrador las ve y las administra (también sus usos: GET /tarjetas-contingencia/usos, con ?tipo=acceso para las de acceso). El código va solo en el QR: la API no lo devuelve. Sin internet, el controlador no la manda y suena el aviso (tampoco la de acceso). Con la verificación manual activa o en el orden normal, la de contingencia no sirve; la de acceso sí.",
  },
  {
    nombre: "Salida sin DNI (Panel de vigilancia)",
    endpoint: "/eventos-acceso/salida-sin-dni",
    metodo: "POST",
    descripcion:
      "El vigilante elige al personal que sale sin DNI (debe figurar dentro; GET /eventos-acceso/salida-sin-dni/candidatos?busqueda=… los busca) y tiene 2 minutos para pasar la tarjeta de contingencia por el lector de salida. Una a la vez: elegir otro reemplaza al anterior. GET devuelve la que espera (o null) y DELETE la cancela. En tiempo real se avisa por WebSocket (/ws/eventos): salida-sin-dni.",
    autenticacion: "JWT (Administrador / Vigilancia)",
    tipo: "real",
    headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
    ejemploRequest: `{ "personaId": 41 }`,
    ejemploRespuesta: `// 201 Created
{
  "personaId": 41,
  "nombres": "Juan",
  "apellidos": "Pérez",
  "numeroDocumento": "12345678",
  "hasta": "2026-10-20T20:12:00.000Z",
  "preparadaPor": "vigilante@empresa.com"
}

// 400 — Esa persona figura fuera: no tiene una salida pendiente`,
    notas:
      "La salida queda con la tarjeta y con quién eligió al personal (Tarjeta de contingencia · correo en el Panel). Elegir y cancelar quedan en la Auditoría.",
  },
  {
    nombre: "Contingencia sin lector (lector de DNI desconectado)",
    endpoint: "/eventos-acceso/sin-lector · /eventos-acceso/salida-sin-lector",
    metodo: "GET · POST",
    descripcion:
      "Con el lector de DNI de una puerta desconectado y el controlador en línea, la contingencia se activa sola. GET dice qué puertas están sin lector. Ingreso (facial primero): quien aprueba rostro y alcohol entra sin pasar el DNI. Salida: POST abre la salida de quien figura dentro (lo usa Salida en Presentes ahora); solo con el lector de salida desconectado. En tiempo real se avisa por WebSocket (/ws/eventos): sin-lector.",
    autenticacion: "JWT (Administrador / Vigilancia)",
    tipo: "real",
    headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
    ejemploRequest: `// POST /eventos-acceso/salida-sin-lector
{ "personaId": 41 }`,
    ejemploRespuesta: `// GET /eventos-acceso/sin-lector
{ "ingreso": false, "salida": true }

// POST → 201 Created
{ "eventoId": 1532, "tipoMovimiento": "salida", "resultado": "autorizado", "numeroDocumento": "12345678" }

// 400 — El lector de salida ya está conectado: la persona pasa su DNI`,
    notas:
      "Queda marcado en el Panel (Sin lector de DNI: identificado por rostro / Salida sin lector · correo), en el reporte de ingresos y salidas y, la salida, en la Auditoría (apertura manual). Termina sola al volver el lector.",
  },
  {
    nombre: "Verificación manual (equipo facial o alcoholímetro fuera de servicio)",
    endpoint: "/eventos-acceso/verificacion-manual · /eventos-acceso/en-espera/:id/decision",
    metodo: "GET · POST · DELETE",
    descripcion:
      "La activan el vigilante o el administrador desde el Panel (POST, con motivo obligatorio y la causa: terminal, alcoholimetro o ambar, según desde dónde se activó) y la terminan con DELETE; GET dice si está activa. Mientras tanto, cada DNI en regla queda esperando la decisión del vigilante (2 minutos): POST /eventos-acceso/en-espera/:id/decision con grado y lo que marcó el alcoholímetro de repuesto en mg/L (decide el sistema, con el mismo umbral del equipo facial), marco-apto o marco-alcohol si no muestra el número, o no-es-la-persona. En tiempo real: verificacion-manual.",
    autenticacion: "JWT (Administrador / Vigilancia)",
    tipo: "real",
    headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
    ejemploRequest: `// POST /eventos-acceso/verificacion-manual
{ "motivo": "Alcoholímetro desconectado", "causa": "alcoholimetro" }

// POST /eventos-acceso/en-espera/77/decision
{ "decision": "grado", "grado": 0.000 }
{ "decision": "marco-apto" }        // el alcoholímetro no muestra el número`,
    ejemploRespuesta: `// GET /eventos-acceso/verificacion-manual
{ "activa": true, "periodo": { "id": 7, "motivo": "Alcoholímetro desconectado", "causa": "alcoholimetro", "desde": "2026-10-21T12:54:54.135Z", "activadaPor": "vigilante@empresa.com" } }

// POST …/decision
{ "ok": true, "autorizado": true }`,
    notas:
      "El ingreso queda marcado Manual con el grado (o sin número) y quién decidió, en el Panel y en el reporte (gradoManual, manualSinNumero). Activarla y terminarla quedan en la Auditoría. Con la verificación manual activa, la prueba del equipo facial y la tarjeta de contingencia no se usan.",
  },
  {
    nombre: "Ingresos en espera (Panel de vigilancia)",
    endpoint: "/eventos-acceso/en-espera",
    metodo: "GET",
    descripcion:
      "Lo que el Panel muestra mientras se completa un ingreso: en el orden DNI → Facial + Alcohol, los DNI en regla que esperan su prueba de rostro y alcohol (1 minuto); en facial primero, las aprobaciones del G4 Pro que esperan el DNI de quien sopló (Aprobó … pase su DNI, con su foto, 30 s). En tiempo real se avisan por WebSocket (/ws/eventos): ingreso-en-espera y ingreso-espera-terminada.",
    autenticacion: "JWT (Administrador / Vigilancia)",
    tipo: "real",
    headers: ["Authorization: Bearer <token>"],
    ejemploRequest: `GET /eventos-acceso/en-espera`,
    ejemploRespuesta: `// 200 OK
[
  {
    "id": 12,
    "personaId": 41,
    "nombres": "Juan",
    "apellidos": "Pérez",
    "numeroDocumento": "12345678",
    "empresa": "Empresa S.A.C.",
    "tieneFoto": true,
    "fotoVersion": "foto-3f2a9c1e.jpg",
    "torniqueteId": "Ingreso",
    "desde": "2026-10-04T09:02:19.000Z",
    "hasta": "2026-10-04T09:03:19.000Z",
    "enCola": false
  },
  // facial primero: aprobó y falta su DNI (id negativo: no es una espera de la base)
  {
    "id": -905,
    "personaId": 41,
    "nombres": "Aprobó Juan Pérez",
    "apellidos": "",
    "numeroDocumento": "12345678",
    "tieneFoto": true,
    "fotoVersion": "foto-3f2a9c1e.jpg",
    "desde": "2026-10-19T22:52:47.000Z",
    "hasta": "2026-10-19T22:53:02.000Z",
    "esperaDni": true,
    "enCola": false
  }
]`,
    notas: "fotoVersion cambia con cada foto nueva: el Panel la usa para no mostrar una foto vieja. La foto se pide aparte (GET /personas/:id/foto, con ?miniatura=1 la reducida de 160 px para las listas). En facial primero, un DNI que espera en silencio el aviso del G4 (hasta 8 s) no aparece en la lista. enCola solo se usa con el G4 en modo control de acceso (se habilita a una persona a la vez).",
  },
  {
    nombre: "Comando molinete (relés USB)",
    endpoint: "/integraciones/torniquete/comando",
    metodo: "POST",
    descripcion:
      "Abre un molinete a mano, sin DNI: para una emergencia o para probar un molinete. Con el servidor en la nube la orden va al controlador (mini PC), como cualquier apertura; sin el controlador conectado no se abre (enviado: false).",
    autenticacion: "JWT (Administrador)",
    tipo: "real",
    headers: ["Content-Type: application/json", "Authorization: Bearer <token>"],
    ejemploRequest: `{
  "torniqueteId": "ingreso",
  "comando": "abrir"
}`,
    ejemploRespuesta: `// 201 Created — orden enviada (false si el controlador o el relé no están conectados)
{ "enviado": true }`,
    notas:
      "torniqueteId: ingreso o salida. Cada molinete usa el módulo con su número de serie (RELE_INGRESO_SERIE / RELE_SALIDA_SERIE en .env). cerrar no hace nada: el molinete se cierra solo después del paso. Cada apertura queda en la Auditoría (apertura manual, con quién). En la mini PC como servidor local, da el pulso directo en su relé.",
  },
  {
    nombre: "Registro de personas y rostros en el G4 Pro (saliente)",
    endpoint: "/personas · /personas/:id/foto · /integraciones/g4pro/sincronizar",
    metodo: "POST",
    descripcion:
      "Al registrar o editar a una persona, el backend la carga en el G4 Pro con su DNI y su nombre (USERINFO en modo asistencia). Al subir su foto, se la envía convertida (JPG ≤ 20 KB) y el equipo la convierte en el rostro que reconoce: no hace falta registrar rostros a mano en el equipo. POST /integraciones/g4pro/sincronizar (solo Administrador; también a diario si se activa la revisión diaria) deja el equipo igual al sistema: consulta sus usuarios (DATA QUERY USERINFO), borra a quien el sistema no conoce (registrados a mano en el equipo), registra con foto al personal activo que falta y vuelve a poner los datos del sistema a quien tenga datos cambiados a mano en el equipo (contraseña, administrador, tarjeta o nombre; el rostro no cambia). Con ?simular=true solo informa qué haría. También desde la tarjeta Sincronización con el G4 Pro de esta página.",
    autenticacion: "JWT (Administrador)",
    tipo: "real",
    headers: ["Authorization: Bearer <token>", "Content-Type: multipart/form-data (para la foto)"],
    ejemploRequest: `// Foto de la persona (multipart/form-data)
foto: <archivo JPG, PNG o WEBP, máximo 5 MB>

// Sincronizar a todo el personal
POST /integraciones/g4pro/sincronizar`,
    ejemploRespuesta: `// Registro del backend:
Persona 12345678 encolada para 1 equipo(s), con foto

// POST /integraciones/g4pro/sincronizar → 201
{
  "simulacion": false,
  "equipos": 1,
  "agregadas": 0,
  "borradas": 1,
  "permisosQuitados": 0,
  "corregidas": 0,
  "usuariosABorrar": ["1"],
  "porEquipo": [
    {
      "serialNumber": "HSR3263100192",
      "usuarios": 2,
      "conRostro": 2,
      "sinRostro": []
    }
  ]
}`,
    notas:
      "Se registran con su número de documento (DNI, carné de extranjería o pasaporte: el equipo acepta letras, hasta 24 caracteres); los lectores, por ahora, solo reconocen el DNI. Si se cambia el número de documento, se borra el usuario anterior del equipo. En modo asistencia no hay permisos de paso (permisosQuitados siempre 0). La foto debe ser de frente, con buena luz y el rostro centrado. Vigilancia puede ver la foto (GET /personas/:id/foto) pero no subirla.",
  },
  {
    nombre: "Monitor del G4 Pro",
    endpoint: "/integraciones/g4pro/marcaciones",
    metodo: "GET",
    descripcion:
      "Las pruebas de rostro y alcohol que mandó el G4 Pro, por páginas y la más reciente primero (como el Panel: pagina, porPagina hasta 100, busqueda por nombre o DNI, desde/hasta AAAA-MM-DD según la llegada): hora del soplido y N.º de marcación, cuándo llegó y la demora, persona, grado, qué hizo el sistema con la prueba y el ingreso en que terminó. Lo usa la página Monitor del G4 Pro (botón Abrir monitor de esta página), que con el día de hoy se actualiza al instante con el evento g4-marcacion del canal en vivo (/ws/eventos).",
    autenticacion: "JWT (Administrador)",
    tipo: "real",
    headers: ["Authorization: Bearer <token>"],
    ejemploRequest: `GET /integraciones/g4pro/marcaciones?pagina=1&porPagina=10&desde=2026-10-19&hasta=2026-10-19`,
    ejemploRespuesta: `// 200
{
  "datos": [
    {
      "id": 30,
      "serialNumber": "HSR3263100192",
      "numero": 28,
      "faltanAntes": 0,
      "dni": "71988749",
      "persona": {
        "id": 7,
        "nombres": "Jose",
        "apellidos": "Vilchez",
        "tieneFoto": true,
        "fotoVersion": "foto-3f2a9c1e.jpg"
      },
      "horaPrueba": "2026-10-19T23:27:00.000Z",
      "llegada": "2026-10-19T23:27:02.000Z",
      "demoraSegundos": 2,
      "alcohol": "0.00g/L",
      "aprobado": true,
      "decision": "Aprobó: pase su DNI (30 s)",
      "ingreso": {
        "id": 500,
        "resultado": "autorizado",
        "motivo": "",
        "fechaHora": "2026-10-19T23:27:04.000Z"
      }
    }
  ],
  "total": 9,
  "pagina": 1,
  "porPagina": 10
}`,
    notas:
      "faltanAntes > 0: el número de marcación saltó, es decir, hubo pruebas que no llegaron al servidor (se compara con la prueba anterior del equipo aunque esté en otra página; con una búsqueda no se marca). decision queda vacía en las pruebas de antes del 20/10/2026. Solo lectura: no cambia nada en el equipo.",
  },
  {
    nombre: "Orden del ingreso",
    endpoint: "/eventos-acceso/modo-ingreso",
    metodo: "GET · PUT",
    descripcion:
      "Qué orden rige: DNI → Facial + Alcohol → Molinete (facialPrimero: false) o Facial + Alcohol → DNI → Molinete (facialPrimero: true). GET lo consulta (también el Panel de vigilancia); PUT lo cambia (solo Administrador; queda en la auditoría con quién y cuándo). Es la tarjeta Orden del ingreso de esta página.",
    autenticacion: "JWT (GET: Administrador / Vigilancia · PUT: Administrador)",
    tipo: "real",
    headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
    ejemploRequest: `PUT /eventos-acceso/modo-ingreso
{
  "facialPrimero": true
}`,
    ejemploRespuesta: `// 200
{
  "facialPrimero": true,
  "desde": "2026-10-20T08:36:57.000Z",
  "cambiadoPor": "admin@mollendo.local"
}`,
    notas:
      "El cambio rige al instante, sin reiniciar nada; los paneles abiertos lo reciben por el canal en vivo (evento modo-ingreso). desde y cambiadoPor son los del último cambio, en cualquiera de los dos sentidos.",
  },
  {
    nombre: "Revisión diaria del G4 Pro",
    endpoint: "/integraciones/g4pro/sincronizacion-diaria",
    metodo: "PUT",
    descripcion:
      "Activa la sincronización automática con el G4 Pro una vez al día, a la hora elegida (0 a 23, hora de Lima), o la desactiva (null). Es el interruptor Revisión diaria de la tarjeta Sincronización con el G4 Pro. El estado (activa, hora, desde y cambiadoPor) viene en GET /panel/estado-sistema, en sincronizacionG4.diaria.",
    autenticacion: "JWT (Administrador)",
    tipo: "real",
    headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
    ejemploRequest: `PUT /integraciones/g4pro/sincronizacion-diaria

// Activarla a las 00:00 (hora de 0 a 23)
{
  "hora": 0
}

// Desactivarla
{
  "hora": null
}`,
    ejemploRespuesta: `// 200
{
  "diaria": {
    "activa": true,
    "hora": 0,
    "desde": "2026-10-20T08:45:00.000Z",
    "cambiadoPor": "admin@mollendo.local"
  },
  "enCurso": false,
  "ultima": { … }
}`,
    notas:
      "Se guarda en el servidor (sobrevive a los reinicios). Si nunca se cambió desde el portal, vale G4PRO_HORA_SINCRONIZACION del .env. desde y cambiadoPor faltan si no se ha cambiado desde el 20/10/2026.",
  },
];
