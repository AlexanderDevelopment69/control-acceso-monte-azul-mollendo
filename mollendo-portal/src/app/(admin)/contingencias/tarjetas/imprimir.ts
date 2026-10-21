import type { TarjetaContingencia } from "@/lib/api/types";

/** "20/10/2026" de un día AAAA-MM-DD (sin pasar por la zona horaria). */
export function diaVisible(dia: string): string {
  const [a, m, d] = dia.split("-");
  return `${d}/${m}/${a}`;
}

const escapar = (texto: string) => texto.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Candado (el mismo ícono del menú "Contingencias"). */
const CANDADO = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;

/**
 * La tarjeta impresa, del tamaño de un carné (85,6 × 54 mm), con el mismo
 * diseño que se ve en el portal: nombre, número, vencimiento y el QR sobre
 * blanco (con margen, para que el lector lo lea bien). El código no va
 * escrito: solo en el QR. Sirve para la vista previa y para imprimir.
 */
export function htmlTarjeta(tarjeta: TarjetaContingencia, qrSvg: string): string {
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
  .circulo { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.1); }
  .c1 { width: 36mm; height: 36mm; right: -9mm; top: -9mm; }
  .c2 { width: 34mm; height: 34mm; right: 18mm; bottom: -20mm; background: rgba(255, 255, 255, 0.06); }
  .arriba, .abajo { position: relative; display: flex; justify-content: space-between; gap: 3mm; }
  .arriba { align-items: center; }
  .abajo { align-items: flex-end; }
  .marca { display: flex; align-items: center; gap: 1.5mm; font-size: 2.6mm; font-weight: 600; letter-spacing: 0.25mm; text-transform: uppercase; color: rgba(255, 255, 255, 0.85); }
  .solo { font-size: 2.3mm; font-weight: 600; padding: 0.6mm 2mm; border-radius: 3mm; background: rgba(255, 255, 255, 0.2); }
  .titulo { font-size: 3.6mm; font-weight: 600; line-height: 1.15; }
  .numero { font-size: 8mm; font-weight: 700; line-height: 1.05; }
  .vence { margin-top: 1.5mm; font-size: 2.6mm; color: rgba(255, 255, 255, 0.85); }
  .uso { margin-top: 0.8mm; font-size: 2.2mm; color: rgba(255, 255, 255, 0.7); max-width: 40mm; }
  .qr { flex: none; width: 25mm; height: 25mm; padding: 1.2mm; border-radius: 2mm; background: #fff; }
  .qr svg { display: block; width: 100%; height: 100%; }
</style>
</head>
<body>
  <div class="corte">
    <div class="tarjeta">
      <span class="circulo c1"></span><span class="circulo c2"></span>
      <div class="arriba">
        <span class="marca">${CANDADO}Contingencia</span>
        <span class="solo">Solo vigilancia</span>
      </div>
      <div class="abajo">
        <div>
          <div class="titulo">Tarjeta de contingencia</div>
          <div class="numero">N.º ${tarjeta.numero}</div>
          <div class="vence">${vence}</div>
          <div class="uso">Se pasa por el lector en lugar del DNI.</div>
        </div>
        <div class="qr">${qrSvg}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
