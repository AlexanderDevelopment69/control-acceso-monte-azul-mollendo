import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { EventoAcceso, TarjetaContingencia } from "@/lib/api/types";
import { MarcaTarjetaContingencia } from "../../vigilancia/CeldasEvento";
import { FranjaSalidaSinDni } from "../../vigilancia/SalidaSinDni";
import { htmlTarjeta } from "./imprimir";

const tarjeta: TarjetaContingencia = {
  id: 1,
  numero: 1,
  nombre: "Tarjeta de contingencia 1",
  activa: true,
  vencida: false,
  venceEl: "2026-12-31",
  creadaEn: "2026-10-20T15:00:00.000Z",
  codigoCambiadoEn: "2026-10-20T15:00:00.000Z",
  ultimoUso: null,
  eliminable: true,
};

describe("tarjeta de contingencia", () => {
  it("en el Panel: el ingreso dice solo la tarjeta; la salida, también quién eligió al trabajador", () => {
    const evento = (datos: Partial<EventoAcceso>) => ({ tarjetaContingencia: { numero: 1 }, verificadoPor: { id: 7, correo: "vigilante@tmam.pe" }, ...datos }) as EventoAcceso;
    const { rerender } = render(<MarcaTarjetaContingencia evento={evento({ tipoMovimiento: "ingreso" })} />);
    expect(screen.getByText("Tarjeta de contingencia")).toBeInTheDocument();
    rerender(<MarcaTarjetaContingencia evento={evento({ tipoMovimiento: "salida" })} />);
    expect(screen.getByText("Tarjeta de contingencia · vigilante@tmam.pe")).toBeInTheDocument();
    rerender(<MarcaTarjetaContingencia evento={evento({ tipoMovimiento: "ingreso", tarjetaContingencia: null })} />);
    expect(screen.queryByText(/Tarjeta de contingencia/)).not.toBeInTheDocument();
  });

  it("salida sin DNI: la franja dice a quién y cuánto queda", () => {
    const hasta = new Date(Date.now() + 90_000).toISOString();
    render(
      <FranjaSalidaSinDni
        salida={{ personaId: 7, nombres: "Amiel", apellidos: "Bautista", numeroDocumento: "48058719", hasta, preparadaPor: "v@tmam.pe" }}
        onCancelar={() => undefined}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Salida sin DNIAmiel Bautista (DNI 48058719)");
    expect(screen.getByRole("status")).toHaveTextContent(/Quedan 1:(29|30)/);
  });

  it("para imprimir: nombre, QR y vencimiento, sin el código escrito", () => {
    const html = htmlTarjeta(tarjeta, '<svg data-qr="1"></svg>');
    expect(html).toContain("Tarjeta de contingencia 1");
    expect(html).toContain('<svg data-qr="1"></svg>');
    expect(html).toContain("Vence el 31/12/2026");
    expect(htmlTarjeta({ ...tarjeta, venceEl: null }, "")).toContain("No vence");
    expect(html).not.toContain("TMAM-CONT-");
  });
});
