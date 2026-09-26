"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { usuariosApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { RolUsuario, Usuario } from "@/lib/api/types";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { SectionHeader } from "@/components/common/PageHeader";

const ROL_LABEL: Record<RolUsuario, string> = {
  administrador: "Administrador",
  vigilancia: "Vigilancia",
};

function RestablecerPasswordModal({
  usuario,
  onClose,
}: {
  usuario: Usuario | null;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPassword("");
    setError(null);
    setLoading(false);
  }, [usuario]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    setLoading(true);
    try {
      await usuariosApi.update(usuario.id, { password });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={!!usuario} onClose={onClose} className="max-w-md p-6">
      <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Restablecer contraseña</h2>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">{usuario?.correo}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <div>
          <Label>Nueva contraseña (mínimo 8 caracteres)</Label>
          <Input type="password" defaultValue={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button className="w-full" disabled={loading}>
          {loading ? "Guardando…" : "Guardar contraseña"}
        </Button>
      </form>
    </Modal>
  );
}

export function UsuariosTab() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState<RolUsuario>("vigilancia");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [usuarioPassword, setUsuarioPassword] = useState<Usuario | null>(null);

  async function cargar() {
    setLoading(true);
    try {
      setUsuarios(await usuariosApi.list());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreando(true);
    setError(null);
    try {
      await usuariosApi.create({ correo, rol, password });
      setCorreo("");
      setPassword("");
      setRol("vigilancia");
      setFormKey((k) => k + 1);
      cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el usuario");
    } finally {
      setCreando(false);
    }
  }

  async function cambiarEstado(usuario: Usuario) {
    setError(null);
    try {
      await usuariosApi.update(usuario.id, { estadoCuenta: usuario.estadoCuenta === "activo" ? "baja" : "activo" });
      cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar el estado");
    }
  }

  return (
    <div>
      <SectionHeader
        title="Usuarios"
        description="Cuentas con acceso al sistema. No hay invitación ni recuperación por correo: el administrador crea las cuentas y restablece las contraseñas."
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Nuevo usuario</h2>
        <form key={formKey} onSubmit={handleSubmit} className="flex flex-col flex-wrap gap-4 sm:flex-row sm:items-end">
          {error && <ErrorBanner className="w-full">{error}</ErrorBanner>}
          <div className="flex-1">
            <Label>Correo</Label>
            <Input type="email" defaultValue={correo} onChange={(e) => setCorreo(e.target.value)} />
          </div>
          <div className="flex-1">
            <Label>Rol</Label>
            <Select
              defaultValue={rol}
              onChange={(v) => setRol(v as RolUsuario)}
              options={[
                { value: "vigilancia", label: "Vigilancia" },
                { value: "administrador", label: "Administrador" },
              ]}
            />
          </div>
          <div className="flex-1">
            <Label>Contraseña inicial</Label>
            <Input type="password" defaultValue={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button disabled={creando} className="min-w-[152px] shrink-0">
            {creando ? "Creando…" : "Crear usuario"}
          </Button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Correo</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Rol</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Estado</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">Acciones</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && (
                <TableRow>
                  <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={4}>Cargando…</TableCell>
                </TableRow>
              )}
              {usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {u.correo}
                    {u.id === user?.id && <span className="ml-2 text-xs text-gray-400">(tú)</span>}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{ROL_LABEL[u.rol]}</TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <Badge color={u.estadoCuenta === "activo" ? "success" : "light"}>{u.estadoCuenta}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setUsuarioPassword(u)}>
                        Restablecer contraseña
                      </Button>
                      {u.id !== user?.id && (
                        <Button size="sm" variant="outline" onClick={() => cambiarEstado(u)}>
                          {u.estadoCuenta === "activo" ? "Dar de baja" : "Reactivar"}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <RestablecerPasswordModal usuario={usuarioPassword} onClose={() => setUsuarioPassword(null)} />
    </div>
  );
}
