import { describe, expect, it } from "vitest";
import { validarArchivoDocumento, validarNumeroDocumento } from "./archivoDocumento";

/** Archivo de prueba con el tipo y el tamaño dados, sin reservar esa memoria. */
function archivo(tipo: string, tamano = 1000): File {
  const f = new File(["x"], "documento", { type: tipo });
  Object.defineProperty(f, "size", { value: tamano });
  return f;
}

describe("validarArchivoDocumento", () => {
  it.each(["application/pdf", "image/jpeg", "image/png", "image/webp", "application/msword"])("acepta %s", (tipo) => {
    expect(validarArchivoDocumento(archivo(tipo))).toBeNull();
  });

  it("rechaza otros formatos", () => {
    expect(validarArchivoDocumento(archivo("application/zip"))).toMatch(/PDF, imagen/);
    expect(validarArchivoDocumento(archivo("text/plain"))).toMatch(/PDF, imagen/);
  });

  it("acepta hasta 20 MB y rechaza más", () => {
    expect(validarArchivoDocumento(archivo("application/pdf", 20 * 1024 * 1024))).toBeNull();
    expect(validarArchivoDocumento(archivo("application/pdf", 20 * 1024 * 1024 + 1))).toMatch(/20 MB/);
  });
});

describe("validarNumeroDocumento", () => {
  it("DNI: exactamente 8 dígitos", () => {
    expect(validarNumeroDocumento("DNI", "12345678")).toBeNull();
    expect(validarNumeroDocumento("DNI", "1234567")).toBe("El DNI debe tener 8 dígitos");
    expect(validarNumeroDocumento("DNI", "123456789")).toBe("El DNI debe tener 8 dígitos");
    expect(validarNumeroDocumento("DNI", "1234567A")).toBe("El DNI debe tener 8 dígitos");
  });

  it("CE y pasaporte: letras y números", () => {
    expect(validarNumeroDocumento("CE", "AB123456")).toBeNull();
    expect(validarNumeroDocumento("PASAPORTE", "X1")).toBeNull();
    expect(validarNumeroDocumento("PASAPORTE", "AB-123")).toMatch(/solo puede tener letras y números/);
    expect(validarNumeroDocumento("CE", "AB 123")).toMatch(/solo puede tener letras y números/);
  });
});
