"use client";

import React, { useCallback, useEffect, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";
import { usuariosApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { UsuarioCuenta } from "@/lib/api/types";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import InputPassword from "@/components/form/input/InputPassword";
import { TrashBinIcon } from "@/icons";

const REGLA_PASSWORD = "Al menos 10 caracteres, con letras y números.";

/** Las mismas reglas que la API (PasswordSegura) y que Cambiar contraseña, para avisar antes de enviar. */
function problemaPassword(password: string, repetida: string): string | null {
  if (password.length < 10) return "La contraseña debe tener al menos 10 caracteres";
  if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(password) || !/\d/.test(password)) return "La contraseña debe tener letras y números";
  if (password !== repetida) return "La confirmación no coincide con la contraseña";
  return null;
}

function CampoPassword({ id, label, onChange }: { id: string; label: string; onChange: (valor: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <InputPassword id={id} onChange={onChange} />
    </div>
  );
}

/** Nueva cuenta de vigilancia: correo y contraseña (dos veces). */
function NuevaCuenta({
  abierta,
  existentes,
  onCerrar,
  onCreada,
}: {
  abierta: boolean;
  /** Para avisar de un correo repetido sin consultar a la API. */
  existentes: UsuarioCuenta[];
  onCerrar: () => void;
  onCreada: (u: UsuarioCuenta) => void;
}) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [repetida, setRepetida] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) return setError("Ingrese un correo válido");
    if (existentes.some((c) => c.correo === correo.trim().toLowerCase())) return setError("Ya existe un usuario con ese correo");
    const problema = problemaPassword(password, repetida);
    if (problema) return setError(problema);
    setError(null);
    setGuardando(true);
    try {
      onCreada(await usuariosApi.crear({ correo: correo.trim().toLowerCase(), rol: "vigilancia", password }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear la cuenta");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal isOpen={abierta} onClose={onCerrar} bloqueado={guardando} className="max-w-md p-6 sm:p-8">
      <h2 className="mb-1 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">Nueva cuenta de vigilancia</h2>
      {/* noValidate: el correo lo revisa el formulario, con el mensaje del sistema (sin el globo del navegador). */}
      <form onSubmit={guardar} noValidate className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Con este correo y contraseña entra el vigilante. {REGLA_PASSWORD}</p>
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <div>
          <Label htmlFor="cuenta-correo">Correo</Label>
          <Input id="cuenta-correo" type="email" onChange={(e) => setCorreo(e.target.value)} />
        </div>
        <CampoPassword id="cuenta-password" label="Contraseña" onChange={setPassword} />
        <CampoPassword id="cuenta-repetida" label="Repita la contraseña" onChange={setRepetida} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" disabled={guardando} onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Crear cuenta"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** El administrador le pone una contraseña nueva a una cuenta de vigilancia (se cierran sus sesiones). */
function CambiarPassword({ cuenta, onCerrar, onCambiada }: { cuenta: UsuarioCuenta | null; onCerrar: () => void; onCambiada: () => void }) {
  const [password, setPassword] = useState("");
  const [repetida, setRepetida] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!cuenta) return;
    const problema = problemaPassword(password, repetida);
    if (problema) return setError(problema);
    setError(null);
    setGuardando(true);
    try {
      await usuariosApi.actualizar(cuenta.id, { password });
      onCambiada();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar la contraseña");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal isOpen={!!cuenta} onClose={onCerrar} bloqueado={guardando} className="max-w-md p-6 sm:p-8">
      <h2 className="mb-1 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">Cambiar contraseña</h2>
      <form onSubmit={guardar} className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          De <strong className="font-medium text-gray-700 dark:text-gray-300">{cuenta?.correo}</strong>. Al guardar, se cierran sus sesiones
          abiertas y debe entrar con la nueva. {REGLA_PASSWORD}
        </p>
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <CampoPassword id="cuenta-password-nueva" label="Contraseña nueva" onChange={setPassword} />
        <CampoPassword id="cuenta-password-repetida" label="Repita la contraseña nueva" onChange={setRepetida} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" disabled={guardando} onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Cambiar contraseña"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Dar de baja (no puede entrar; se cierran sus sesiones) o reactivar una cuenta de vigilancia. */
function CambiarEstado({ cuenta, onCerrar, onCambiado }: { cuenta: UsuarioCuenta | null; onCerrar: () => void; onCambiado: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const baja = cuenta?.estadoCuenta === "activo";

  async function confirmar() {
    if (!cuenta) return;
    setError(null);
    setGuardando(true);
    try {
      await usuariosApi.actualizar(cuenta.id, { estadoCuenta: baja ? "baja" : "activo" });
      onCambiado();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar la cuenta");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal isOpen={!!cuenta} onClose={onCerrar} bloqueado={guardando} className="max-w-md p-6 sm:p-8">
      <h2 className="mb-2 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">{baja ? "Dar de baja la cuenta" : "Reactivar la cuenta"}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {baja ? (
          <>
            ¿Dar de baja la cuenta <strong>{cuenta?.correo}</strong>? Ya no podrá entrar al sistema y se cierran sus sesiones. Su historial
            se conserva.
          </>
        ) : (
          <>
            ¿Reactivar la cuenta <strong>{cuenta?.correo}</strong>? Podrá volver a entrar con su contraseña.
          </>
        )}
      </p>
      {error && <ErrorBanner className="mt-4">{error}</ErrorBanner>}
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" disabled={guardando} onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="button" variant={baja ? "danger" : "primary"} disabled={guardando} onClick={() => void confirmar()}>
          {guardando ? "Guardando…" : baja ? "Dar de baja" : "Reactivar"}
        </Button>
      </div>
    </Modal>
  );
}

/** Correo nuevo de una cuenta (con él se entra). Se cierran sus sesiones; si es la propia, también esta. */
function CambiarCorreo({
  cuenta,
  propia,
  existentes,
  onCerrar,
  onCambiado,
}: {
  cuenta: UsuarioCuenta | null;
  propia: boolean;
  existentes: UsuarioCuenta[];
  onCerrar: () => void;
  onCambiado: (correo: string) => void;
}) {
  const [correo, setCorreo] = useState(cuenta?.correo ?? "");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!cuenta) return;
    const nuevo = correo.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevo)) return setError("Ingrese un correo válido");
    if (nuevo === cuenta.correo) return setError("Es el mismo correo de ahora");
    // Con la lista ya cargada se avisa sin consultar a la API (el mismo mensaje que daría ella).
    if (existentes.some((c) => c.correo === nuevo)) return setError("Ya existe un usuario con ese correo");
    setError(null);
    setGuardando(true);
    try {
      await usuariosApi.actualizar(cuenta.id, { correo: nuevo });
      onCambiado(nuevo);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar el correo");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal isOpen={!!cuenta} onClose={onCerrar} bloqueado={guardando} className="max-w-md p-6 sm:p-8">
      <h2 className="mb-1 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">Cambiar correo</h2>
      <form onSubmit={guardar} noValidate className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {propia
            ? "Es su cuenta: al guardar se cierra su sesión y entra con el correo nuevo y la misma contraseña."
            : "Al guardar, se cierran sus sesiones abiertas y entra con el correo nuevo y la misma contraseña."}
        </p>
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <div>
          <Label htmlFor="cuenta-correo-nuevo">Correo</Label>
          <Input id="cuenta-correo-nuevo" type="email" defaultValue={cuenta?.correo} onChange={(e) => setCorreo(e.target.value)} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" disabled={guardando} onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Cambiar correo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Eliminar una cuenta que nunca se usó (creada por error). */
function Eliminar({ cuenta, onCerrar, onEliminada }: { cuenta: UsuarioCuenta | null; onCerrar: () => void; onEliminada: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function confirmar() {
    if (!cuenta) return;
    setError(null);
    setGuardando(true);
    try {
      await usuariosApi.eliminar(cuenta.id);
      onEliminada();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar la cuenta");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal isOpen={!!cuenta} onClose={onCerrar} bloqueado={guardando} className="max-w-md p-6 sm:p-8">
      <h2 className="mb-2 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">Eliminar cuenta</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        ¿Eliminar la cuenta <strong>{cuenta?.correo}</strong>? Nunca se usó: se borra definitivamente.
      </p>
      {error && <ErrorBanner className="mt-4">{error}</ErrorBanner>}
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" disabled={guardando} onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="button" variant="danger" disabled={guardando} onClick={() => void confirmar()}>
          {guardando ? "Eliminando…" : "Eliminar"}
        </Button>
      </div>
    </Modal>
  );
}

function UsuariosContent() {
  const { user, logout } = useAuth();
  const [cuentas, setCuentas] = useState<UsuarioCuenta[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [nueva, setNueva] = useState(false);
  const [cambiandoPassword, setCambiandoPassword] = useState<UsuarioCuenta | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState<UsuarioCuenta | null>(null);
  const [cambiandoCorreo, setCambiandoCorreo] = useState<UsuarioCuenta | null>(null);
  const [eliminando, setEliminando] = useState<UsuarioCuenta | null>(null);
  // Cada ventana empieza vacía: se vuelve a montar con esta clave al abrirla.
  const [vez, setVez] = useState(0);

  // Se incrementa para volver a pedir las cuentas.
  const [version, setVersion] = useState(0);
  const cargar = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let activo = true;
    usuariosApi
      .listar()
      .then((lista) => {
        if (!activo) return;
        setCuentas(lista);
        setError(null);
      })
      .catch((err) => activo && setError(err instanceof ApiError ? err.message : "No se pudieron cargar las cuentas"));
    return () => {
      activo = false;
    };
  }, [version]);

  /**
   * Botones de una cuenta: Cambiar correo (todas, también la propia); en las de
   * vigilancia, además Cambiar contraseña, Dar de baja / Reactivar y Eliminar
   * (solo si nunca se usó). La propia contraseña se cambia desde el nombre, arriba.
   */
  function acciones(c: UsuarioCuenta, className = "") {
    const correo = (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={className}
        onClick={() => {
          setVez((n) => n + 1);
          setCambiandoCorreo(c);
        }}
      >
        Cambiar correo
      </Button>
    );
    if (c.rol !== "vigilancia") return correo;
    return (
      <>
        {correo}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={className}
          disabled={c.estadoCuenta !== "activo"}
          onClick={() => {
            setVez((n) => n + 1);
            setCambiandoPassword(c);
          }}
        >
          Cambiar contraseña
        </Button>
        <Button
          type="button"
          size="sm"
          className={className}
          variant={c.estadoCuenta === "activo" ? "outline-danger" : "outline"}
          onClick={() => setCambiandoEstado(c)}
        >
          {c.estadoCuenta === "activo" ? "Dar de baja" : "Reactivar"}
        </Button>
        {/* Solo una cuenta que nunca se usó: la usada se da de baja, para conservar su historial. */}
        {/* En el celular, un botón con texto; en pantallas anchas, la papelera (como en las tarjetas). */}
        <span title={c.eliminable ? "Eliminar cuenta" : "Ya se usó: désela de baja para conservar su historial"} className="contents">
          <Button
            type="button"
            size="sm"
            variant="outline-danger"
            className={`${className} sm:hidden`}
            disabled={!c.eliminable}
            onClick={() => setEliminando(c)}
          >
            Eliminar
          </Button>
          <button
            type="button"
            aria-label="Eliminar cuenta"
            disabled={!c.eliminable}
            onClick={() => setEliminando(c)}
            className="hidden size-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-error-50 hover:text-error-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-400 sm:flex dark:hover:bg-error-500/10"
          >
            <TrashBinIcon className="size-4" />
          </button>
        </span>
      </>
    );
  }

  const tipo = (c: UsuarioCuenta) => (c.rol === "administrador" ? "Administrador" : "Vigilancia");
  const estado = (c: UsuarioCuenta) => (
    <span className="whitespace-nowrap">
      <Badge color={c.estadoCuenta === "activo" ? "success" : "light"}>{c.estadoCuenta === "activo" ? "Activa" : "De baja"}</Badge>
    </span>
  );

  function listo(texto: string) {
    setAviso(texto);
    setNueva(false);
    setCambiandoPassword(null);
    setCambiandoEstado(null);
    setCambiandoCorreo(null);
    setEliminando(null);
    cargar();
  }

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Cuentas del sistema. Las de vigilancia las crea el administrador, que también les cambia el correo o la contraseña y las da de baja."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setVez((n) => n + 1);
              setNueva(true);
            }}
          >
            + Nueva cuenta de vigilancia
          </Button>
        }
      />

      {aviso && (
        <ErrorBanner tono="exito" className="mb-4">
          {aviso}
        </ErrorBanner>
      )}
      {error && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <ErrorBanner className="flex-1">{error}</ErrorBanner>
          <Button type="button" variant="outline" size="sm" onClick={cargar}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Una tarjeta por cuenta: los datos a la izquierda y los botones a la derecha; si no entran, bajan. */}
      <ul className="space-y-3">
        {!cuentas && !error && <li className="text-sm text-gray-400">Cargando…</li>}
        {cuentas?.map((c) => (
          <li key={c.id}>
            <Tarjeta className="flex flex-col gap-3 p-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="min-w-0 break-all text-sm font-medium text-gray-800 dark:text-white/90">
                    {c.correo}
                    {c.id === user?.id && <span className="ml-2 text-xs font-normal text-gray-400">(usted)</span>}
                  </span>
                  {estado(c)}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {tipo(c)} · creada el {new Date(c.creadoEn).toLocaleDateString("es-PE")}
                </p>
              </div>
              <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
                {acciones(c, "w-full px-2 sm:w-auto sm:px-4")}
              </div>
            </Tarjeta>
          </li>
        ))}
      </ul>

      <NuevaCuenta key={`nueva-${vez}`}
        existentes={cuentas ?? []} abierta={nueva} onCerrar={() => setNueva(false)} onCreada={(u) => listo(`Se creó la cuenta ${u.correo}.`)} />
      <CambiarPassword
        key={`password-${vez}`}
        cuenta={cambiandoPassword}
        onCerrar={() => setCambiandoPassword(null)}
        onCambiada={() => listo(`Se cambió la contraseña de ${cambiandoPassword?.correo}. Debe entrar con la nueva.`)}
      />
      <CambiarCorreo
        key={`correo-${vez}`}
        cuenta={cambiandoCorreo}
        propia={cambiandoCorreo?.id === user?.id}
        existentes={cuentas ?? []}
        onCerrar={() => setCambiandoCorreo(null)}
        onCambiado={(correo) => {
          // La propia: su sesión quedó cerrada; entra de nuevo con el correo nuevo.
          if (cambiandoCorreo?.id === user?.id) return void logout();
          listo(`Se cambió el correo de ${cambiandoCorreo?.correo} a ${correo}.`);
        }}
      />
      <Eliminar cuenta={eliminando} onCerrar={() => setEliminando(null)} onEliminada={() => listo(`Se eliminó la cuenta ${eliminando?.correo}.`)} />
      <CambiarEstado
        cuenta={cambiandoEstado}
        onCerrar={() => setCambiandoEstado(null)}
        onCambiado={() =>
          listo(
            cambiandoEstado?.estadoCuenta === "activo"
              ? `Se dio de baja la cuenta ${cambiandoEstado.correo}.`
              : `Se reactivó la cuenta ${cambiandoEstado?.correo}.`,
          )
        }
      />
    </div>
  );
}

export default function UsuariosPage() {
  return (
    <RequireRole roles={["administrador"]}>
      <UsuariosContent />
    </RequireRole>
  );
}
