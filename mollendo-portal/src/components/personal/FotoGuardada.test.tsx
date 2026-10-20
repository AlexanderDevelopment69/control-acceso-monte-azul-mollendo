import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FotoGuardada } from "./FotoPersonal";

const { foto } = vi.hoisted(() => ({ foto: vi.fn(() => Promise.resolve(new Blob(["x"], { type: "image/jpeg" }))) }));
vi.mock("@/lib/api/endpoints", () => ({ personasApi: { foto } }));

describe("FotoGuardada", () => {
  it("la misma foto en varias filas se descarga una vez; una foto nueva (otra versión) se vuelve a pedir", async () => {
    URL.createObjectURL = vi.fn(() => "blob:foto");
    URL.revokeObjectURL = vi.fn();

    render(
      <>
        <FotoGuardada personaId={7} tieneFoto version="foto-a.jpg" tamano="size-10" miniatura />
        <FotoGuardada personaId={7} tieneFoto version="foto-a.jpg" tamano="size-10" miniatura />
        <FotoGuardada personaId={7} tieneFoto version="foto-a.jpg" tamano="size-10" miniatura />
      </>,
    );
    await waitFor(() => expect(foto).toHaveBeenCalledTimes(1));
    expect(foto).toHaveBeenCalledWith(7, true);

    render(<FotoGuardada personaId={7} tieneFoto version="foto-b.jpg" tamano="size-10" miniatura />);
    await waitFor(() => expect(foto).toHaveBeenCalledTimes(2));
  });
});
