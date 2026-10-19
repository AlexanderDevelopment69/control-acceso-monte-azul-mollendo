/** APIs con las que se integran los equipos de la garita, con ejemplos para la lista de "Sistema y APIs". */
export interface ApiIntegracion {
  nombre: string;
  endpoint: string;
  metodo: "POST" | "GET" | "RS232" | "USB";
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
    nombre: "Terminal ZKTeco G4 Pro + alcoholímetro (protocolo PUSH de control de acceso)",
    endpoint: "/iclock/registry · /iclock/push · /iclock/getrequest · /iclock/devicecmd · /iclock/cdata · /iclock/querydata",
    metodo: "POST",
    descripcion:
      "El G4 Pro se conecta directo a la mini PC con el protocolo PUSH del fabricante, en su variante de control de acceso (ACC). Por ahí recibe las personas (user, con el DNI como número de usuario), su nombre (extuser), su foto (biophoto, que el equipo convierte en el rostro que reconoce) y el permiso de paso mientras esperan su ingreso (userauthorize). Envía cada verificación (rostro + alcohol, table=rtlog), el estado del sensor y del relé (table=rtstate) y las respuestas a las consultas (querydata).",
    autenticacion: "Número de serie (G4PRO_SN_PERMITIDOS) e IP de la sede (G4PRO_IPS_PERMITIDAS): el equipo no manda ningún token — las rutas /iclock/* no llevan X-API-Key",
    tipo: "real",
    headers: ["El equipo no manda Content-Type reconocible; el servidor siempre lee el cuerpo como texto plano"],
    ejemploRequest: `// El equipo se registra una vez y abre sesión:
POST /iclock/registry?SN=HSR3263100192
POST /iclock/push?SN=HSR3263100192

// Órdenes que la mini PC le deja (las recoge al consultar /iclock/getrequest; campos separados por tabulador):
DATA UPDATE user CardNo=\tPin=12345678\tPassword=\tGroup=0\tStartTime=0\tEndTime=0\tName=Juan Pérez\tPrivilege=0
DATA UPDATE extuser Pin=12345678\tFunSwitch=0\tFirstName=Juan\tLastName=Pérez\tPersonalVs=0
DATA UPDATE biophoto PIN=12345678\tType=9\tSize=…\tContent=<foto JPG ≤ 20 KB en base64>\tFormat=0\tUrl=\tPostBackTmpFlag=0
DATA UPDATE userauthorize Pin=12345678\tAuthorizeTimezoneId=1\tAuthorizeDoorId=1   // habilitar
DATA DELETE userauthorize Pin=12345678\tAuthorizeDoorId=1                           // deshabilitar`,
    ejemploRespuesta: `// El servidor responde al registro:
RegistryCode=d6b7cbaab9   // estable, mismo código para el mismo equipo siempre

// Cada verificación (table=rtlog):
POST /iclock/cdata?SN=HSR3263100192&table=rtlog
time=2026-10-04 04:02:41\tpin=0\tevent=0\tverifytype=15\tConcentration=0\t...         // permitido
time=2026-10-04 04:00:37\tpin=12345678\tevent=23\tverifytype=15\tConcentration=0\t... // sin permiso`,
    notas:
      "Probado con el equipo real HSR3263100192 (04/oct/2026). Los comandos de asistencia (USERINFO) no sirven en este equipo: los rechaza con -629. event=0: permitido (llega con pin=0; en el orden normal solo puede ser la persona en su turno, porque se habilita a una sola a la vez; en \"facial primero\" el DNI de quien sopló se lee del rastreo del equipo, /sdcard/ZKTeco/trace/VerifySuccess.txt, con el comando SHELL). event=1: alcohol sobre el umbral del equipo. event=23: rostro reconocido sin permiso, con su DNI. event=27: rostro, huella o tarjeta no registrados. El valor de alcohol no se envía (Concentration=0): el umbral se configura en el propio G4 Pro. RegistryCode y /iclock/push no están en los manuales de ZKTeco, pero sin ellos el equipo no envía datos.",
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
      "El lector viene en modo USB: se configura con el folleto de la caja (Factory Default → RS232 → 115200). Se ignora la misma lectura dentro de 3 s; si el adaptador se desconecta, se reintenta cada 5 s. El estado (Cable conectado / desconectado) corresponde al cable de datos, no a la energía del lector.",
  },
  {
    nombre: "Ingreso",
    endpoint: "/eventos-acceso/ingreso",
    metodo: "POST",
    descripcion:
      "Fase 1: solo el DNI (lo usan los lectores; también se puede llamar con la clave de equipo). Si la persona no está registrada, está de baja, no tiene documentos o tiene alguno vencido, se deniega aquí mismo. Si está en regla, queda \"en espera\": se la habilita en el G4 Pro por 1 minuto (o queda en cola si otra persona está en su turno; se habilita a una a la vez). El resultado llega del G4 Pro (table=rtlog): permitido → ingreso autorizado y relé de ingreso; sin resultado en 1 minuto → denegado \"No completó rostro y alcohol\".",
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

// 201 Created — denegado de inmediato (documentos, baja)
{
  "eventoId": 43,
  "tipoMovimiento": "ingreso",
  "resultado": "denegado",
  "persona": { "id": 2, "nombres": "Ana", "apellidos": "Torres" },
  "numeroDocumento": "87654321",
  "motivos": { "dadoDeBaja": false, "sinDocumentos": false, "documentos": true, "documentosVencidos": ["SCTR"] }
}

// 201 Created — documento no registrado (queda en el historial sin persona)
{ "eventoId": 45, "resultado": "denegado", "persona": null, "numeroDocumento": "99999999", "motivos": { "personaNoRegistrada": true } }

// 401 — X-API-Key inválida o ausente`,
    notas:
      "Si la misma persona vuelve a pasar el DNI mientras espera, mantiene su lugar. En cola puede esperar hasta 3 minutos. Las esperas vencidas se revisan cada 5 segundos. event=1 del G4 Pro: denegado por alcohol (confirmado). Cualquier otro código desconocido también se deniega por alcohol: ante la duda, no se abre.",
  },
  {
    nombre: "Salida",
    endpoint: "/eventos-acceso/salida",
    metodo: "POST",
    descripcion:
      "Registro de salida: con un documento registrado (aunque la persona esté dada de baja o tenga documentos vencidos) se autoriza y se activa el relé de salida.",
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
{ "eventoId": 46, "resultado": "denegado", "persona": null, "numeroDocumento": "99999999", "motivos": { "personaNoRegistrada": true } }`,
    notas:
      "Sin antipassback (alcance base): no se exige un ingreso previo ni se bloquea un segundo ingreso sin salida. Solo se deniega si el documento no está registrado.",
  },
  {
    nombre: "Ingresos en espera (Panel de vigilancia)",
    endpoint: "/eventos-acceso/en-espera",
    metodo: "GET",
    descripcion:
      "DNI en regla que esperan el rostro y el alcohol del G4 Pro (en su turno o en cola), para mostrarlos en el Panel. En tiempo real se avisan por WebSocket (/ws/eventos): ingreso-en-espera y ingreso-espera-terminada.",
    autenticacion: "JWT (Administrador / Vigilancia)",
    tipo: "real",
    headers: ["Authorization: Bearer <token>"],
    ejemploRequest: `GET /eventos-acceso/en-espera`,
    ejemploRespuesta: `// 200 OK
[{
  "id": 12, "personaId": 41, "nombres": "Juan", "apellidos": "Pérez", "numeroDocumento": "12345678",
  "empresa": "Empresa S.A.C.", "tieneFoto": true, "torniqueteId": "Ingreso",
  "desde": "2026-10-04T09:02:19.000Z", "hasta": "2026-10-04T09:03:19.000Z", "enCola": false
}]`,
    notas: "enCola = true: otra persona está en su turno; entonces hasta es null y no corre el minuto todavía.",
  },
  {
    nombre: "Comando molinete (relés USB)",
    endpoint: "/integraciones/torniquete/comando",
    metodo: "POST",
    descripcion:
      "Abre un molinete con un pulso de 1 segundo en su relé (módulos USB DCTTECH, uno por molinete). El backend lo hace solo en cada salida autorizada y en cada ingreso que el G4 Pro aprueba; también se puede llamar a mano para probar un relé.",
    autenticacion: "JWT (Administrador / Vigilancia)",
    tipo: "real",
    headers: ["Content-Type: application/json", "Authorization: Bearer <token>"],
    ejemploRequest: `{
  "torniqueteId": "ingreso",
  "comando": "abrir"
}`,
    ejemploRespuesta: `// 200 OK — relé activado (false si el módulo no está conectado)
{ "enviado": true }`,
    notas:
      "torniqueteId: \"ingreso\" o \"salida\". Cada molinete usa el módulo con su número de serie (RELE_INGRESO_SERIE / RELE_SALIDA_SERIE en .env). \"cerrar\" no hace nada: el molinete se cierra solo después del paso.",
  },
  {
    nombre: "Registro de personas y rostros en el G4 Pro (saliente)",
    endpoint: "/personas · /personas/:id/foto · /integraciones/g4pro/sincronizar",
    metodo: "POST",
    descripcion:
      "Al registrar o editar a una persona, el backend la carga en el G4 Pro con su DNI y su nombre, sin permiso de paso. Al subir su foto, se la envía convertida (JPG ≤ 20 KB) y el equipo la convierte en el rostro que reconoce: no hace falta registrar rostros a mano en el equipo. POST /integraciones/g4pro/sincronizar (solo Administrador; también todos los días a medianoche) deja el equipo igual al sistema: borra a quien el sistema no conoce (registrados a mano en el equipo), quita permisos de paso sueltos, registra con foto al personal activo que falta y vuelve a poner los datos del sistema a quien tenga datos cambiados a mano en el equipo (contraseña, administrador, tarjeta o nombre; el rostro no cambia). Con ?simular=true solo informa qué haría. También desde la tarjeta \"Sincronización con el G4 Pro\" de esta página.",
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
{ "simulacion": false, "equipos": 1, "agregadas": 16, "borradas": 1, "permisosQuitados": 1, "usuariosABorrar": ["777"] }`,
    notas:
      "Se registran con su número de documento (DNI, carné de extranjería o pasaporte: el equipo acepta letras, hasta 24 caracteres); los lectores, por ahora, solo reconocen el DNI. Si se cambia el número de documento, se borra el usuario anterior del equipo. La foto debe ser de frente, con buena luz y el rostro centrado. Vigilancia puede ver la foto (GET /personas/:id/foto) pero no subirla.",
  },
];
