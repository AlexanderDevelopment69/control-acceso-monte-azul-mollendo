import type { TarjetaContingencia } from "@/lib/api/types";

/** "20/10/2026" de un día AAAA-MM-DD (sin pasar por la zona horaria). */
export function diaVisible(dia: string): string {
  const [a, m, d] = dia.split("-");
  return `${d}/${m}/${a}`;
}

const escapar = (texto: string) => texto.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Logo de Monte Azul (el símbolo; en la tarjeta se ve en blanco, ver `.marca img`). */
export const LOGO_TARJETA = "/images/logo/marca-monteazul.png";

/** El logo dentro de la tarjeta (data:), para que salga impreso aunque la impresión no lo vuelva a descargar. */
export async function logoIncluido(): Promise<string> {
  const archivo = await (await fetch(LOGO_TARJETA)).blob();
  return new Promise((listo, fallo) => {
    const lector = new FileReader();
    lector.onload = () => listo(String(lector.result));
    lector.onerror = () => fallo(lector.error);
    lector.readAsDataURL(archivo);
  });
}

/**
 * La tarjeta impresa, del tamaño de un carné (85,6 × 54 mm), con el mismo
 * diseño que se ve en el portal: nombre, número, vencimiento y el QR sobre
 * blanco (con margen, para que el lector lo lea bien). El código no va
 * escrito: solo en el QR. Sirve para la vista previa y para imprimir.
 */
export function htmlTarjeta(tarjeta: TarjetaContingencia, qrSvg: string, logo = LOGO_TARJETA): string {
  const vence = tarjeta.venceEl ? `Vence el ${diaVisible(tarjeta.venceEl)}` : "No vence";
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${escapar(tarjeta.nombre)}</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #fff; }
  body { padding: 8mm; display: flex; justify-content: center; font-family: "Outfit", system-ui, -apple-system, "Segoe UI", sans-serif; }
  /* Línea de corte alrededor del carné. */
  .corte { padding: 2mm; border: 0.2mm dashed #9ca3af; border-radius: 4.5mm; }
  .tarjeta {
    position: relative; overflow: hidden; width: 85.6mm; height: 54mm; border-radius: 3.2mm; padding: 4mm 4.5mm;
    display: flex; flex-direction: column; justify-content: space-between; color: #fff;
    background: linear-gradient(135deg, #465fff 0%, #252dae 100%);
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  /* La de acceso, oscura (la de contingencia es azul). */
  .tarjeta.acceso { background: linear-gradient(135deg, #1d2939 0%, #0c111d 100%); }
  .circulo { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.1); }
  .c1 { width: 36mm; height: 36mm; right: -9mm; top: -9mm; }
  .c2 { width: 34mm; height: 34mm; right: 18mm; bottom: -20mm; background: rgba(255, 255, 255, 0.06); }
  .arriba, .abajo { position: relative; display: flex; justify-content: space-between; gap: 3mm; }
  .arriba { align-items: center; }
  .abajo { align-items: flex-end; }
  .marca { display: flex; align-items: center; gap: 1.8mm; font-size: 2.7mm; font-weight: 700; letter-spacing: 0.15mm; text-transform: uppercase; color: #fff; }
  /* El original es azul: en blanco para que se vea sobre el fondo azul. */
  .marca img { height: 4.2mm; width: auto; filter: brightness(0) invert(1); }
  .solo { font-size: 2.3mm; font-weight: 600; padding: 0.6mm 2mm; border-radius: 3mm; background: rgba(255, 255, 255, 0.2); }
  .titulo { font-size: 3.6mm; font-weight: 600; line-height: 1.15; }
  .numero { font-size: 8mm; font-weight: 700; line-height: 1.05; }
  .vence { margin-top: 1.5mm; font-size: 2.6mm; color: rgba(255, 255, 255, 0.85); }
  .uso { margin-top: 0.8mm; font-size: 2.2mm; color: rgba(255, 255, 255, 0.7); max-width: 40mm; }
  .qr { flex: none; width: 25mm; height: 25mm; padding: 1.2mm; border-radius: 2mm; background: #fff; }
  .qr svg { display: block; width: 100%; height: 100%; }
  /* En la vista previa del portal: centrada y achicada para caber en el recuadro, sin barras.
     Al imprimir, tamaño real. */
  @media screen {
    html, body { height: 100%; overflow: hidden; }
    body { padding: 0; align-items: center; }
    .corte { flex: none; transform-origin: center; }
  }
  @media print { .corte { transform: none !important; } }
</style>
</head>
<body>
  <div class="corte">
    <div class="tarjeta${tarjeta.tipo === "acceso" ? " acceso" : ""}">
      <span class="circulo c1"></span><span class="circulo c2"></span>
      <div class="arriba">
        <span class="marca"><img src="${logo}" alt="">Monte Azul Sur</span>
        <span class="solo">Solo vigilancia</span>
      </div>
      <div class="abajo">
        <div>
          <div class="titulo">${tarjeta.tipo === "acceso" ? "Tarjeta de acceso" : "Tarjeta de contingencia"}</div>
          <div class="numero">N.º ${tarjeta.numero}</div>
          <div class="vence">${vence}</div>
          <div class="uso">${tarjeta.tipo === "acceso" ? "Abre el molinete sin rostro, alcohol ni DNI." : "Se pasa por el lector en lugar del DNI."}</div>
        </div>
        <div class="qr">${qrSvg}</div>
      </div>
    </div>
  </div>
  <script>
    function ajustar() {
      var c = document.querySelector(".corte");
      c.style.transform = "";
      var escala = Math.min(1, (innerWidth - 24) / c.offsetWidth, (innerHeight - 24) / c.offsetHeight);
      c.style.transform = "scale(" + escala + ")";
    }
    addEventListener("resize", ajustar);
    ajustar();
  </script>
</body>
</html>`;
}
