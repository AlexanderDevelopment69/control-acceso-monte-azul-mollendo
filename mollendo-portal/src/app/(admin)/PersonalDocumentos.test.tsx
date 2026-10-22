import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import type { Cumplimiento, Empresa, Persona } from "@/lib/api/types";
import { PersonalDocumentos } from "./PersonalDocumentos";

const api = vi.hoisted(() => ({ personas: vi.fn(), empresas: vi.fn() }));
vi.mock("@/lib/api/endpoints", () => ({
  personasApi: { list: api.personas },
  empresasApi: { list: api.empresas },
}));
// La ficha tiene sus propias consultas: aquí basta saber a quién se abrió y,
// con un botón, simular que entrega los datos de la persona tras un cambio.
const cambio = vi.hoisted(() => ({ persona: null as Persona | null }));
vi.mock("@/components/personal/PersonaFicha", async (original) => ({
  ...(await original<typeof import("@/components/personal/PersonaFicha")>()),
  PersonaFicha: ({ personaId, onCambio }: { personaId: number; onCambio: (p: Persona) => void }) => (
    <div>
      <p>Ficha de la persona {personaId}</p>
      <button type="button" onClick={() => onCambio(cambio.persona!)}>
        Simular cambio
      </button>
    </div>
  ),
}));

const EMPRESAS: Empresa[] = [
  { id: 1, razonSocial: "Transportes Norte" },
  { id: 2, razonSocial: "Agencia Sur" },
] as Empresa[];

function persona(id: number, nombres: string, apellidos: string, empresaId: number, cumplimiento: Partial<Cumplimiento>, extra: Partial<Persona> = {}): Persona {
  return {
    id,
    empresaId,
    perfil: null,
    tipoDocumentoIdentidad: "DNI",
    numeroDocumento: String(40000000 + id),
    nombres,
    apellidos,
    fotoUrl: null,
    estado: "activo",
    creadoEn: "2026-01-01T00:00:00.000Z",
    empresa: EMPRESAS.find((e) => e.id === empresaId),
    cumplimiento: { habilitado: false, dadoDeBaja: false, sinDocumentos: false, documentosVencidos: [], ...cumplimiento },
    ...extra,
  };
}

const PERSONAS: Persona[] = [
  persona(1, "Ana", "Torres", 1, { habilitado: true }),
  persona(2, "Luis", "Pérez", 2, { sinDocumentos: true }),
  persona(3, "Rosa", "Díaz", 1, { documentosVencidos: ["SCTR", "Licencia"] }),
  persona(4, "Juan", "Ríos", 2, { dadoDeBaja: true }, { estado: "inactivo", motivoBaja: "Renuncia" }),
];

beforeEach(() => {
  api.personas.mockReset().mockResolvedValue(PERSONAS);
  api.empresas.mockReset().mockResolvedValue(EMPRESAS);
});

/** Nombres que se ven en la lista, en orden. */
function enLista(): string[] {
  return within(screen.getByRole("list"))
    .queryAllByRole("button")
    .map((b) => b.querySelector(".font-medium")!.textContent!);
}

/** Pestaña ("Todos", "No pueden", "Pueden") y el número que muestra. */
function pestana(nombre: string) {
  const boton = screen.getAllByRole("button").find((b) => b.textContent?.replace(/\d+$/, "") === nombre)!;
  return { boton, cuenta: Number(boton.textContent!.match(/\d+$/)![0]) };
}

async function montar() {
  render(<PersonalDocumentos />);
  await screen.findByText("Torres, Ana");
}

describe("Personal y documentos", () => {
  it("muestra a todo el personal con su ✔/✖ y el motivo de los que no pueden", async () => {
    await montar();
    expect(enLista()).toEqual(["Torres, Ana", "Pérez, Luis", "Díaz, Rosa", "Ríos, Juan"]);
    expect(screen.getAllByLabelText("Puede ingresar")).toHaveLength(1);
    expect(screen.getAllByLabelText("No puede ingresar")).toHaveLength(3);
    expect(screen.getByText("Sin documentos cargados")).toBeInTheDocument();
    expect(screen.getByText("Vencido: SCTR, Licencia")).toBeInTheDocument();
    expect(screen.getByText("Dado de baja: Renuncia")).toBeInTheDocument();
  });

  it("las pestañas cuentan y filtran", async () => {
    await montar();
    expect(pestana("Todos").cuenta).toBe(4);
    expect(pestana("No pueden").cuenta).toBe(3);
    expect(pestana("Pueden").cuenta).toBe(1);

    await userEvent.click(pestana("Pueden").boton);
    expect(enLista()).toEqual(["Torres, Ana"]);

    await userEvent.click(pestana("No pueden").boton);
    expect(enLista()).toEqual(["Pérez, Luis", "Díaz, Rosa", "Ríos, Juan"]);
  });

  it("dentro de “No pueden”: por documentos o dados de baja", async () => {
    await montar();
    await userEvent.click(pestana("No pueden").boton);

    await userEvent.click(screen.getByRole("button", { name: "Documentos (2)" }));
    expect(enLista()).toEqual(["Pérez, Luis", "Díaz, Rosa"]);

    await userEvent.click(screen.getByRole("button", { name: "De baja (1)" }));
    expect(enLista()).toEqual(["Ríos, Juan"]);

    await userEvent.click(screen.getByRole("button", { name: "Todos (3)" }));
    expect(enLista()).toHaveLength(3);
  });

  it("busca por nombre, DNI o empresa, y las pestañas cuentan sobre lo buscado", async () => {
    await montar();
    const buscar = screen.getByPlaceholderText("Buscar por nombre, DNI o empresa…");

    await userEvent.type(buscar, "pérez");
    expect(enLista()).toEqual(["Pérez, Luis"]);

    await userEvent.clear(buscar);
    await userEvent.type(buscar, "40000003");
    expect(enLista()).toEqual(["Díaz, Rosa"]);

    await userEvent.clear(buscar);
    await userEvent.type(buscar, "transportes");
    expect(enLista()).toEqual(["Torres, Ana", "Díaz, Rosa"]);
    expect(pestana("Todos").cuenta).toBe(2);
    expect(pestana("No pueden").cuenta).toBe(1);

    await userEvent.clear(buscar);
    await userEvent.type(buscar, "nadie así");
    expect(screen.getByText("Sin resultados.")).toBeInTheDocument();
  });

  it("filtra por empresa", async () => {
    await montar();
    await userEvent.click(screen.getByRole("combobox", { name: "Empresa" }));
    await userEvent.click(screen.getByRole("option", { name: "Agencia Sur" }));
    expect(enLista()).toEqual(["Pérez, Luis", "Ríos, Juan"]);
    expect(screen.getByText("En la empresa elegida")).toBeInTheDocument();
  });

  it("sin nadie elegido: contadores que también filtran la lista", async () => {
    await montar();
    const tarjeta = (titulo: string) => screen.getByText(titulo).closest("button")!;
    expect(tarjeta("Personal")).toHaveTextContent("4");
    expect(tarjeta("Pueden ingresar")).toHaveTextContent("1");
    expect(tarjeta("No pueden ingresar")).toHaveTextContent("3");

    await userEvent.click(tarjeta("Pueden ingresar"));
    expect(enLista()).toEqual(["Torres, Ana"]);
  });

  it("al elegir a una persona se abre su ficha; otro clic la cierra", async () => {
    await montar();
    expect(screen.getByText("Elija a una persona de la lista para ver y subir sus documentos.")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Díaz, Rosa"));
    expect(screen.getByText("Ficha de la persona 3")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Torres, Ana"));
    expect(screen.getByText("Ficha de la persona 1")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Torres, Ana"));
    expect(screen.queryByText(/Ficha de la persona/)).not.toBeInTheDocument();
    expect(screen.getByText("Elija a una persona de la lista para ver y subir sus documentos.")).toBeInTheDocument();
  });

  it("tras un cambio en la ficha, actualiza solo esa fila sin volver a pedir la lista", async () => {
    await montar();
    await userEvent.click(screen.getByText("Díaz, Rosa"));
    expect(screen.getByText("Vencido: SCTR, Licencia")).toBeInTheDocument();

    // La ficha trae también el historial; la fila no lo guarda.
    cambio.persona = persona(3, "Rosa", "Díaz", 1, { habilitado: true }, { documentos: [], documentosActuales: [] });
    await userEvent.click(screen.getByRole("button", { name: "Simular cambio" }));

    expect(screen.queryByText("Vencido: SCTR, Licencia")).not.toBeInTheDocument();
    expect(screen.getAllByLabelText("Puede ingresar")).toHaveLength(2);
    expect(pestana("Pueden").cuenta).toBe(2);
    expect(enLista()).toEqual(["Torres, Ana", "Pérez, Luis", "Díaz, Rosa", "Ríos, Juan"]);
    expect(api.personas).toHaveBeenCalledTimes(1);
  });

  it("si la carga falla, avisa y permite reintentar", async () => {
    api.personas.mockRejectedValueOnce(new ApiError("El servidor no respondió", 503));
    render(<PersonalDocumentos />);
    expect(await screen.findByText("El servidor no respondió")).toBeInTheDocument();
    expect(screen.getByText("No se pudo cargar el personal.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("Torres, Ana")).toBeInTheDocument();
    expect(screen.queryByText("El servidor no respondió")).not.toBeInTheDocument();
  });

  it("sin personal registrado: indica cómo empezar", async () => {
    api.personas.mockResolvedValue([]);
    render(<PersonalDocumentos />);
    expect(await screen.findByText(/Todavía no hay personal registrado/)).toHaveTextContent("Todavía no hay personal registrado. Use + Nuevo personal.");
  });

  it("con muchas personas dibuja la lista por tandas", async () => {
    api.personas.mockResolvedValue(Array.from({ length: 250 }, (_, i) => persona(i + 1, `N${i + 1}`, `A${i + 1}`, 1, { habilitado: true })));
    render(<PersonalDocumentos />);
    await screen.findByText("A1, N1");
    expect(enLista()).toHaveLength(100);
    expect(screen.getByText("Mostrando 100 de 250…")).toBeInTheDocument();
  });
  it("filtra por perfil y, con un perfil, solo ofrece las empresas que lo tienen", async () => {
    api.personas.mockResolvedValue([
      persona(1, "Ana", "Torres", 1, { habilitado: true }, { perfil: "conductor" }),
      persona(2, "Luis", "Pérez", 2, { habilitado: true }, { perfil: "contratista" }),
      persona(3, "Rosa", "Díaz", 1, { habilitado: true }, { perfil: "conductor" }),
      persona(4, "Juan", "Ríos", 2, { habilitado: true }),
    ]);
    await montar();
    const personal = within(screen.getByRole("list"));
    expect(personal.getAllByText("Conductor")).toHaveLength(2);
    expect(personal.getByText("Sin perfil")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("combobox", { name: "Perfil" }));
    await userEvent.click(screen.getByRole("option", { name: "Conductor" }));
    expect(enLista()).toEqual(["Torres, Ana", "Díaz, Rosa"]);

    // Solo "Transportes Norte" tiene conductores (2).
    const empresa = screen.getByRole("combobox", { name: "Empresa" });
    await userEvent.click(empresa);
    const lista = document.getElementById(empresa.getAttribute("aria-controls")!)!;
    const opciones = within(lista).getAllByRole("option").map((o) => o.textContent);
    expect(opciones).toEqual(["Todas las empresas (1)", "Transportes Norte2"]);
    await userEvent.keyboard("{Escape}");

    // "Sin perfil" no es una opción del filtro: solo se ve en la etiqueta, para completarlo.
    const perfil = screen.getByRole("combobox", { name: "Perfil" });
    await userEvent.click(perfil);
    const opcionesPerfil = document.getElementById(perfil.getAttribute("aria-controls")!)!;
    expect(within(opcionesPerfil).queryByRole("option", { name: "Sin perfil" })).toBeNull();
  });
});
