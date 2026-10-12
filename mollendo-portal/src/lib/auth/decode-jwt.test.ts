import { describe, expect, it } from "vitest";
import { tokenDePrueba } from "@/test/sesion";
import { decodeJwt, isTokenExpired } from "./decode-jwt";

describe("decodeJwt", () => {
  it("lee el payload del token", () => {
    const payload = { sub: 7, empresaId: 1, rol: "administrador", correo: "admin@mollendo.pe", exp: 2_000_000_000 };
    expect(decodeJwt(tokenDePrueba(payload))).toEqual(payload);
  });

  it("lee correos con caracteres que en base64url cambian (- y _)", () => {
    const payload = { sub: 1, empresaId: 1, rol: "vigilancia", correo: "a??>>~~@x.pe", exp: 1 };
    const token = tokenDePrueba(payload);
    expect(token).toMatch(/[-_]/);
    expect(decodeJwt(token)?.correo).toBe(payload.correo);
  });

  it("devuelve null si el token está mal formado", () => {
    expect(decodeJwt("no-es-un-token")).toBeNull();
    expect(decodeJwt("a.%%%.c")).toBeNull();
    expect(decodeJwt("")).toBeNull();
  });
});

describe("isTokenExpired", () => {
  const base = { sub: 1, empresaId: 1, rol: "administrador" as const, correo: "a@b.pe" };

  it("vencido si exp ya pasó", () => {
    expect(isTokenExpired({ ...base, exp: Math.floor(Date.now() / 1000) - 10 })).toBe(true);
  });

  it("vigente si exp es futura", () => {
    expect(isTokenExpired({ ...base, exp: Math.floor(Date.now() / 1000) + 3600 })).toBe(false);
  });
});
