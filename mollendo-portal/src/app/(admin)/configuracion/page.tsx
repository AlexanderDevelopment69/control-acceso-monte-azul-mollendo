"use client";

import React, { useEffect, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { configuracionSmtpApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { ConfiguracionSmtp } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Checkbox from "@/components/form/input/Checkbox";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { PageHeader } from "@/components/common/PageHeader";

function ConfiguracionSmtpSection() {
  const [config, setConfig] = useState<ConfiguracionSmtp | null>(null);
  const [cargando, setCargando] = useState(true);

  const [host, setHost] = useState("");
  const [puerto, setPuerto] = useState("587");
  const [seguro, setSeguro] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [remitente, setRemitente] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const [correoPrueba, setCorreoPrueba] = useState("");
  const [probando, setProbando] = useState(false);
  const [errorPrueba, setErrorPrueba] = useState<string | null>(null);
  const [mensajePrueba, setMensajePrueba] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      try {
        const data = await configuracionSmtpApi.obtener();
        setConfig(data);
        if (data.configurado) {
          setHost(data.host);
          setPuerto(String(data.puerto));
          setSeguro(data.seguro);
          setUsuario(data.usuario ?? "");
          setRemitente(data.remitente);
        }
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      const data = await configuracionSmtpApi.guardar({
        host,
        puerto: Number(puerto),
        seguro,
        usuario: usuario || undefined,
        password: password || undefined,
        remitente,
      });
      setConfig(data);
      setPassword("");
      setMensaje("Configuración guardada.");
      setError(null);
    } catch (err) {
      setMensaje(null);
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la configuración");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar() {
    setEliminando(true);
    try {
      await configuracionSmtpApi.eliminar();
      setHost("");
      setPuerto("587");
      setSeguro(false);
      setUsuario("");
      setPassword("");
      setRemitente("");
      setConfig({ configurado: false });
      setMensaje("Se quitó la configuración guardada — el sistema vuelve a usar las variables de entorno, si existen.");
      setError(null);
    } catch (err) {
      setMensaje(null);
      setError(err instanceof ApiError ? err.message : "No se pudo quitar la configuración");
    } finally {
      setEliminando(false);
    }
  }

  async function handleProbar(e: React.FormEvent) {
    e.preventDefault();
    setProbando(true);
    try {
      await configuracionSmtpApi.probar(correoPrueba);
      setMensajePrueba(`Correo de prueba enviado a ${correoPrueba}.`);
      setErrorPrueba(null);
    } catch (err) {
      setMensajePrueba(null);
      setErrorPrueba(err instanceof ApiError ? err.message : "No se pudo enviar el correo de prueba");
    } finally {
      setProbando(false);
    }
  }

  if (cargando) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-gray-400">Cargando configuración de correo…</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Correo (SMTP)</h2>
        <p className="mt-1 text-xs text-gray-400">
          Usado para las invitaciones a empresas y la recuperación de contraseña. Si no se configura aquí, el sistema
          usa las variables de entorno del servidor.
        </p>
      </div>

      <div className="space-y-4 p-5">
        {mensaje && (
          <div className="rounded-lg bg-success-50 px-4 py-3 text-sm text-success-600 dark:bg-success-500/15 dark:text-success-500">
            {mensaje}
          </div>
        )}
        {error && <ErrorBanner>{error}</ErrorBanner>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Host</Label>
              <Input defaultValue={host} onChange={(e) => setHost(e.target.value)} placeholder="smtp.mailtrap.io" />
            </div>
            <div>
              <Label>Puerto</Label>
              <Input type="number" defaultValue={puerto} onChange={(e) => setPuerto(e.target.value)} placeholder="587" />
            </div>
            <div>
              <Label>Usuario (opcional)</Label>
              <Input defaultValue={usuario} onChange={(e) => setUsuario(e.target.value)} />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input
                type="password"
                defaultValue={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  config?.configurado && config.passwordConfigurada ? "•••••••• (ya configurada)" : "Sin configurar"
                }
                hint="Déjala en blanco para conservar la que ya está guardada."
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Remitente</Label>
              <Input
                type="email"
                defaultValue={remitente}
                onChange={(e) => setRemitente(e.target.value)}
                placeholder="no-reply@mollendo.local"
              />
            </div>
          </div>

          <Checkbox
            id="smtp-seguro"
            checked={seguro}
            onChange={setSeguro}
            label="Conexión segura (TLS/SSL) — activar para el puerto 465"
          />

          <div className="flex flex-wrap gap-3">
            <Button disabled={guardando}>{guardando ? "Guardando…" : "Guardar configuración"}</Button>
            {config?.configurado && (
              <Button type="button" variant="outline" disabled={eliminando} onClick={handleEliminar}>
                {eliminando ? "Quitando…" : "Quitar configuración"}
              </Button>
            )}
          </div>
        </form>

        <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">Enviar correo de prueba</p>
          {mensajePrueba && (
            <div className="mb-3 rounded-lg bg-success-50 px-4 py-3 text-sm text-success-600 dark:bg-success-500/15 dark:text-success-500">
              {mensajePrueba}
            </div>
          )}
          {errorPrueba && <ErrorBanner className="mb-3">{errorPrueba}</ErrorBanner>}
          <form onSubmit={handleProbar} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label>Correo de destino</Label>
              <Input
                type="email"
                defaultValue={correoPrueba}
                onChange={(e) => setCorreoPrueba(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
              />
            </div>
            <Button type="submit" variant="outline" disabled={probando} className="min-w-[150px] shrink-0">
              {probando ? "Enviando…" : "Enviar prueba"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ConfiguracionContent() {
  return (
    <div>
      <PageHeader title="Configuración" description="Ajustes generales del sistema." />
      <ConfiguracionSmtpSection />
    </div>
  );
}

export default function ConfiguracionPage() {
  return (
    <RequireRole roles={["administracion"]}>
      <ConfiguracionContent />
    </RequireRole>
  );
}
