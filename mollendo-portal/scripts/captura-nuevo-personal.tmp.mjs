// Captura temporal (local, DEMO) de la sección Documentos de "Nuevo personal". No guarda nada.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = process.argv[2];
const ENV = fs.readFileSync(path.join(RAIZ, "..", "mollendo-api", ".env"), "utf8");
const valor = (k) => (ENV.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").replace(/^"|"$/g, "");
const API = "http://localhost:3001/api/v1";
const login = await (
  await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: valor("ADMIN_SEED_EMAIL"), password: valor("ADMIN_SEED_PASSWORD") }),
  })
).json();
const navegador = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
});
const p = await navegador.newPage();
await p.setCookie(
  { name: "mollendo_sesion", value: login.accessToken, domain: "localhost", path: "/api/v1", httpOnly: true, sameSite: "Strict" },
  { name: "mollendo_renovacion", value: login.refreshToken, domain: "localhost", path: "/api/v1/auth", httpOnly: true, sameSite: "Strict" },
);
try {
  for (const tema of ["light", "dark"]) {
    await p.goto("http://localhost:3000/iniciar-sesion", { waitUntil: "networkidle2" });
    await p.evaluate((t) => localStorage.setItem("theme", t), tema);
    await p.goto("http://localhost:3000/", { waitUntil: "networkidle2" });
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await p.locator("button::-p-text(Nuevo personal)").click();
    await p.waitForFunction(() => document.body.innerText.includes("Nombre del documento"), { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 800));
    const seccion = await p.evaluateHandle(() => {
      const t = [...document.querySelectorAll("*")].find((e) => e.textContent?.trim() === "Nombre del documento");
      let n = t;
      while (n && !(n.textContent.includes("Agregar otro documento") && n.textContent.includes("Documentos"))) n = n.parentElement;
      return n;
    });
    await seccion.asElement().screenshot({ path: path.join(SALIDA, `documentos-${tema}.png`) });
    // Desplegable abierto.
    await p.evaluate(() => {
      const t = [...document.querySelectorAll("label")].find((e) => e.textContent?.trim() === "Nombre del documento");
      t.parentElement.querySelector("button[aria-haspopup], button[role=combobox], [role=combobox]").click();
    });
    await new Promise((r) => setTimeout(r, 500));
    await seccion.asElement().screenshot({ path: path.join(SALIDA, `documentos-lista-${tema}.png`) });
  }
  console.log("ok");
} catch (e) {
  console.log("FALLA", e.message);
  await p.screenshot({ path: path.join(SALIDA, "error.png") });
} finally {
  await navegador.close();
}
