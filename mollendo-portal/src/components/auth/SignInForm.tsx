"use client";
import Input from "@/components/form/input/InputField";
import InputPassword from "@/components/form/input/InputPassword";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function SignInForm() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
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
    setLoading(true);
    try {
      await login(correo, password);
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
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* En pantallas angostas el panel de la derecha (con el logo) no se ve.
              En modo oscuro solo la marca: el texto negro del logo no se leería. */}
          <div className="mb-6 lg:hidden">
            <Image
              src="/images/logo/auth-logo-mollendo.png"
              alt="Monte Azul Sur"
              width={160}
              height={79}
              priority
              className="dark:hidden"
            />
            <Image
              src="/images/logo/marca-monteazul.png"
              alt="Monte Azul Sur"
              width={115}
              height={40}
              className="hidden dark:block"
            />
          </div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Control de Acceso · Terminal de Mollendo
            </p>
          </div>
          <form onSubmit={handleSubmit}>
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
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
              <div>
                <Label>
                  Contraseña <span className="text-error-500">*</span>
                </Label>
                <InputPassword placeholder="Ingrese su contraseña" onChange={setPassword} />
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
