import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { IngresoEnEspera } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import { MarcaVerificacionManual, MotivoDenegacion } from "./CeldasEvento";
import { ActivarVerificacionManual, AvisoEquipoVolvio, DecisionManualVentana, FranjaVerificacionManual } from "./VerificacionManual";

// La foto se descarga con la sesión: aquí basta un recuadro.
vi.mock("@/components/personal/FotoPersonal", () => ({ FotoGuardada: () => <div>foto</div> }));

const ACTIVA = {
  activa: true,
  periodo: { id: 1, motivo: "Equipo facial desconectado", desde: "2026-10-15T13:30:00.000Z", activadaPor: "vigilancia@mollendo.local" },
};

const JUAN: IngresoEnEspera = {
  id: 7,
  personaId: 3,
  nombres: "Juan",
  apellidos: "Pérez Quispe",
  numeroDocumento: "45678912",
  empresa: "Transportes Norte",
  tieneFoto: true,
  torniqueteId: null,
  desde: "2026-10-15T13:33:00.000Z",
  hasta: "2026-10-15T13:35:00.000Z",
  enCola: false,
  manual: true,
};

describe("Verificación manual en el Panel", () => {
  it("franja fija: desde cuándo, quién la activó y el motivo; el botón vuelve a modo normal", async () => {
    const onTerminar = vi.fn();
    render(<FranjaVerificacionManual estado={ACTIVA} terminando={false} onTerminar={onTerminar} />);
    const franja = screen.getByRole("status");
    expect(franja).toHaveTextContent("Verificación manual activa");
    expect(franja).toHaveTextContent("activada por vigilancia@mollendo.local");
    expect(franja).toHaveTextContent("Motivo: Equipo facial desconectado");
    await userEvent.click(screen.getByRole("button", { name: "Volver a modo normal" }));
    expect(onTerminar).toHaveBeenCalledTimes(1);
  });

  it("sin verificación manual activa, no hay franja", () => {
    const { container } = render(<FranjaVerificacionManual estado={{ activa: false, periodo: null }} terminando={false} onTerminar={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("si se activó por el alcoholímetro, la pregunta habla del alcoholímetro", () => {
    render(<AvisoEquipoVolvio equipo="El alcoholímetro" terminando={false} onVolver={() => {}} onSeguir={() => {}} />);
    expect(screen.getByRole("status")).toHaveTextContent("El alcoholímetro volvió a conectarse. ¿Volver a modo normal?");
  });

  it("el motivo viene escrito según desde dónde se activa, y el texto dice que el sistema decide", () => {
    const { rerender } = render(<ActivarVerificacionManual abierta causa="alcoholimetro" onCerrar={() => {}} onActivar={async () => {}} />);
    expect(screen.getByLabelText("Motivo *")).toHaveValue("Alcoholímetro desconectado");
    expect(screen.getByText(/escribe el grado; el sistema decide si puede entrar/)).toBeInTheDocument();
    rerender(<ActivarVerificacionManual abierta causa="ambar" onCerrar={() => {}} onActivar={async () => {}} />);
    expect(screen.getByLabelText("Motivo *")).toHaveValue("El equipo facial no toma la prueba");
  });

  it("al volver el equipo facial pregunta: volver a modo normal o seguir en manual", async () => {
    const onVolver = vi.fn();
    const onSeguir = vi.fn();
    render(<AvisoEquipoVolvio terminando={false} onVolver={onVolver} onSeguir={onSeguir} />);
    expect(screen.getByRole("status")).toHaveTextContent("El equipo facial volvió a conectarse. ¿Volver a modo normal?");
    await userEvent.click(screen.getByRole("button", { name: "Seguir en manual" }));
    await userEvent.click(screen.getByRole("button", { name: "Volver a modo normal" }));
    expect(onSeguir).toHaveBeenCalledTimes(1);
    expect(onVolver).toHaveBeenCalledTimes(1);
  });

  it("activar: pide el motivo (obligatorio) y lo envía", async () => {
    const onActivar = vi.fn().mockResolvedValue(undefined);
    render(<ActivarVerificacionManual abierta onCerrar={() => {}} onActivar={onActivar} />);
    const motivo = screen.getByLabelText("Motivo *");
    await userEvent.clear(motivo);
    expect(screen.getByRole("button", { name: "Activar" })).toBeDisabled();
    await userEvent.type(motivo, "  G4 apagado  ");
    await userEvent.click(screen.getByRole("button", { name: "Activar" }));
    expect(onActivar).toHaveBeenCalledWith("G4 apagado");
  });

  it("si no se puede activar, muestra el motivo del servidor", async () => {
    const onActivar = vi.fn().mockRejectedValue(new ApiError("La verificación manual ya está activa", 400));
    render(<ActivarVerificacionManual abierta onCerrar={() => {}} onActivar={onActivar} />);
    await userEvent.click(screen.getByRole("button", { name: "Activar" }));
    expect(await screen.findByText("La verificación manual ya está activa")).toBeInTheDocument();
  });

  it("la persona en su turno: datos, tiempo, el grado y 'Registrar prueba' (acepta coma)", async () => {
    const onDecidir = vi.fn().mockResolvedValue(undefined);
    render(<DecisionManualVentana ingreso={JUAN} ahora={new Date("2026-10-15T13:33:18.000Z").getTime()} onDecidir={onDecidir} />);
    expect(screen.getByRole("heading", { name: "Verificación manual de ingreso" })).toBeInTheDocument();
    expect(screen.getByText("Juan Pérez Quispe")).toBeInTheDocument();
    expect(screen.getByText("45678912")).toBeInTheDocument();
    expect(screen.getByText("Transportes Norte")).toBeInTheDocument();
    expect(screen.getByText("1:42")).toBeInTheDocument();
    expect(screen.getByText("Tómele la prueba con el alcoholímetro de repuesto y escriba lo que marca.")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Grado de alcohol (mg/L)"), "0,125");
    await userEvent.click(screen.getByRole("button", { name: "Registrar prueba" }));
    expect(onDecidir).toHaveBeenLastCalledWith(7, "grado", 0.125);
    await userEvent.click(screen.getByRole("button", { name: "No es la persona" }));
    expect(onDecidir).toHaveBeenLastCalledWith(7, "no-es-la-persona", undefined);
  });

  it("sin grado (o con letras) no se registra y lo pide", async () => {
    const onDecidir = vi.fn().mockResolvedValue(undefined);
    render(<DecisionManualVentana ingreso={JUAN} ahora={Date.now()} onDecidir={onDecidir} />);
    await userEvent.click(screen.getByRole("button", { name: "Registrar prueba" }));
    expect(screen.getByText("Escriba el grado que marcó el alcoholímetro (por ejemplo, 0.000).")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Grado de alcohol (mg/L)"), "abc");
    await userEvent.click(screen.getByRole("button", { name: "Registrar prueba" }));
    expect(onDecidir).not.toHaveBeenCalled();
  });

  it("si el alcoholímetro no muestra el número: 'Marcó apto' / 'Marcó alcohol', y se puede volver al grado", async () => {
    const onDecidir = vi.fn().mockResolvedValue(undefined);
    render(<DecisionManualVentana ingreso={JUAN} ahora={Date.now()} onDecidir={onDecidir} />);
    await userEvent.click(screen.getByRole("button", { name: "Mi alcoholímetro no muestra el número" }));
    expect(screen.queryByLabelText("Grado de alcohol (mg/L)")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Marcó apto" }));
    expect(onDecidir).toHaveBeenLastCalledWith(7, "marco-apto", undefined);
    await userEvent.click(screen.getByRole("button", { name: "Marcó alcohol" }));
    expect(onDecidir).toHaveBeenLastCalledWith(7, "marco-alcohol", undefined);
    await userEvent.click(screen.getByRole("button", { name: "Volver a escribir el grado" }));
    expect(screen.getByLabelText("Grado de alcohol (mg/L)")).toBeInTheDocument();
  });

  it("si otro vigilante ya decidió, lo avisa", async () => {
    const onDecidir = vi.fn().mockRejectedValue(new ApiError("Esa persona ya no está esperando la verificación manual (venció o ya se decidió)", 400));
    render(<DecisionManualVentana ingreso={JUAN} ahora={Date.now()} onDecidir={onDecidir} />);
    await userEvent.type(screen.getByLabelText("Grado de alcohol (mg/L)"), "0.000");
    await userEvent.click(screen.getByRole("button", { name: "Registrar prueba" }));
    expect(await screen.findByText(/ya no está esperando/)).toBeInTheDocument();
  });

  it("sin nadie en su turno, no hay ventana", () => {
    render(<DecisionManualVentana ingreso={null} ahora={Date.now()} onDecidir={async () => {}} />);
    expect(screen.queryByRole("heading", { name: "Verificación manual de ingreso" })).not.toBeInTheDocument();
  });

  it("historial: marca 'Manual' con el grado (o sin número) y el vigilante, y el motivo 'Rostro no coincide'", () => {
    render(
      <>
        <MarcaVerificacionManual
          evento={{ verificacionManual: true, verificadoPor: { id: 2, correo: "vigilancia@mollendo.local" }, gradoManual: 0, resultado: "autorizado" }}
        />
        <MarcaVerificacionManual
          evento={{ verificacionManual: true, verificadoPor: { id: 2, correo: "vigilancia@mollendo.local" }, manualSinNumero: true, resultado: "denegado" }}
        />
        <MotivoDenegacion
          evento={{
            denegadoNoRegistrado: false,
            denegadoPorBaja: false,
            denegadoSinDocumentos: false,
            denegadoPorAlcohol: false,
            denegadoPorDocumentos: false,
            denegadoSinVerificacion: false,
            denegadoRostroNoCoincide: true,
          }}
          onVerDocumentos={() => {}}
        />
      </>,
    );
    expect(screen.getByText("Manual · 0,000 mg/L · vigilancia@mollendo.local")).toBeInTheDocument();
    expect(screen.getByText("Manual · marcó alcohol, sin número · vigilancia@mollendo.local")).toBeInTheDocument();
    expect(screen.getByText("Rostro no coincide")).toBeInTheDocument();
  });
});
