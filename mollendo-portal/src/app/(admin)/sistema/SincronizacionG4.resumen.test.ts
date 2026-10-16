import { describe, expect, it } from "vitest";
import { resumenEquipo } from "./SincronizacionG4";

describe("resumen del terminal en la sincronización", () => {
  it("cuántas personas y cuántas con rostro, en palabras", () => {
    expect(resumenEquipo({ usuarios: 1, conRostro: 1 })).toBe("1 persona, con rostro");
    expect(resumenEquipo({ usuarios: 5, conRostro: 5 })).toBe("5 personas, todas con rostro");
    expect(resumenEquipo({ usuarios: 5, conRostro: 3 })).toBe("5 personas, 3 con rostro");
    expect(resumenEquipo({ usuarios: 0, conRostro: 0 })).toBe("ninguna persona");
  });
});
