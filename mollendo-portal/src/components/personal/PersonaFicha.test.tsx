import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import type { Cumplimiento, DocumentoActual, Persona } from "@/lib/api/types";
import { PersonaFicha } from "./PersonaFicha";

const api = vi.hoisted(() => ({
  get: vi.fn(),
  update: vi.fn(),
  updateEstado: vi.fn(),
  subirFoto: vi.fn(),
  eliminar: vi.fn(),
  empresas: vi.fn(),
}));
vi.mock("@/lib/api/endpoints", () => ({
  personasApi: { get: api.get, update: api.update, updateEstado: api.updateEstado, subirFoto: api.subirFoto },
  documentosApi: { eliminar: api.eliminar },
  empresasApi: { list: api.empresas },
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
    expect(t.getByText("2 documentos vencidos. Renuévelos para que pueda ingresar.")).toBeInTheDocument();
    expect(t.getByText(/^Venció el 15\/3\/2026/)).toBeInTheDocument();
    expect(t.getAllByRole("button", { name: "Renovar" })).toHaveLength(2);
    expect(paso("Documentos")).toContain("2 vencidos");
  });

  it("“Renovar” abre la ventana con ese documento; al guardar, se cierra y se actualiza la lista", async () => {
    await montar(
      persona({ documentosVencidos: ["SCTR"] }, { documentosActuales: [doc(1, "SCTR", false, "2026-03-15T00:00:00.000Z")] }),
    );
    expect(within(tarjeta()).getByText("1 documento vencido. Renuévelo para que pueda ingresar.")).toBeInTheDocument();

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
    expect(within(tarjeta()).getByText("No tiene documentos cargados. Agregue al menos uno para que pueda ingresar.")).toBeInTheDocument();
    await userEvent.click(within(tarjeta()).getByRole("button", { name: "Agregar documento" }));
    expect(screen.getByRole("heading", { name: "Agregar documento" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar documento nuevo" })).toBeInTheDocument();
  });

  it("de baja: muestra el motivo, “Reactivar” y el DNI en falla", async () => {
    await montar(persona({ dadoDeBaja: true }, { estado: "inactivo", motivoBaja: "Renuncia", fechaBaja: null }));
    expect(tarjeta()).toHaveTextContent("Dado de baja. Motivo: Renuncia.Para que vuelva a ingresar, use Reactivar.");
    // "Reactivar" del aviso y el de arriba abren la misma ventana.
    expect(within(tarjeta()).getAllByRole("button")).toHaveLength(1);
    await userEvent.click(within(tarjeta()).getByRole("button", { name: "Reactivar" }));
    expect(screen.getByRole("heading", { name: "Reactivar" })).toBeInTheDocument();
    expect(paso("DNI")).toContain("Dado de baja");
  });

  it("reactivar: pide el motivo (obligatorio) y lo envía", async () => {
    await montar(persona({ dadoDeBaja: true }, { estado: "inactivo", motivoBaja: "Renuncia", fechaBaja: null }));
    api.updateEstado.mockResolvedValueOnce(undefined);

    // El de arriba (el del aviso abre la misma ventana).
    await userEvent.click(screen.getAllByRole("button", { name: "Reactivar" })[0]);
    const ventana = screen.getByRole("heading", { name: "Reactivar" }).parentElement!;
    await userEvent.click(within(ventana).getByRole("button", { name: "Reactivar" }));
    expect(within(ventana).getByText("Escriba el motivo de la reactivación")).toBeInTheDocument();
    expect(api.updateEstado).not.toHaveBeenCalled();
    await userEvent.type(within(ventana).getByLabelText("Motivo de la reactivación *"), "  Volvió a trabajar en el Terminal ");
    await userEvent.click(within(ventana).getByRole("button", { name: "Reactivar" }));

    expect(api.updateEstado).toHaveBeenCalledWith(7, "activo", "Volvió a trabajar en el Terminal");
  });

  it("reactivado: la ficha muestra cuándo y por qué", async () => {
    await montar(
      persona({ habilitado: true }, { motivoReactivacion: "Volvió a trabajar en el Terminal", fechaReactivacion: "2026-10-22T15:00:00.000Z" }),
    );
    expect(within(tarjeta()).getByText(/Reactivado el .*: Volvió a trabajar en el Terminal/)).toBeInTheDocument();
  });

  it("sin foto: aviso del reconocimiento facial y el paso Rostro en aviso", async () => {
    await montar(persona({ habilitado: true }, { fotoUrl: null }));
    expect(screen.getByText(/Sin foto: no podrá identificarse por reconocimiento facial/)).toBeInTheDocument();
    expect(paso("Rostro")).toContain("Sin foto");
    // El de debajo de la foto y el del aviso.
    expect(screen.getAllByRole("button", { name: "Subir foto" })).toHaveLength(2);
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

  it("al cerrar la ventana sin motivo, el mensaje no queda en la ficha", async () => {
    await montar(persona({ habilitado: true }));
    await userEvent.click(screen.getByRole("button", { name: "Dar de baja" }));
    const ventana = screen.getByRole("heading", { name: "Dar de baja" }).parentElement!;
    await userEvent.click(within(ventana).getByRole("button", { name: "Dar de baja" }));
    expect(within(ventana).getByText("Escriba el motivo de la baja")).toBeInTheDocument();

    await userEvent.click(within(ventana).getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Dar de baja" })).not.toBeInTheDocument());
    expect(screen.queryByText("Escriba el motivo de la baja")).not.toBeInTheDocument();
  });

  it("si dar de baja falla, la ventana queda abierta con el error", async () => {
    await montar(persona({ habilitado: true }));
    api.updateEstado.mockRejectedValueOnce(new ApiError("No tienes permiso", 403));

    await userEvent.click(screen.getByRole("button", { name: "Dar de baja" }));
    const ventana = screen.getByRole("heading", { name: "Dar de baja" }).parentElement!;
    // Sin motivo no se da de baja: el botón está habilitado y avisa.
    await userEvent.click(within(ventana).getByRole("button", { name: "Dar de baja" }));
    expect(within(ventana).getByText("Escriba el motivo de la baja")).toBeInTheDocument();
    expect(api.updateEstado).not.toHaveBeenCalled();
    await userEvent.type(within(ventana).getByLabelText("Motivo de la baja *"), "Renuncia");
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
    // El de arriba (el del aviso abre la misma ventana).
    await userEvent.click(screen.getAllByRole("button", { name: "Reactivar" })[0]);
    expect(screen.getByText("Aun reactivado no podrá ingresar hasta regularizar: Vencido: SCTR.")).toBeInTheDocument();
  });

  it("si no se puede cargar, avisa y permite reintentar", async () => {
    api.get.mockRejectedValueOnce(new ApiError("Personal no encontrado", 404)).mockResolvedValue(persona({ habilitado: true }));
    render(<PersonaFicha personaId={7} onCambio={onCambio} />);
    expect(await screen.findByText("Personal no encontrado")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByRole("heading", { name: "Rosa Díaz" })).toBeInTheDocument();
  });
  it("editar datos: envía solo lo que cambió, avisa si cambia el documento y vuelve a leer la ficha", async () => {
    await montar(persona({ habilitado: true }, { perfil: "contratista" }));
    api.empresas.mockResolvedValue([{ id: 1, razonSocial: "Agencia Sur", estado: "activa" }]);
    api.update.mockResolvedValueOnce(undefined);

    await userEvent.click(screen.getByRole("button", { name: "Editar datos" }));
    const ventana = screen.getByRole("heading", { name: "Editar datos del personal" }).parentElement!;
    const guardar = within(ventana).getByRole("button", { name: "Guardar" });
    await waitFor(() => expect(within(ventana).queryByText("Cargando…")).not.toBeInTheDocument());
    // Sin cambios: avisa y no envía nada.
    await userEvent.click(guardar);
    expect(within(ventana).getByText("No cambió ningún dato.")).toBeInTheDocument();
    expect(api.update).not.toHaveBeenCalled();

    const [numero, , apellidos] = within(ventana).getAllByRole("textbox");
    await userEvent.clear(apellidos);
    await userEvent.type(apellidos, "Díaz Pérez");
    expect(within(ventana).queryByText("No cambió ningún dato.")).not.toBeInTheDocument(); // se va al cambiar algo
    expect(within(ventana).queryByText(/Cambia el documento/)).not.toBeInTheDocument();
    await userEvent.clear(numero);
    await userEvent.type(numero, "45678913");
    expect(within(ventana).getByText(/Cambia el documento/)).toBeInTheDocument();

    await userEvent.click(guardar);
    expect(api.update).toHaveBeenCalledWith(7, { numeroDocumento: "45678913", apellidos: "Díaz Pérez" });
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Editar datos del personal" })).not.toBeInTheDocument());
    await waitFor(() => expect(onCambio).toHaveBeenCalledTimes(1));
  });

  it("editar datos: un DNI mal escrito no se envía", async () => {
    await montar(persona({ habilitado: true }, { perfil: "contratista" }));
    api.empresas.mockResolvedValue([{ id: 1, razonSocial: "Agencia Sur", estado: "activa" }]);

    await userEvent.click(screen.getByRole("button", { name: "Editar datos" }));
    const ventana = screen.getByRole("heading", { name: "Editar datos del personal" }).parentElement!;
    await waitFor(() => expect(within(ventana).queryByText("Cargando…")).not.toBeInTheDocument());
    const [numero] = within(ventana).getAllByRole("textbox");
    await userEvent.clear(numero);
    await userEvent.type(numero, "4567");
    await userEvent.click(within(ventana).getByRole("button", { name: "Guardar" }));

    expect(within(ventana).getByText("El DNI debe tener 8 dígitos")).toBeInTheDocument();
    expect(api.update).not.toHaveBeenCalled();
  });
});
