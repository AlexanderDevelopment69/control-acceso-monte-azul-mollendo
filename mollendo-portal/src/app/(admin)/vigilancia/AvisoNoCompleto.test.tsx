import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { EventoAcceso } from "@/lib/api/types";
import {
  avisoDesdeHistorial,
  AvisoNoCompletoBanner,
  PISTA_EQUIPO_DESCONECTADO,
  PISTA_NO_COMPLETO,
  PISTA_TABLA,
  siguienteAviso,
} from "./AvisoNoCompleto";
import { MotivoDenegacion } from "./CeldasEvento";

const JUAN = { nombres: "Juan", apellidos: "Pérez Quispe" };
const NO_COMPLETO = {
  eventoId: 10,
  tipoMovimiento: "ingreso",
  resultado: "denegado",
  fechaHora: "2026-10-15T12:01:00.000Z",
  persona: JUAN,
  motivos: { sinVerificacion: true },
};
const AVISO = { eventoId: 10, persona: "Juan Pérez Quispe", fechaHora: "2026-10-15T12:01:00.000Z" };

function evento(id: number, extra: Partial<EventoAcceso>): EventoAcceso {
  return {
    id,
    personaId: 1,
    tipoMovimiento: "ingreso",
    resultado: "denegado",
    fechaHora: `2026-10-15T12:${String(id).padStart(2, "0")}:00.000Z`,
    persona: { ...JUAN, tipoDocumentoIdentidad: "DNI", numeroDocumento: "45678912" },
    denegadoNoRegistrado: false,
    denegadoPorBaja: false,
    denegadoSinDocumentos: false,
    denegadoPorAlcohol: false,
    denegadoPorDocumentos: false,
    denegadoSinVerificacion: false,
    ...extra,
  } as EventoAcceso;
}

describe("Aviso de “no completó rostro y alcohol”", () => {
  it("aparece cuando un ingreso no completa rostro y alcohol", () => {
    expect(siguienteAviso(null, NO_COMPLETO)).toEqual(AVISO);
  });

  it("se va cuando la siguiente persona ingresa bien", () => {
    expect(siguienteAviso(AVISO, { eventoId: 11, tipoMovimiento: "ingreso", resultado: "autorizado", motivos: {} })).toBeNull();
  });

  it("no cambia con una salida ni con otro denegado (documentos, alcohol)", () => {
    expect(siguienteAviso(AVISO, { eventoId: 11, tipoMovimiento: "salida", resultado: "autorizado" })).toBe(AVISO);
    expect(siguienteAviso(AVISO, { eventoId: 12, tipoMovimiento: "ingreso", resultado: "denegado", motivos: {} })).toBe(AVISO);
  });

  it("un nuevo “no completó” reemplaza al anterior", () => {
    const otro = siguienteAviso(AVISO, { ...NO_COMPLETO, eventoId: 13, persona: { nombres: "Rosa", apellidos: "Díaz" } });
    expect(otro).toMatchObject({ eventoId: 13, persona: "Rosa Díaz" });
  });

  it("al abrir el Panel se calcula con el último ingreso que lo decide", () => {
    // Más recientes primero: una salida y un denegado por documentos no deciden; sí el "no completó".
    const recientes = [
      evento(30, { tipoMovimiento: "salida", resultado: "autorizado" }),
      evento(29, { denegadoPorDocumentos: true }),
      evento(28, { denegadoSinVerificacion: true }),
      evento(27, { resultado: "autorizado" }),
    ];
    expect(avisoDesdeHistorial(recientes)).toEqual({ eventoId: 28, persona: "Juan Pérez Quispe", fechaHora: recientes[2].fechaHora });
  });

  it("al abrir el Panel no aparece si después alguien ingresó bien, o si no hubo ninguno", () => {
    expect(avisoDesdeHistorial([evento(31, { resultado: "autorizado" }), evento(30, { denegadoSinVerificacion: true })])).toBeNull();
    expect(avisoDesdeHistorial([])).toBeNull();
  });

  it("muestra quién, la hora y qué revisar; la ✕ lo cierra", async () => {
    const onCerrar = vi.fn();
    render(<AvisoNoCompletoBanner aviso={AVISO} onCerrar={onCerrar} />);
    const hora = new Date(AVISO.fechaHora).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
    expect(screen.getByRole("status")).toHaveTextContent(`Juan Pérez Quispe no completó rostro y alcohol (${hora}).`);
    expect(screen.getByRole("status")).toHaveTextContent(PISTA_NO_COMPLETO);
    await userEvent.click(screen.getByRole("button", { name: "Cerrar aviso" }));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it("con el equipo facial desconectado no habla del alcoholímetro: dice que nadie puede completar", () => {
    render(<AvisoNoCompletoBanner aviso={AVISO} equipoFacialDesconectado onCerrar={() => {}} />);
    expect(screen.getByRole("status")).toHaveTextContent(PISTA_EQUIPO_DESCONECTADO);
    expect(screen.getByRole("status")).not.toHaveTextContent("punto rojo");
  });

  it("la etiqueta de la tabla explica qué revisar al pasar el mouse (equipo desconectado o alcoholímetro)", () => {
    render(<MotivoDenegacion evento={evento(1, { denegadoSinVerificacion: true })} onVerDocumentos={() => {}} />);
    expect(screen.getByText("No completó rostro y alcohol").closest("[title]")).toHaveAttribute("title", PISTA_TABLA);
  });
});
