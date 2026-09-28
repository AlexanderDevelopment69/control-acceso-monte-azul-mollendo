"use client";

import React, { useState } from "react";
import { authApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { ErrorBanner } from "@/components/common/ErrorBanner";

/**
 * El usuario que inició sesión (administrador o vigilancia) cambia su propia
 * contraseña. El padre lo vuelve a montar (key) cada vez que lo abre, para
 * que empiece vacío.
 */
export function CambiarPasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!actual) {
      setError("Escribe tu contraseña actual");
      return;
    }
    if (nueva.length < 8) {
      setError("La contraseña nueva debe tener al menos 8 caracteres");
      return;
    }
    if (nueva !== confirmacion) {
      setError("La confirmación no coincide con la contraseña nueva");
      return;
    }
    setGuardando(true);
    try {
      await authApi.cambiarPassword(actual, nueva);
      setListo(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar la contraseña");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
      <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Cambiar contraseña</h2>
      {listo ? (
        <>
          <p className="mt-4 rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700 dark:bg-success-500/15 dark:text-success-500">
            Contraseña cambiada. Úsala la próxima vez que inicies sesión.
          </p>
          <div className="mt-6 flex justify-end">
            <Button type="button" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">La contraseña nueva debe tener al menos 8 caracteres.</p>
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <div>
            <Label htmlFor="password-actual">Contraseña actual</Label>
            <Input id="password-actual" type="password" onChange={(e) => setActual(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password-nueva">Contraseña nueva</Label>
            <Input id="password-nueva" type="password" onChange={(e) => setNueva(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password-confirmacion">Repite la contraseña nueva</Label>
            <Input id="password-confirmacion" type="password" onChange={(e) => setConfirmacion(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : "Cambiar contraseña"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
