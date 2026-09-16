"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { ApiError } from "@/lib/api/client";
import { authApi } from "@/lib/api/endpoints";
import Link from "next/link";
import React, { useState } from "react";

export default function RecuperarPasswordForm() {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.recuperarPassword(correo);
      setEnviado(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo procesar la solicitud");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ingrese su correo y le enviaremos un enlace para restablecer su contraseña.
          </p>
        </div>

        {enviado ? (
          <div className="rounded-lg bg-success-50 px-4 py-3 text-sm text-success-600 dark:bg-success-500/15 dark:text-success-500">
            Si el correo existe, se envió un enlace de recuperación. Revise su bandeja de entrada.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {error && (
                <ErrorBanner>{error}</ErrorBanner>
              )}
              <div>
                <Label>
                  Correo <span className="text-error-500">*</span>
                </Label>
                <Input type="email" placeholder="correo@empresa.com" onChange={(e) => setCorreo(e.target.value)} />
              </div>
              <Button className="w-full" size="sm" disabled={loading}>
                {loading ? "Enviando…" : "Enviar enlace"}
              </Button>
            </div>
          </form>
        )}

        <p className="mt-5 text-sm text-center text-gray-500 dark:text-gray-400">
          <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
