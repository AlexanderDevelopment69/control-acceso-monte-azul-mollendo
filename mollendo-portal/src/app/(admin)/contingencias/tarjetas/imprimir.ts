import type { TarjetaContingencia } from "@/lib/api/types";

/** "20/10/2026" de un día AAAA-MM-DD (sin pasar por la zona horaria). */
export function diaVisible(dia: string): string {
  const [a, m, d] = dia.split("-");
  return `${d}/${m}/${a}`;
}

const escapar = (texto: string) => texto.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/**
 * La tarjeta para imprimir, del tamaño de un carné (85,6 × 54 mm): el QR y
 * su nombre. El código no va escrito: solo en el QR.
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
  body { margin: 0; padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #111827; background: #fff; }
  .acciones { margin-bottom: 20px; display: flex; gap: 12px; align-items: center; font-size: 14px; color: #4b5563; }
  .acciones button { font: inherit; padding: 8px 16px; border-radius: 8px; border: 0; background: #465fff; color: #fff; cursor: pointer; }
  .tarjeta { width: 85.6mm; height: 54mm; border: 0.3mm solid #9ca3af; border-radius: 3mm; padding: 3mm; display: flex; gap: 3mm; align-items: center; }
  .qr { width: 46mm; height: 46mm; flex: none; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .texto { display: flex; flex-direction: column; gap: 1.6mm; font-size: 2.9mm; line-height: 1.3; }
  .titulo { font-size: 3.8mm; font-weight: 700; line-height: 1.15; }
  .uso { color: #374151; }
  .vence { font-weight: 600; }
  @media print { body { padding: 0; } .acciones { display: none; } }
</style>
</head>
<body>
  <div class="acciones">
    <button type="button" onclick="window.print()">Imprimir</button>
    <span>Imprima al 100 % (tamaño real), recórtela y plastifíquela.</span>
  </div>
  <div class="tarjeta">
    <div class="qr">${qrSvg}</div>
    <div class="texto">
      <div class="titulo">${escapar(tarjeta.nombre)}</div>
      <div class="uso">Solo para el vigilante. Se pasa por el lector en lugar del DNI.</div>
      <div class="vence">${vence}</div>
    </div>
  </div>
</body>
</html>`;
}
