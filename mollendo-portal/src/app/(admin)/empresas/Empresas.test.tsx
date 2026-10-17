import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EmpresasPage from "./page";
import { cambiosEmpresa, problemaEmpresa } from "@/components/empresas/EmpresaModal";
import type { Empresa } from "@/lib/api/types";

const api = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), update: vi.fn() }));
vi.mock("@/lib/api/endpoints", () => ({ empresasApi: api }));
vi.mock("@/lib/auth/RequireRole", () => ({ RequireRole: ({ children }: { children: React.ReactNode }) => children }));
// jsdom no trae ResizeObserver (lo usa AltoEstable con una página completa).
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    disconnect() {}
  },
);

const empresa = (id: number, datos: Partial<Empresa> = {}): Empresa => ({
  id,
  ruc: `2010000000${id}`.slice(0, 11),
  razonSocial: `Empresa ${id}`,
  correoContacto: `contacto${id}@empresa.pe`,
  telefonoContacto: null,
  estado: "activa",
  contratoVigenciaInicio: null,
  contratoVigenciaFin: null,
  creadoEn: "2026-10-01T00:00:00.000Z",
  actualizadoEn: "2026-10-01T00:00:00.000Z",
  personalActivo: 0,
  ...datos,
});

const EMPRESAS = [
  empresa(1, { razonSocial: "Estibajes del Sur E.I.R.L.", personalActivo: 12 }),
  empresa(2, { razonSocial: "Transportes Cerrados S.A.C.", estado: "inactiva" }),
  empresa(3, { razonSocial: "Agencia José Gálvez S.A.", telefonoContacto: "054-123456", personalActivo: 1 }),
];

beforeEach(() => {
  vi.clearAllMocks();
  api.list.mockResolvedValue(EMPRESAS);
  api.update.mockImplementation(async (id: number, datos: Partial<Empresa>) => ({ ...EMPRESAS.find((e) => e.id === id)!, ...datos }));
});

describe("datos de la empresa", () => {
  it("revisa RUC, razón social y correo antes de enviar", () => {
    const ok = { ruc: "20123456789", razonSocial: "Estibajes", correoContacto: "a@b.pe", telefonoContacto: "" };
    expect(problemaEmpresa(ok)).toBeNull();
    expect(problemaEmpresa({ ...ok, ruc: "2012345678" })).toBe("El RUC debe tener 11 dígitos");
    expect(problemaEmpresa({ ...ok, razonSocial: "  " })).toBe("La razón social es obligatoria");
    expect(problemaEmpresa({ ...ok, correoContacto: "sin-arroba" })).toBe("Ingresa un correo válido");
  });

  it("al editar envía solo lo que cambió", () => {
    const e = EMPRESAS[2];
    const datos = { ruc: e.ruc, razonSocial: " Agencia José Gálvez S.A.C. ", correoContacto: e.correoContacto, telefonoContacto: "054-123456" };
    expect(cambiosEmpresa(e, datos)).toEqual({ razonSocial: "Agencia José Gálvez S.A.C." });
    expect(cambiosEmpresa(e, { ...datos, razonSocial: e.razonSocial })).toEqual({});
  });
});

describe("vista Empresas", () => {
  it("lista con personal activo y estado, y busca sin importar tildes", async () => {
    render(<EmpresasPage />);
    expect(await screen.findByText("Estibajes del Sur E.I.R.L.")).toBeInTheDocument();
    expect(screen.getByText("Inactiva")).toBeInTheDocument();
    expect(screen.getByText("Mostrando 1 a 3 de 3 registros")).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(/Buscar/), "jose galvez");
    expect(screen.getByText("Agencia José Gálvez S.A.")).toBeInTheDocument();
    expect(screen.queryByText("Estibajes del Sur E.I.R.L.")).not.toBeInTheDocument();
  });

  it("al desactivar una empresa con personal activo, avisa que seguirán pudiendo ingresar", async () => {
    render(<EmpresasPage />);
    const fila = (await screen.findByText("Estibajes del Sur E.I.R.L.")).closest("tr")!;
    await userEvent.click(within(fila).getByRole("button", { name: "Desactivar" }));
    expect(screen.getByText(/tiene 12 personas activas/)).toHaveTextContent("seguirán pudiendo ingresar");

    // El botón de la confirmación (el último "Desactivar": la ventana va después de la tabla).
    await userEvent.click(screen.getAllByRole("button", { name: "Desactivar" }).at(-1)!);
    expect(api.update).toHaveBeenCalledWith(1, { estado: "inactiva" });
    expect(await screen.findByText("Estibajes del Sur E.I.R.L. quedó inactiva.")).toBeInTheDocument();
    expect(api.list).toHaveBeenCalledTimes(2);
  });
});
