import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CargaMasivaModal } from "./CargaMasivaModal";
import type { FilaCargaMasiva } from "@/lib/api/types";

const api = vi.hoisted(() => ({ plantillaCarga: vi.fn(), revisarCarga: vi.fn(), registrarCarga: vi.fn(), erroresCarga: vi.fn() }));
vi.mock("@/lib/api/endpoints", () => ({ personasApi: api }));
const guardarArchivo = vi.hoisted(() => vi.fn());
vi.mock("@/lib/descargas", () => ({ guardarArchivo }));

const base = {
  perfil: "Contratista",
  empresa: "DEMO Islay S.A.",
  tipoDocumento: "DNI",
  nombres: "Juan",
  apellidos: "Pérez",
  autorizadoDesde: "",
  autorizadoHasta: "",
  motivoAutorizacion: "",
};
const persona = { empresaId: 1, perfil: "contratista" as const, tipoDocumentoIdentidad: "DNI" as const, numeroDocumento: "40000001", nombres: "Juan", apellidos: "Pérez", autorizadoDesde: null, autorizadoHasta: null, motivoAutorizacion: null };
const FILAS: FilaCargaMasiva[] = [
  { fila: 2, ...base, numeroDocumento: "40000001", estado: "lista", motivos: [], campos: [], persona },
  { fila: 3, ...base, numeroDocumento: "48058719", nombres: "Amiel", apellidos: "Bautista", estado: "existe", motivos: ["Ya está registrado: Bautista, Amiel"], campos: [] },
  { fila: 4, ...base, numeroDocumento: "1234", nombres: "Ana", apellidos: "Rojas", estado: "error", motivos: ["El DNI debe tener 8 dígitos"], campos: ["numeroDocumento"] },
];

beforeEach(() => {
  vi.clearAllMocks();
  api.revisarCarga.mockResolvedValue({ filas: FILAS, resumen: { total: 3, listas: 1, existentes: 1, errores: 1 } });
  api.registrarCarga.mockResolvedValue({ registradas: 1, omitidas: [] });
  api.erroresCarga.mockResolvedValue({ blob: new Blob(), nombre: "carga-personal-errores.xlsx" });
  api.plantillaCarga.mockResolvedValue({ blob: new Blob(), nombre: "plantilla-carga-personal.xlsx" });
});

async function revisarArchivo() {
  const excel = new File(["x"], "personal.xlsx");
  await userEvent.upload(document.querySelector('input[type="file"]') as HTMLInputElement, excel);
  await userEvent.click(screen.getByRole("button", { name: "Revisar archivo" }));
  expect(api.revisarCarga).toHaveBeenCalledWith(excel);
  await screen.findByRole("button", { name: /^Todas \(/ });
}

describe("carga masiva de personal", () => {
  it("descarga la plantilla", async () => {
    render(<CargaMasivaModal isOpen onClose={() => {}} onRegistradas={() => {}} />);
    expect(screen.getByRole("button", { name: "Revisar archivo" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Descargar plantilla" }));
    expect(guardarArchivo).toHaveBeenCalledWith(expect.any(Blob), "plantilla-carga-personal.xlsx");
  });

  it("con alguna fila con error no deja registrar a nadie", async () => {
    render(<CargaMasivaModal isOpen onClose={() => {}} onRegistradas={() => {}} />);
    await revisarArchivo();
    expect(screen.getByText("El DNI debe tener 8 dígitos")).toBeInTheDocument();
    expect(screen.getByText("El archivo tiene errores. Corríjalos y vuelva a subirlo.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Corrija las filas con error" })).toBeDisabled();

    // Abre directo en "Con error": solo las filas a corregir.
    expect(screen.getByRole("button", { name: "Con error (1)" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText("Bautista, Amiel")).not.toBeInTheDocument();
    expect(screen.getByText("Rojas, Ana")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Todas (3)" }));
    expect(screen.getByText("Bautista, Amiel")).toBeInTheDocument();
    expect(api.registrarCarga).not.toHaveBeenCalled();
  });

  it("sin errores registra las filas listas y omite las ya registradas", async () => {
    api.revisarCarga.mockResolvedValue({ filas: FILAS.slice(0, 2), resumen: { total: 2, listas: 1, existentes: 1, errores: 0 } });
    const onRegistradas = vi.fn();
    render(<CargaMasivaModal isOpen onClose={() => {}} onRegistradas={onRegistradas} />);
    await revisarArchivo();
    expect(screen.queryByText(/El archivo tiene errores/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Todas (2)" })).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(screen.getByRole("button", { name: "Registrar 1 persona" }));
    expect(api.registrarCarga).toHaveBeenCalledWith([persona]);
    expect(await screen.findByText("Se registró 1 persona.")).toBeInTheDocument();
    expect(screen.getByText(/le falta su/)).toBeInTheDocument();
    expect(onRegistradas).toHaveBeenCalled();
  });

  it("descarga las filas con error con su motivo", async () => {
    render(<CargaMasivaModal isOpen onClose={() => {}} onRegistradas={() => {}} />);
    await revisarArchivo();
    await userEvent.click(screen.getByRole("button", { name: "Descargar filas con error" }));
    expect(api.erroresCarga).toHaveBeenCalledWith([
      { fila: 4, ...base, numeroDocumento: "1234", nombres: "Ana", apellidos: "Rojas", motivo: "Fila 4: El DNI debe tener 8 dígitos", campos: ["numeroDocumento"] },
    ]);
    expect(guardarArchivo).toHaveBeenCalledWith(expect.any(Blob), "carga-personal-errores.xlsx");
  });
});
