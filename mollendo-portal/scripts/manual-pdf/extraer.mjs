// Uso (con la API y el portal locales en marcha):
//   node scripts/manual-pdf/extraer.mjs ADMIN <carpeta>   (o VIGILANCIA)
//   python scripts/manual-pdf/armar_word.py <Documento_Funcional_..._Actualizado.docx> <carpeta> <salida.docx> "Manual del Administrador" "<descripción>"
//   y exportar el Word a PDF (Word: Guardar como PDF, con los campos actualizados).
//   Después, copiar los dos PDF a docs/entrega y a mollendo-api/manual (los descarga el portal
//   con "Descargar PDF" en Manual) y subir a Azure.
// Recorre el manual del portal con una cuenta y guarda, por sección y pantalla,
// la captura con sus números (PNG) y el texto de cada punto (JSON).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const [, , ROL, SALIDA] = process.argv;
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ENV = fs.readFileSync(path.join(RAIZ, "..", "mollendo-api", ".env"), "utf8");
const valor = (k) => (ENV.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").replace(/^"|"$/g, "");
fs.mkdirSync(SALIDA, { recursive: true });

const r = await fetch("http://localhost:3001/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ correo: valor(`${ROL}_SEED_EMAIL`), password: valor(`${ROL}_SEED_PASSWORD`) }),
});
const { accessToken, refreshToken } = await r.json();
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1920, height: 1200, deviceScaleFactor: 2 });
// El manual muestra siempre el orden en uso (Facial + Alcohol → DNI), como en las capturas.
await p.setRequestInterception(true);
p.on("request", async (q) => {
  if (!q.url().includes("/eventos-acceso/modo-ingreso") || q.method() !== "GET") return q.continue();
  const real = await fetch(q.url(), { headers: q.headers() }).then((x) => x.json()).catch(() => ({}));
  q.respond({ status: 200, contentType: "application/json", body: JSON.stringify({ ...real, facialPrimero: true }) });
});
await p.setCookie(
  { name: "mollendo_sesion", value: accessToken, domain: "localhost", path: "/api/v1", httpOnly: true, sameSite: "Strict" },
  { name: "mollendo_renovacion", value: refreshToken, domain: "localhost", path: "/api/v1/auth", httpOnly: true, sameSite: "Strict" },
);
await p.goto("http://localhost:3000/iniciar-sesion", { waitUntil: "networkidle2" });
await p.evaluate(() => localStorage.setItem("theme", "light"));
await p.goto("http://localhost:3000/manual", { waitUntil: "networkidle2" });
// Sin animaciones ni avisos; todos los números del mismo tamaño y color.
await p.addStyleTag({
  content: `section[aria-label="Avisos del sistema"], nextjs-portal { display: none !important; }
    .animate-ping { display: none !important; }
    section button.absolute { width: 1.15rem !important; height: 1.15rem !important; background: #465fff !important; font-size: 10px !important; box-shadow: 0 0 0 2px #fff !important; }
    *, *::before, *::after { transition: none !important; animation: none !important; }`,
});
const espera = (ms) => new Promise((x) => setTimeout(x, ms));
await espera(800);

const ids = await p.$$eval('nav[aria-label="Secciones del manual"] button', (bs) => bs.map((x) => x.textContent.trim()));
const manual = [];
let n = 0;
for (let s = 0; s < ids.length; s++) {
  await p.evaluate((i) => document.querySelectorAll('nav[aria-label="Secciones del manual"] button')[i].click(), s);
  await espera(700);
  const cab = await p.evaluate(() => {
    const sec = document.querySelector("main section.min-w-0") ?? document.querySelector("section.min-w-0");
    return { titulo: sec.querySelector("h2").textContent.trim(), descripcion: sec.querySelector("h2 + p")?.textContent.trim() ?? "" };
  });
  const seccion = { ...cab, pantallas: [] };
  const pestanas = await p.evaluate(() => {
    const sec = document.querySelector("section.min-w-0");
    return [...sec.querySelectorAll("button")].filter((x) => x.querySelector("span.size-6")).map((x) => ({
      titulo: x.querySelector("span.font-semibold")?.textContent.trim() ?? "",
      descripcion: x.querySelector("span.font-semibold")?.nextElementSibling?.textContent.trim() ?? "",
    }));
  });
  const cuantas = Math.max(1, pestanas.length);
  for (let i = 0; i < cuantas; i++) {
    if (pestanas.length) {
      await p.evaluate((k) => {
        const sec = document.querySelector("section.min-w-0");
        [...sec.querySelectorAll("button")].filter((x) => x.querySelector("span.size-6"))[k].click();
      }, i);
      await espera(600);
    }
    const pantalla = { titulo: pestanas[i]?.titulo ?? "", descripcion: pestanas[i]?.descripcion ?? "", imagen: null, puntos: [], html: null };
    const tieneCaptura = await p.$('section.min-w-0 img[src^="/manual/"]');
    if (tieneCaptura) {
      const marcas = await p.$$eval("section.min-w-0 button.absolute", (bs) => bs.length);
      for (let k = 0; k < marcas; k++) {
        await p.evaluate((j) => document.querySelectorAll("section.min-w-0 button.absolute")[j].click(), k);
        await espera(150);
        pantalla.puntos.push(
          await p.evaluate(() => {
            const sec = document.querySelector("section.min-w-0");
            return { titulo: sec.querySelector("h3").textContent.trim(), html: sec.querySelector("h3").parentElement.nextElementSibling.innerHTML };
          }),
        );
      }
      // Captura sin un número resaltado: se vuelve al primero y se quitan los estilos del activo (ya igualados por CSS).
      await p.evaluate(() => document.querySelectorAll("section.min-w-0 button.absolute")[0].click());
      await espera(200);
      const caja = await p.$('section.min-w-0 img[src^="/manual/"]');
      const contenedor = await caja.evaluateHandle((img) => img.parentElement);
      n++;
      const archivo = `img${String(n).padStart(2, "0")}.png`;
      await contenedor.asElement().screenshot({ path: path.join(SALIDA, archivo) });
      pantalla.imagen = archivo;
    } else {
      const info = await p.evaluate(() => {
        const sec = document.querySelector("section.min-w-0");
        const cont = [...sec.querySelectorAll("div")].find((d) => d.className.includes("text-[15px]") && d.className.includes("leading-relaxed"));
        return { html: cont.innerHTML, graficos: cont.querySelectorAll("svg").length };
      });
      if (info.graficos > 0) {
        n++;
        const archivo = `img${String(n).padStart(2, "0")}.png`;
        const cont = await p.evaluateHandle(() =>
          [...document.querySelectorAll("section.min-w-0 div")].find((d) => d.className.includes("text-[15px]") && d.className.includes("leading-relaxed")),
        );
        await cont.asElement().screenshot({ path: path.join(SALIDA, archivo) });
        pantalla.imagen = archivo;
      } else {
        pantalla.html = info.html;
      }
    }
    seccion.pantallas.push(pantalla);
  }
  manual.push(seccion);
  console.log(ROL, s + 1, seccion.titulo, seccion.pantallas.length, "pantallas");
}
fs.writeFileSync(path.join(SALIDA, "manual.json"), JSON.stringify(manual, null, 1));
await b.close();
