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
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

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
 * selector, o { sel, recuadro, lado }: recuadro = selector del contenedor a
 * señalar (closest), lado = "izq" (por defecto), "der" o "arriba", según dónde
 * haya espacio libre para el número.
 */
const CAPTURAS = [
  {
    clave: "personal",
    ruta: "/",
    preparar: async (p) => p.locator("::-p-text(Apaza Condori, Jorge Luis)").click(),
    completa: true,
    puntos: [
      'input[placeholder*="Buscar por nombre, DNI o empresa"]',
      'button[aria-label="Perfil"]',
      "::-p-text(No pueden)",
      { sel: "::-p-text(Apaza Condori, Jorge Luis)", recuadro: "button" },
      "button::-p-text(Carga masiva)",
      "::-p-text(Nuevo personal)",
      "::-p-text(Cambiar foto)",
      "::-p-text(Editar datos)",
      "::-p-text(Puede ingresar hoy)",
      "button::-p-text(Ver)",
      "::-p-text(Agregar documento)",
    ],
  },
  {
    clave: "empresas",
    ruta: "/empresas",
    alto: 760,
    puntos: [
      'input[placeholder*="Buscar por razón social"]',
      'button[aria-label="Estado"]',
      "::-p-text(Personal activo)",
      { sel: "button::-p-text(Desactivar)", lado: "der" },
      { sel: "button::-p-text(Nueva empresa)", lado: "izq" },
    ],
  },
  {
    clave: "presentes",
    ruta: "/dashboard/presentes",
    alto: 1010,
    puntos: [
      'input[placeholder*="Buscar por nombre, DNI o empresa"]',
      'button[aria-label="Perfil"]',
      { sel: "button::-p-text(Descargar Excel)", lado: "der" },
      "::-p-text(Tiempo dentro)",
      "::-p-text(Mostrando)",
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
      { sel: "button::-p-text(Todos los días)", lado: "izq" },
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
      { sel: "button::-p-text(Este mes)", recuadro: "div" },
      { sel: "::-p-text(Presentes actualmente)", recuadro: ".border" },
      { sel: "::-p-text(Comparativa de ingresos)", recuadro: ".border" },
      { sel: "::-p-text(Permanencia mayor)", recuadro: ".border" },
    ],
  },
  {
    clave: "reportes",
    ruta: "/reportes",
    // Documentos por persona: muestra también las opciones del ZIP (anteriores y fotos).
    preparar: async (p) => p.locator("button ::-p-text(Documentos por persona)").click(),
    alto: 830,
    puntos: [
      { sel: "button ::-p-text(Documentos por persona)", recuadro: "button" },
      "::-p-text(Empresa)",
      { sel: "::-p-text(Incluir las fotos del personal)", recuadro: "label", lado: "der" },
      "::-p-text(Descargar Excel)",
      { sel: "::-p-text(Descargar con archivos)", lado: "der" },
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
      { sel: "::-p-text(Última:)", recuadro: ".rounded-lg" },
    ],
  },
  {
    clave: "sistema",
    ruta: "/sistema",
    conAviso: true,
    alto: 1010,
    puntos: [
      { sel: "::-p-text(equipos con problemas)", recuadro: "section" },
      { sel: "::-p-text(Backend (mollendo-api))", recuadro: ".rounded-2xl" },
      "::-p-text(Equipos de acceso)",
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
      { sel: "button::-p-text(Apto: abrir)", lado: "arriba" },
      { sel: "button::-p-text(Alcohol: no apto)", lado: "arriba" },
      { sel: "button::-p-text(No es la persona)", lado: "arriba" },
    ],
  },
];

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
await pagina.goto(`${PORTAL}/iniciar-sesion`, { waitUntil: "networkidle2" });
await pagina.evaluate(
  (a, r) => {
    localStorage.setItem("mollendo_access_token", a);
    localStorage.setItem("mollendo_refresh_token", r);
    localStorage.setItem("theme", "light");
  },
  accessToken,
  refreshToken,
);

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
    const { sel, recuadro, lado = "izq" } = typeof punto === "string" ? { sel: punto } : punto;
    // La primera coincidencia visible (puede haber copias ocultas del mismo texto).
    let caja = null;
    for (const el of await pagina.$$(sel)) {
      const objetivo = recuadro ? await el.evaluateHandle((e, r) => e.closest(r) ?? e, recuadro) : el;
      caja = await objetivo.boundingBox();
      if (caja && caja.width > 0 && caja.height > 0) break;
      caja = null;
    }
    if (!caja) throw new Error(`${c.clave}: no se encontró el punto ${i + 1} (${sel})`);
    const x = lado === "texto-buscador" ? caja.x + caja.width * 0.29 : lado === "dentro-der" || lado === "esquina" ? caja.x + caja.width - 8 : lado === "der" ? caja.x + caja.width : lado === "arriba" ? caja.x + caja.width / 2 : caja.x;
    const y = lado === "arriba" ? caja.y : lado === "esquina" ? caja.y + caja.height * 0.3 : caja.y + caja.height / 2;
    puntos.push({
      n: i + 1,
      x: +(((x - recorte.x) / recorte.width) * 100).toFixed(2),
      y: +(((y - recorte.y) / recorte.height) * 100).toFixed(2),
      // "dentro-der" y "esquina": el número queda dentro del recuadro, junto a su borde derecho.
      lado: lado === "dentro-der" || lado === "esquina" ? "izq" : lado === "texto-buscador" ? "der" : lado,
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
