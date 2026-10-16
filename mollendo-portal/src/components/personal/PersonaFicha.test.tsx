import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import type { Cumplimiento, DocumentoActual, Persona } from "@/lib/api/types";
import { PersonaFicha } from "./PersonaFicha";

const api = vi.hoisted(() => ({ get: vi.fn(), updateEstado: vi.fn(), subirFoto: vi.fn(), eliminar: vi.fn() }));
vi.mock("@/lib/api/endpoints", () => ({
  personasApi: { get: api.get, updateEstado: api.updateEstado, subirFoto: api.subirFoto },
  documentosApi: { eliminar: api.eliminar },
}));
// Piezas con sus propias consultas (foto, archivo, formulario de subida): se simulan.
vi.mock("./FotoPersonal", async (original) => ({
  ...(await original<typeof import("./FotoPersonal")>()),
  FotoGuardada: () => <span>foto</span>,
}));
vi.mock("./VerDocumento", () => ({ VerDocumento: () => <button>Ver</button> }));
vi.mock("./SubirDocumentoForm", () => ({
  SubirDocumentoForm: ({ nombreFijo, onSubido }: { nombreFijo?: string; onSubido: () => void }) => (
    <button onClick={onSubido}>Guardar {nombreFijo ?? "documento nuevo"}</button>
  ),
}));

function doc(id: number, nombre: string, vigente: boolean, fechaVencimiento: string | null): DocumentoActual {
  return { id, tipoDocumentoId: id, nombre, version: 1, fechaVencimiento, creadoEn: "2026-01-01T00:00:00.000Z", vigente };
}

function persona(cumplimiento: Partial<Cumplimiento>, extra: Partial<Persona> = {}): Persona {
  return {
    id: 7,
    empresaId: 1,
    perfil: null,
    tipoDocumentoIdentidad: "DNI",
    numeroDocumento: "45678912",
    nombres: "Rosa",
    apellidos: "Díaz",
    fotoUrl: "/fotos/7.jpg",
    estado: "activo",
    creadoEn: "2026-01-01T00:00:00.000Z",
    empresa: { id: 1, razonSocial: "Transportes Norte" },
    documentos: [],
    documentosActuales: [doc(1, "SCTR", true, "2030-12-31T00:00:00.000Z")],
    cumplimiento: { habilitado: false, dadoDeBaja: false, sinDocumentos: false, documentosVencidos: [], ...cumplimiento },
    ...extra,
  };
}

let onCambio: ReturnType<typeof vi.fn<(p: Persona) => void>>;
beforeEach(() => {
  Object.values(api).forEach((f) => f.mockReset());
  onCambio = vi.fn<(p: Persona) => void>();
});

async function montar(p: Persona) {
  api.get.mockResolvedValue(p);
  render(<PersonaFicha personaId={p.id} onCambio={onCambio} />);
  await screen.findByRole("heading", { name: "Rosa Díaz" });
}

/** Tarjeta de estado (la de “Puede ingresar hoy” / “No puede ingresar”). */
const tarjeta = () => screen.getByText(/^(Puede ingresar hoy|No puede ingresar)$/).closest(".rounded-xl") as HTMLElement;
/** Detalle de un paso de “Validación de ingreso”. */
const paso = (nombre: string) => {
  const recorrido = screen.getByText("Validación de ingreso").parentElement!;
  return within(recorrido).getByText(nombre).closest("li")!.textContent;
};

describe("Ficha de la persona", () => {
  it("habilitada: “Puede ingresar hoy” y los tres pasos en regla", async () => {
    await montar(persona({ habilitado: true }));
    expect(within(tarjeta()).getByText("Puede ingresar hoy")).toBeInTheDocument();
    expect(within(tarjeta()).queryByRole("button")).not.toBeInTheDocument();
    expect(paso("DNI")).toContain("Registrado");
    expect(paso("Documentos")).toContain("Vigentes");
    expect(paso("Rostro")).toContain("Con foto");
    expect(screen.getByText("DNI 45678912 · Transportes Norte")).toBeInTheDocument();
  });

  it("con documentos vencidos: cada uno con su fecha y “Renovar”", async () => {
    await montar(
      persona(
        { documentosVencidos: ["SCTR", "Licencia"] },
        { documentosActuales: [doc(1, "SCTR", false, "2026-03-15T00:00:00.000Z"), doc(2, "Licencia", false, null)] },
      ),
    );
    const t = within(tarjeta());
    expect(t.getByText("No puede ingresar")).toBeInTheDocument();
    expect(t.getByText("2 documentos vencidos. Renuévalos para que pueda ingresar.")).toBeInTheDocument();
    expect(t.getByText(/^Venció el 15\/3\/2026/)).toBeInTheDocument();
    expect(t.getAllByRole("button", { name: "Renovar" })).toHaveLength(2);
    expect(paso("Documentos")).toContain("2 vencidos");
  });

  it("“Renovar” abre la ventana con ese documento; al guardar, se cierra y se actualiza la lista", async () => {
    await montar(
      persona({ documentosVencidos: ["SCTR"] }, { documentosActuales: [doc(1, "SCTR", false, "2026-03-15T00:00:00.000Z")] }),
    );
    expect(within(tarjeta()).getByText("1 documento vencido. Renuévalo para que pueda ingresar.")).toBeInTheDocument();

    await userEvent.click(within(tarjeta()).getByRole("button", { name: "Renovar" }));
    expect(screen.getByRole("heading", { name: "Renovar documento" })).toBeInTheDocument();

    const renovada = persona({ habilitado: true });
    api.get.mockResolvedValue(renovada);
    await userEvent.click(screen.getByRole("button", { name: "Guardar SCTR" }));
    expect(screen.queryByRole("heading", { name: "Renovar documento" })).not.toBeInTheDocument();
    expect(await within(tarjeta()).findByText("Puede ingresar hoy")).toBeInTheDocument();
    // La lista recibe los mismos datos que leyó la ficha (no hace otro pedido).
    expect(onCambio).toHaveBeenCalledTimes(1);
    expect(onCambio).toHaveBeenCalledWith(renovada);
  });

  it("sin documentos: “Agregar documento” abre la ventana para agregar", async () => {
    await montar(persona({ sinDocumentos: true }, { documentosActuales: [] }));
    expect(within(tarjeta()).getByText("No tiene documentos cargados. Agrega al menos uno para que pueda ingresar.")).toBeInTheDocument();
    await userEvent.click(within(tarjeta()).getByRole("button", { name: "Agregar documento" }));
    expect(screen.getByRole("heading", { name: "Agregar documento" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar documento nuevo" })).toBeInTheDocument();
  });

  it("de baja: muestra el motivo, “Reactivar” y el DNI en falla", async () => {
    await montar(persona({ dadoDeBaja: true }, { estado: "inactivo", motivoBaja: "Renuncia", fechaBaja: null }));
    expect(within(tarjeta()).getByText("Dado de baja. Motivo: Renuncia. Para que vuelva a ingresar, usa “Reactivar”.")).toBeInTheDocument();
    expect(within(tarjeta()).queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reactivar" })).toBeInTheDocument();
    expect(paso("DNI")).toContain("Dado de baja");
  });

  it("sin foto: aviso del reconocimiento facial y el paso Rostro en aviso", async () => {
    await montar(persona({ habilitado: true }, { fotoUrl: null }));
    expect(screen.getByText(/Sin foto: no podrá identificarse por reconocimiento facial/)).toBeInTheDocument();
    expect(paso("Rostro")).toContain("Sin foto");
    expect(screen.getByRole("button", { name: "Subir foto" })).toBeInTheDocument();
  });

  it("dar de baja con motivo: pide confirmación y guarda el motivo", async () => {
    await montar(persona({ habilitado: true }));
    api.updateEstado.mockResolvedValueOnce(undefined);

    await userEvent.click(screen.getByRole("button", { name: "Dar de baja" }));
    const ventana = screen.getByRole("heading", { name: "Dar de baja" }).parentElement!;
    await userEvent.type(within(ventana).getByLabelText(/Motivo de la baja/), "  Terminó su contrato  ");
    await userEvent.click(within(ventana).getByRole("button", { name: "Dar de baja" }));

    expect(api.updateEstado).toHaveBeenCalledWith(7, "inactivo", "Terminó su contrato");
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Dar de baja" })).not.toBeInTheDocument());
    await waitFor(() => expect(onCambio).toHaveBeenCalledTimes(1));
  });

  it("si dar de baja falla, la ventana queda abierta con el error", async () => {
    await montar(persona({ habilitado: true }));
    api.updateEstado.mockRejectedValueOnce(new ApiError("No tienes permiso", 403));

    await userEvent.click(screen.getByRole("button", { name: "Dar de baja" }));
    const ventana = screen.getByRole("heading", { name: "Dar de baja" }).parentElement!;
    await userEvent.click(within(ventana).getByRole("button", { name: "Dar de baja" }));

    expect(await within(ventana).findByText("No tienes permiso")).toBeInTheDocument();
    expect(onCambio).not.toHaveBeenCalled();
  });

  it("reactivar a alguien con un documento vencido avisa que aún no podrá ingresar", async () => {
    await montar(
      persona(
        { dadoDeBaja: true },
        { estado: "inactivo", documentosActuales: [doc(1, "SCTR", false, "2026-03-15T00:00:00.000Z")] },
      ),
    );
    await userEvent.click(screen.getByRole("button", { name: "Reactivar" }));
    expect(screen.getByText("Aun reactivado no podrá ingresar hasta regularizar: Vencido: SCTR.")).toBeInTheDocument();
  });

  it("si no se puede cargar, avisa y permite reintentar", async () => {
    api.get.mockRejectedValueOnce(new ApiError("Personal no encontrado", 404)).mockResolvedValue(persona({ habilitado: true }));
    render(<PersonaFicha personaId={7} onCambio={onCambio} />);
    expect(await screen.findByText("Personal no encontrado")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByRole("heading", { name: "Rosa Díaz" })).toBeInTheDocument();
  });
});
