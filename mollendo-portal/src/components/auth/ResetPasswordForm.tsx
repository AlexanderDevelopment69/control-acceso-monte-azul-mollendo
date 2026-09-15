"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ApiError } from "@/lib/api/client";
import { authApi } from "@/lib/api/endpoints";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("El enlace no es válido — falta el token");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push("/signin"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Restablecer contraseña
          </h1>
        </div>

        {success ? (
          <div className="rounded-lg bg-success-50 px-4 py-3 text-sm text-success-600 dark:bg-success-500/15 dark:text-success-500">
            Contraseña actualizada. Redirigiendo a iniciar sesión…
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {error && (
                <div className="rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">
                  {error}
                </div>
              )}
              <div>
                <Label>
                  Nueva contraseña <span className="text-error-500">*</span>
                </Label>
                <Input type="password" placeholder="Mínimo 8 caracteres" onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <Label>
                  Confirmar contraseña <span className="text-error-500">*</span>
                </Label>
                <Input type="password" placeholder="Repita la contraseña" onChange={(e) => setConfirmar(e.target.value)} />
              </div>
              <Button className="w-full" size="sm" disabled={loading}>
                {loading ? "Guardando…" : "Restablecer contraseña"}
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
