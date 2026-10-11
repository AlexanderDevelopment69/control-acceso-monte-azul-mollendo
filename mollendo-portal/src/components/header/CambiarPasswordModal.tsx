"use client";

import React, { useState } from "react";
import { authApi } from "@/lib/api/endpoints";
import { ApiError, setTokens } from "@/lib/api/client";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { EyeCloseIcon, EyeIcon } from "@/icons";

/** Campo de contraseña con el ojo para mostrarla u ocultarla, como en el inicio de sesión. */
function CampoPassword({ id, label, onChange }: { id: string; label: string; onChange: (valor: string) => void }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type={visible ? "text" : "password"} className="pr-12" onChange={(e) => onChange(e.target.value)} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
        >
          {visible ? (
            <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
          ) : (
            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}

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
      const { accessToken, refreshToken } = await authApi.cambiarPassword(actual, nueva);
      // Esta sesión sigue con los tokens nuevos; las de otros equipos se cierran.
      setTokens(accessToken, refreshToken);
      setListo(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar la contraseña");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} bloqueado={guardando} className="max-w-md p-6 sm:p-8">
      <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Cambiar contraseña</h2>
      {listo ? (
        <>
          <p className="mt-4 rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700 dark:bg-success-500/15 dark:text-success-500">
            Contraseña cambiada. Si tenías la sesión abierta en otro equipo, allí tendrás que volver a ingresar.
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
          <CampoPassword id="password-actual" label="Contraseña actual" onChange={setActual} />
          <CampoPassword id="password-nueva" label="Contraseña nueva" onChange={setNueva} />
          <CampoPassword id="password-confirmacion" label="Repite la contraseña nueva" onChange={setConfirmacion} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" disabled={guardando} onClick={onClose}>
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
