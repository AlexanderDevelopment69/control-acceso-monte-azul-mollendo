"use client";
import Input from "@/components/form/input/InputField";
import InputPassword from "@/components/form/input/InputPassword";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import { AlertIcon } from "@/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

/** Lo que falta antes de enviar: con algo vacío o mal escrito no se envía (ni cuenta como intento). */
export function erroresInicioSesion(correo: string, password: string): { correo?: string; password?: string } {
  const errores: { correo?: string; password?: string } = {};
  const c = correo.trim();
  if (!c) errores.correo = "Ingrese su correo";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) errores.correo = "Ingrese un correo válido";
  if (!password) errores.password = "Ingrese su contraseña";
  return errores;
}

/** Aviso debajo de un campo: ícono y texto en rojo (el campo no se pinta). */
function AvisoCampo({ id, texto }: { id: string; texto?: string }) {
  if (!texto) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-error-500">
      <AlertIcon className="size-3.5 shrink-0" />
      {texto}
    </p>
  );
}

export default function SignInForm() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errores, setErrores] = useState<{ correo?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const { user, loading: cargandoSesion, login } = useAuth();
  const router = useRouter();

  // Con la sesión ya abierta no tiene sentido el login: a la pantalla de inicio
  // ("/" manda al administrador a Personal y al vigilante a su panel).
  useEffect(() => {
    if (!cargandoSesion && user) router.replace("/");
  }, [cargandoSesion, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const faltan = erroresInicioSesion(correo, password);
    setErrores(faltan);
    if (faltan.correo || faltan.password) {
      setError(null);
      return;
    }
    setLoading(true);
    try {
      await login(correo.trim(), password);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  // Mientras se lee la sesión o se redirige, sin formulario (no aparece por un instante).
  if (cargandoSesion || user) return <div className="flex-1 lg:w-1/2 w-full" />;

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto py-8 lg:py-0">
        <div>
          {/* En pantallas angostas el panel de la derecha (con el logo) no se ve.
              En modo oscuro, la versión con el texto en blanco. */}
          <div className="mb-6 lg:hidden">
            <Image src="/images/logo/auth-logo-mollendo.png" alt="Monte Azul Sur" width={160} height={79} loading="eager" className="dark:hidden" />
            <Image src="/images/logo/auth-logo-mollendo-oscuro.png" alt="Monte Azul Sur" width={160} height={79} className="hidden dark:block" />
          </div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingrese con su correo y contraseña para continuar.
            </p>
          </div>
          {/* noValidate: los avisos son los del portal (en español y debajo de cada campo), no los del navegador. */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              {error && (
                <ErrorBanner>{error}</ErrorBanner>
              )}
              <div>
                <Label>
                  Correo <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="correo@empresa.com"
                  required
                  autoComplete="username"
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    setErrores((x) => ({ ...x, correo: undefined }));
                  }}
                />
                <AvisoCampo id="aviso-correo" texto={errores.correo} />
              </div>
              <div>
                <Label>
                  Contraseña <span className="text-error-500">*</span>
                </Label>
                <InputPassword
                  placeholder="Ingrese su contraseña"
                  required
                  autoComplete="current-password"
                  onChange={(valor) => {
                    setPassword(valor);
                    setErrores((x) => ({ ...x, password: undefined }));
                  }}
                />
                <AvisoCampo id="aviso-password" texto={errores.password} />
              </div>
              <div>
                <Button className="w-full" size="sm" disabled={loading}>
                  {loading ? "Ingresando…" : "Ingresar"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
