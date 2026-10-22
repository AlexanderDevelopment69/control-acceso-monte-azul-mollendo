// Capturas del Manual: abre el portal local en un Chrome oculto (no toca el del
// usuario), entra con las cuentas iniciales de mollendo-api/.env, toma cada
// pantalla en tema claro y calcula dónde va cada número buscando el elemento por
// su texto. Deja las imágenes en public/manual/ y las posiciones en
// src/app/(admin)/manual/capturas.json.
//
// Uso (con la API y el portal locales corriendo, en mollendo-portal):
//   npm i --no-save puppeteer-core@24
//   node scripts/capturas-manual.mjs
// Solo algunas (las demás quedan como están):
//   CAPTURAS=verificacion-activar,verificacion-ventana node scripts/capturas-manual.mjs
//
// Usa datos de demostración (personas DEMO). Nunca ejecutarlo contra datos reales.
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { io } from "socket.io-client";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORTAL = process.env.PORTAL_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001/api/v1";
const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const ENV = fs.readFileSync(path.join(RAIZ, "..", "mollendo-api", ".env"), "utf8");
const valor = (k) => (ENV.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").replace(/^"|"$/g, "");

const SALIDA_IMG = path.join(RAIZ, "public", "manual");
const SALIDA_JSON = path.join(RAIZ, "src", "app", "(admin)", "manual", "capturas.json");
// Sin el aviso de fallas (en la PC de desarrollo los equipos no están) ni el botón de Next.js.
const OCULTAR = `nextjs-portal { display: none !important; }`;
const OCULTAR_AVISO = `section[aria-label="Avisos del sistema"] { display: none !important; }`;
// El área de contenido, sin la barra lateral ni la superior.
const CONTENIDO = { x: 290, y: 77, width: 1150 };

/**
 * Cada captura: ruta, qué hacer antes y los elementos numerados. Un punto es un
 * selector, o { sel, recuadro, lado, texto }: recuadro = selector del contenedor a
 * señalar (closest); lado = "izq" (por defecto), "der", "arriba" o "abajo", según
 * dónde haya espacio libre para el número, o dentro del elemento: "esquina"
 * (arriba a la derecha), "dentro-izq" o "texto-buscador" (después del texto de
 * ayuda de un buscador); texto = true mide solo el texto del
 * elemento (una etiqueta ocupa todo el ancho, su texto no). Los números van
 * dentro de la imagen y en espacios libres, sin tapar contenido.
 */
const CAPTURAS = [
  {
    clave: "personal",
    ruta: "/",
    preparar: async (p) => p.locator("::-p-text(Apaza Condori, Jorge Luis)").click(),
    completa: true,
    // Los de la lista van a su derecha, en el espacio entre la lista y la ficha.
    puntos: [
      { sel: 'input[placeholder*="Buscar por nombre, DNI o empresa"]', lado: "der" },
      { sel: 'button[aria-label="Perfil"]', lado: "der" },
      { sel: "::-p-text(No pueden)", recuadro: "div:has(> button)", lado: "der" },
      { sel: "::-p-text(Apaza Condori, Jorge Luis)", recuadro: "button", lado: "der" },
      { sel: "button::-p-text(Carga masiva)", lado: "abajo" },
      { sel: "button::-p-text(Nuevo personal)", lado: "abajo" },
      "::-p-text(Cambiar foto)",
      { sel: "button::-p-text(Editar datos)", lado: "abajo" },
      { sel: "::-p-text(Puede ingresar hoy)", texto: true, lado: "der" },
      "tbody button::-p-text(Ver)",
      "::-p-text(Agregar documento)",
      { sel: "h3::-p-text(Período de autorización)", texto: true, lado: "der" },
      { sel: "button::-p-text(Dar de baja)", lado: "abajo" },
    ],
  },
  {
    // El formulario de Nuevo personal (alto: necesita una ventana más alta).
    clave: "nuevo-personal",
    ruta: "/",
    preparar: async (p) => {
      await p.setViewport({ width: 1440, height: 1500, deviceScaleFactor: 2 });
      await p.locator("button::-p-text(Nuevo personal)").click();
      await p.waitForFunction(() => document.body.innerText.includes("Registrar personal y documentos"));
    },
    despues: async (p) => p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 }),
    elemento: { sel: "h2::-p-text(Nuevo personal)", recuadro: ".rounded-3xl" },
    puntos: [
      { sel: "label::-p-text(Perfil)", texto: true, lado: "der" },
      { sel: "label::-p-text(Empresa)", texto: true, lado: "der" },
      { sel: "::-p-text(¿No está?)", texto: true, lado: "der" },
      { sel: "label::-p-text(Número de documento)", texto: true, lado: "der" },
      { sel: "p::-p-text(Foto del personal)", texto: true, lado: "der" },
      { sel: "p::-p-text(Período de autorización)", texto: true, lado: "der" },
      { sel: "label::-p-text(Vence el)", texto: true, lado: "der" },
      { sel: "button::-p-text(Agregar otro documento)", lado: "der" },
      { sel: "button::-p-text(Registrar personal y documentos)", lado: "dentro-izq" },
    ],
  },
  {
    clave: "carga-masiva",
    ruta: "/",
    preparar: async (p) => {
      await p.locator("button::-p-text(Carga masiva)").click();
      await p.waitForFunction(() => document.body.innerText.includes("Revisar archivo"));
    },
    elemento: { sel: "button::-p-text(Revisar archivo)", recuadro: ".rounded-3xl" },
    puntos: [
      { sel: "::-p-text(Descargue la plantilla de Excel)", recuadro: "ol", lado: "esquina" },
      { sel: "button::-p-text(Descargar plantilla)", lado: "der" },
      { sel: "p::-p-text(Excel con el personal)", texto: true, lado: "der" },
      { sel: "button::-p-text(Revisar archivo)", lado: "arriba" },
    ],
  },
  {
    // La revisión de un Excel de ejemplo con errores (solo se revisa: no se guarda nada).
    clave: "carga-revision",
    ruta: "/",
    preparar: async (p) => {
      await p.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 2 });
      await p.locator("button::-p-text(Carga masiva)").click();
      await p.waitForFunction(() => document.body.innerText.includes("Revisar archivo"));
      const entrada = await p.$('input[type="file"]');
      await entrada.uploadFile(await excelDeEjemplo());
      await p.locator("button::-p-text(Revisar archivo)").click();
      await p.waitForFunction(() => document.body.innerText.includes("Descargar filas con error"), { timeout: 15000 });
    },
    despues: async (p) => p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 }),
    elemento: { sel: "button::-p-text(Elegir otro archivo)", recuadro: ".rounded-3xl" },
    puntos: [
      { sel: "::-p-text(El archivo tiene errores)", texto: true, lado: "der" },
      { sel: "button::-p-text(Con error)", lado: "der" },
      { sel: "tbody tr td:last-child span.block", texto: true, lado: "der" },
      { sel: "button::-p-text(Descargar filas con error)", lado: "der" },
      { sel: "button::-p-text(Corrija las filas con error)", lado: "izq" },
    ],
  },
  {
    clave: "empresas",
    ruta: "/empresas",
    alto: 760,
    puntos: [
      { sel: 'input[placeholder*="Buscar por razón social"]', lado: "texto-buscador" },
      'button[aria-label="Estado"]',
      "::-p-text(Personal activo)",
      { sel: "button::-p-text(Desactivar)", lado: "der" },
      { sel: "button::-p-text(Nueva empresa)", lado: "izq" },
    ],
  },
  {
    clave: "presentes",
    ruta: "/dashboard/presentes",
    // Con el lector de salida desconectado (controlador simulado), para que se vean los botones "Salida".
    preparar: async (p) => {
      lectorSalida(false);
      await espera(2000);
      await p.reload({ waitUntil: "networkidle2" });
      await p.addStyleTag({ content: OCULTAR + OCULTAR_AVISO });
      await p.waitForFunction(() => [...document.querySelectorAll("tbody button")].some((b) => b.innerText.trim() === "Salida"));
    },
    despues: async () => lectorSalida(true),
    alto: 1180,
    puntos: [
      { sel: 'input[placeholder*="Buscar por nombre, DNI o empresa"]', lado: "texto-buscador" },
      'button[aria-label="Perfil"]',
      { sel: "button::-p-text(Descargar Excel)", lado: "arriba" },
      "::-p-text(Tiempo dentro)",
      { sel: "::-p-text(Mostrando)", texto: true, lado: "der" },
      { sel: "tbody button::-p-text(Salida)", lado: "arriba" },
    ],
  },
  {
    clave: "vigilancia",
    ruta: "/vigilancia",
    preparar: async (p) => p.locator("::-p-text(Todos los días)").click(),
    alto: 640,
    puntos: [
      // Los números van en espacios libres, sin tapar contenido.
      { sel: "::-p-text(Accesos restringidos hoy)", recuadro: ".rounded-xl", lado: "esquina" },
      // El 2 junto al texto del buscador; el 3 en el espacio libre del buscador, pegado al filtro de fecha.
      { sel: 'input[placeholder*="Buscar por nombre o DNI"]', lado: "texto-buscador" },
      { sel: 'input[placeholder="Todos los días"]', lado: "izq" },
      { sel: "::-p-text(Denegado)", lado: "der" },
      // El motivo de la primera fila denegada (siempre dentro de la captura).
      { sel: "tbody tr td:last-child span", lado: "der" },
    ],
  },
  {
    clave: "dashboard",
    ruta: "/dashboard",
    preparar: async (p) => p.locator("::-p-text(Este mes)").click(),
    alto: 640,
    puntos: [
      { sel: "button::-p-text(Este mes)", recuadro: "div", lado: "der" },
      { sel: "::-p-text(Presentes actualmente)", recuadro: ".border", lado: "esquina" },
      { sel: "::-p-text(Comparativa de ingresos)", recuadro: ".border", lado: "esquina" },
      { sel: "::-p-text(Permanencia mayor)", recuadro: ".border", lado: "arriba" },
    ],
  },
  {
    clave: "reportes",
    ruta: "/reportes",
    // Documentos por persona: muestra también las opciones del ZIP (anteriores y fotos).
    preparar: async (p) => p.locator("button ::-p-text(Documentos por persona)").click(),
    alto: 1000,
    puntos: [
      { sel: "button ::-p-text(Documentos por persona)", recuadro: "button", lado: "esquina" },
      { sel: "label::-p-text(Empresa)", texto: true, lado: "der" },
      { sel: "::-p-text(Incluir las fotos del personal)", texto: true, lado: "der" },
      { sel: "button::-p-text(Descargar Excel)", lado: "izq" },
      { sel: "button::-p-text(Descargar con archivos)", lado: "der" },
    ],
  },
  {
    // Solo la tarjeta de sincronización (recorte = el elemento, con un margen).
    clave: "sincronizacion",
    ruta: "/sistema",
    elemento: { sel: "::-p-text(Sincronización con el G4 Pro)", recuadro: ".rounded-xl" },
    puntos: [
      'button[role="switch"]',
      { sel: "button::-p-text(Simular)", lado: "arriba" },
      { sel: "button::-p-text(Sincronizar ahora)", lado: "arriba" },
      { sel: "::-p-text(Última:)", recuadro: ".rounded-lg", lado: "esquina" },
    ],
  },
  {
    clave: "sistema",
    ruta: "/sistema",
    conAviso: true,
    alto: 1010,
    puntos: [
      { sel: "::-p-text(Revisado)", texto: true, lado: "der" },
      { sel: "::-p-text(Backend (mollendo-api))", recuadro: ".rounded-2xl", lado: "esquina" },
      { sel: "::-p-text(Equipos de acceso)", texto: true, lado: "der" },
    ],
  },
  {
    clave: "auditoria",
    ruta: "/auditoria",
    // Buscando "equipos", como dice el manual: se ven las desconexiones (en la PC de desarrollo no hay equipos).
    preparar: async (p) => {
      await p.locator('input[placeholder*="Buscar por usuario"]').fill("equipos");
      await p.waitForFunction(() => [...document.querySelectorAll("td")].some((td) => td.innerText.trim() === "Sistema"));
      await espera(800);
    },
    alto: 640,
    puntos: [
      { sel: 'input[placeholder*="Buscar por usuario"]', lado: "texto-buscador" },
      { sel: 'input[placeholder="Desde"]', lado: "izq" },
      { sel: "th::-p-text(Dato)", texto: true, lado: "der" },
      { sel: "th::-p-text(Acción)", texto: true, lado: "der" },
      // Una desconexión de equipo (a nombre de "Sistema").
      { sel: "td::-p-text(Sistema)", texto: true, lado: "der" },
    ],
  },
  {
    clave: "contrasena",
    ruta: "/vigilancia",
    preparar: async (p) => {
      await p.locator("header button::-p-text(Administrador)").click();
      await p.locator("button::-p-text(Cambiar contraseña)").click();
      await p.waitForFunction(() => document.body.innerText.includes("Repita la contraseña nueva"));
    },
    elemento: { sel: "::-p-text(Repita la contraseña nueva)", recuadro: ".rounded-3xl" },
    puntos: [
      { sel: "label::-p-text(Contraseña actual)", texto: true, lado: "der" },
      { sel: "label::-p-text(Contraseña nueva)", texto: true, lado: "der" },
      { sel: "label::-p-text(Repita la contraseña nueva)", texto: true, lado: "der" },
      { sel: 'button[type="submit"]', lado: "arriba" },
    ],
  },
  {
    // Verificación manual (contingencias, sección 4): el aviso del terminal facial
    // caído en la franja roja, con su botón. En la PC de desarrollo no hay G4: sale caído.
    clave: "verificacion-activar",
    ruta: "/vigilancia",
    conAviso: true,
    preparar: async () => verificacionManual("DELETE"),
    elemento: { sel: "::-p-text(Activar verificación manual)", recuadro: "li" },
    puntos: [
      { sel: "::-p-text(Terminal facial)", lado: "izq" },
      { sel: "button::-p-text(Activar verificación manual)", lado: "der" },
    ],
  },
  {
    // La ventana de decisión: se activa la verificación manual y una persona DEMO
    // en regla "pasa su DNI" (con la clave de equipos, como el lector).
    clave: "verificacion-ventana",
    ruta: "/vigilancia",
    preparar: async (p) => {
      await verificacionManual("POST", { motivo: "Terminal facial desconectado" });
      await p.reload({ waitUntil: "networkidle2" });
      await p.addStyleTag({ content: OCULTAR + OCULTAR_AVISO });
      await pasarDni("99010001");
      await p.waitForFunction(() => document.body.innerText.includes("Verificación manual de ingreso"), { timeout: 15000 });
    },
    elemento: { sel: "::-p-text(Verificación manual de ingreso)", recuadro: "[class*='max-w-xl']" },
    // Al terminar: se decide (para no dejar la espera abierta) y se vuelve a modo normal.
    despues: async (p) => {
      await p.locator("button::-p-text(No es la persona)").click();
      await espera(1500);
      await verificacionManual("DELETE");
    },
    puntos: [
      { sel: "::-p-text(Tiempo para decidir)", lado: "izq" },
      { sel: "::-p-text(Documentos vigentes)", lado: "der" },
      { sel: "::-p-text(Compare el rostro con la foto)", recuadro: "ol", lado: "der" },
      { sel: "button::-p-text(Registrar prueba)", lado: "arriba" },
      { sel: "button::-p-text(Mi alcoholímetro no muestra el número)", lado: "der" },
      { sel: "button::-p-text(No es la persona)", lado: "arriba" },
    ],
  },
];

/**
 * Controlador simulado (solo en la PC de desarrollo): informa los dos lectores y
 * relés conectados salvo el lector de salida (conectado = false). Con true se
 * desconecta y deja de simularse.
 */
let controladorSimulado = null;
function lectorSalida(conectado) {
  if (conectado) {
    if (controladorSimulado) {
      clearInterval(controladorSimulado.reporte);
      controladorSimulado.socket.close();
      controladorSimulado = null;
    }
    return;
  }
  const socket = io(API.replace(/\/api\/v1$/, "") + "/ws/controlador", {
    path: "/api/v1/socket.io",
    auth: { clave: valor("DEVICE_API_KEY") },
    transports: ["websocket"],
  });
  const rele = { conectado: true, serie: "ING01", canal: 1, ultimoPulso: null, error: null };
  const lector = (c) => ({ configurado: true, conectado: c, ultimaLectura: null, error: null });
  const informar = () =>
    socket.emit("estado", {
      lectoresDni: { ingreso: lector(true), salida: lector(false) },
      releMolinetes: { ingreso: rele, salida: { ...rele, serie: "SAL01" } },
      listaPersonal: { personas: 0, actualizado: null },
      salidasPendientes: 0,
    });
  socket.on("connect", informar);
  controladorSimulado = { socket, reporte: setInterval(informar, 3000) };
}

/** Activa (POST) o termina (DELETE) la verificación manual con la cuenta del administrador. */
async function verificacionManual(method, body) {
  await fetch(`${API}/eventos-acceso/verificacion-manual`, {
    method,
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    ...(body && { body: JSON.stringify(body) }),
  });
}

/** Un DNI por el "lector de ingreso" (clave de equipos de mollendo-api/.env). */
async function pasarDni(numeroDocumento) {
  await fetch(`${API}/eventos-acceso/ingreso`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": valor("DEVICE_API_KEY") },
    body: JSON.stringify({ tipoDocumentoIdentidad: "DNI", numeroDocumento }),
  });
}

/**
 * Excel de ejemplo para la carga masiva: 3 filas listas, 1 ya registrada y 2 con
 * error. Solo se revisa (la captura no registra a nadie).
 */
async function excelDeEjemplo() {
  const ExcelJS = createRequire(path.join(RAIZ, "..", "mollendo-api", "package.json"))("exceljs");
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet("Personal");
  hoja.addRow(["Perfil", "Empresa", "Tipo de documento", "Número de documento", "Nombres", "Apellidos"]);
  const empresa = "DEMO Transportes del Sur S.A.C.";
  for (const fila of [
    ["Contratista", empresa, "DNI", "99095001", "Rosa María", "Quispe Huamán"],
    ["Conductor", empresa, "DNI", "9909502", "Carlos", "Mamani Flores"],
    ["Contratista", "Transportes Inventados S.A.C.", "DNI", "99095003", "Luis Alberto", "Ccama Ticona"],
    ["Conductor", empresa, "DNI", "99010001", "Jorge Luis", "Apaza Condori"],
    ["Visita", empresa, "DNI", "99095005", "Ana Lucía", "Torres Vela"],
    ["Contratista", empresa, "DNI", "99095006", "Pedro", "Chávez Rojas"],
  ]) {
    hoja.addRow(fila);
  }
  const archivo = path.join(os.tmpdir(), "manual-carga-masiva-ejemplo.xlsx");
  await libro.xlsx.writeFile(archivo);
  return archivo;
}

const SOLO = process.env.CAPTURAS?.split(",").map((c) => c.trim()).filter(Boolean);

async function sesion(rol) {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: valor(`${rol}_SEED_EMAIL`), password: valor(`${rol}_SEED_PASSWORD`) }),
  });
  if (!r.ok) throw new Error(`No se pudo iniciar sesión como ${rol}: ${r.status}`);
  return r.json();
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

fs.mkdirSync(SALIDA_IMG, { recursive: true });
const navegador = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
});
const pagina = await navegador.newPage();
const { accessToken, refreshToken } = await sesion("ADMIN");
// La sesión del portal va en las cookies de la API (las mismas que deja el inicio de sesión).
const { hostname } = new URL(API);
await pagina.setCookie(
  { name: "mollendo_sesion", value: accessToken, domain: hostname, path: "/api/v1", httpOnly: true, sameSite: "Strict" },
  { name: "mollendo_renovacion", value: refreshToken, domain: hostname, path: "/api/v1/auth", httpOnly: true, sameSite: "Strict" },
);
await pagina.goto(`${PORTAL}/iniciar-sesion`, { waitUntil: "networkidle2" });
await pagina.evaluate(() => localStorage.setItem("theme", "light"));

// Con CAPTURAS=…, las demás se conservan tal como están.
const resultado = SOLO ? JSON.parse(fs.readFileSync(SALIDA_JSON, "utf8")) : {};
for (const c of CAPTURAS.filter((c) => !SOLO || SOLO.includes(c.clave))) {
  await pagina.goto(`${PORTAL}${c.ruta}`, { waitUntil: "networkidle2" });
  await pagina.addStyleTag({ content: OCULTAR + (c.conAviso ? "" : OCULTAR_AVISO) });
  await espera(2000);
  if (c.preparar) {
    await c.preparar(pagina);
    await espera(2500);
  }
  const altoPagina = await pagina.evaluate(() => document.documentElement.scrollHeight);
  let recorte = { ...CONTENIDO, height: (c.completa ? altoPagina : (c.alto ?? 823) + CONTENIDO.y) - CONTENIDO.y };
  if (c.elemento) {
    const el = await pagina.$(c.elemento.sel);
    const objetivo = c.elemento.recuadro ? await el.evaluateHandle((e, r) => e.closest(r) ?? e, c.elemento.recuadro) : el;
    // Sin desplazar la página: las cajas quedan en coordenadas de la página, como el recorte.
    const caja = await objetivo.boundingBox();
    const margen = 16;
    recorte = { x: caja.x - margen, y: caja.y - margen, width: caja.width + 2 * margen, height: caja.height + 2 * margen };
  }
  const puntos = [];
  for (const [i, punto] of c.puntos.entries()) {
    const { sel, recuadro, lado = "izq", texto = false } = typeof punto === "string" ? { sel: punto } : punto;
    // La primera coincidencia visible (puede haber copias ocultas del mismo texto).
    let caja = null;
    for (const el of await pagina.$$(sel)) {
      const objetivo = recuadro ? await el.evaluateHandle((e, r) => e.closest(r) ?? e, recuadro) : el;
      caja = await objetivo.boundingBox();
      if (caja && texto) {
        // Solo el texto: la caja de su contenido, en coordenadas de la página (sin desplazar, como boundingBox).
        caja = await objetivo.evaluate((e) => {
          const rango = document.createRange();
          rango.selectNodeContents(e);
          const b = rango.getBoundingClientRect();
          return { x: b.x, y: b.y, width: b.width, height: b.height };
        });
      }
      if (caja && caja.width > 0 && caja.height > 0) break;
      caja = null;
    }
    if (!caja) throw new Error(`${c.clave}: no se encontró el punto ${i + 1} (${sel})`);
    // Buscador: después de su texto de ayuda (medido con la letra del campo).
    const finAyuda =
      lado === "texto-buscador"
        ? await pagina.$eval(sel, (e) => {
            const estilo = getComputedStyle(e);
            const lienzo = document.createElement("canvas").getContext("2d");
            lienzo.font = `${estilo.fontWeight} ${estilo.fontSize} ${estilo.fontFamily}`;
            return parseFloat(estilo.paddingLeft) + lienzo.measureText(e.placeholder).width + 10;
          })
        : 0;
    const x =
      lado === "texto-buscador"
        ? caja.x + finAyuda
        : lado === "esquina"
          ? caja.x + caja.width - 8
          : lado === "dentro-izq"
            ? caja.x + 44
            : lado === "der"
              ? caja.x + caja.width
              : lado === "arriba" || lado === "abajo"
                ? caja.x + caja.width / 2
                : caja.x;
    const y =
      lado === "arriba" ? caja.y : lado === "abajo" ? caja.y + caja.height : lado === "esquina" ? caja.y + 18 : caja.y + caja.height / 2;
    puntos.push({
      n: i + 1,
      x: +(((x - recorte.x) / recorte.width) * 100).toFixed(2),
      y: +(((y - recorte.y) / recorte.height) * 100).toFixed(2),
      // En la página solo hay cuatro lados: "esquina" y "dentro-izq" quedan a la izquierda del punto; el buscador, a la derecha.
      lado: lado === "esquina" || lado === "dentro-izq" ? "izq" : lado === "texto-buscador" ? "der" : lado,
    });
  }
  const archivo = `${c.clave}.webp`;
  await pagina.screenshot({ path: path.join(SALIDA_IMG, archivo), type: "webp", quality: 82, clip: recorte, captureBeyondViewport: true });
  resultado[c.clave] = { imagen: `/manual/${archivo}`, ancho: recorte.width, alto: recorte.height, puntos };
  console.log(`ok ${archivo} (${puntos.length} puntos)`);
  if (c.despues) await c.despues(pagina);
}
await navegador.close();
fs.writeFileSync(SALIDA_JSON, `${JSON.stringify(resultado, null, 2)}\n`);
console.log(`posiciones en ${path.relative(RAIZ, SALIDA_JSON)}`);
