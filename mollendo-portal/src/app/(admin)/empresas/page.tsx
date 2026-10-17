"use client";

import React, { useCallback, useEffect, useState } from "react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { empresasApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import type { Empresa } from "@/lib/api/types";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Tarjeta from "@/components/ui/tarjeta/Tarjeta";
import Combobox from "@/components/form/Combobox";
import { Modal } from "@/components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { TableSearch } from "@/components/tables/TableSearch";
import { TableFooter } from "@/components/tables/TableFooter";
import { AltoEstable } from "@/components/tables/AltoEstable";
import { EmpresaModal } from "@/components/empresas/EmpresaModal";
import { normalizarBusqueda } from "@/lib/busqueda";

const POR_PAGINA = 10;

type FiltroEstado = "todas" | Empresa["estado"];

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/** Confirmación de activar o desactivar; al desactivar, avisa cuántas personas activas tiene. */
function ConfirmarEstado({
  empresa,
  onClose,
  onCambiada,
}: {
  empresa: Empresa | null;
  onClose: () => void;
  onCambiada: () => void;
}) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const desactivar = empresa?.estado === "activa";
  const activos = empresa?.personalActivo ?? 0;

  async function confirmar() {
    if (!empresa) return;
    setGuardando(true);
    setError(null);
    try {
      await empresasApi.update(empresa.id, { estado: desactivar ? "inactiva" : "activa" });
      onCambiada();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar el estado de la empresa");
    } finally {
      setGuardando(false);
    }
  }

  function cerrar() {
    setError(null);
    onClose();
  }

  return (
    <Modal isOpen={!!empresa} onClose={cerrar} bloqueado={guardando} className="max-w-lg p-6 sm:p-8">
      {empresa && (
        <>
          <h2 className="mb-2 pr-10 text-lg font-semibold text-gray-800 dark:text-white/90">
            {desactivar ? "Desactivar empresa" : "Activar empresa"}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {desactivar ? (
              <>
                ¿Desactivar <strong>{empresa.razonSocial}</strong>? Ya no aparecerá al registrar personal ni en la plantilla de
                carga masiva.
              </>
            ) : (
              <>
                ¿Activar <strong>{empresa.razonSocial}</strong>? Volverá a aparecer al registrar personal y en la plantilla de
                carga masiva.
              </>
            )}
          </p>
          {desactivar && activos > 0 && (
            <ErrorBanner tono="aviso" className="mt-4">
              Esta empresa tiene {plural(activos, "persona activa", "personas activas")}:{" "}
              {activos === 1 ? "seguirá pudiendo" : "seguirán pudiendo"} ingresar si tiene{activos === 1 ? "" : "n"} sus
              documentos al día. Si ya no deben entrar, dalas de baja en Personal y documentos.
            </ErrorBanner>
          )}
          {error && <ErrorBanner className="mt-4">{error}</ErrorBanner>}
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" size="sm" variant="outline" onClick={cerrar} disabled={guardando}>
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              variant={desactivar ? "danger" : "primary"}
              onClick={() => void confirmar()}
              disabled={guardando}
            >
              {guardando ? "Guardando…" : desactivar ? "Desactivar" : "Activar"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

function EmpresasContent() {
  const [empresas, setEmpresas] = useState<Empresa[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<FiltroEstado>("todas");
  const [pagina, setPagina] = useState(1);
  const [nueva, setNueva] = useState(false);
  const [editando, setEditando] = useState<Empresa | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState<Empresa | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setEmpresas(await empresasApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar la lista de empresas");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const q = normalizarBusqueda(busqueda);
  const visibles = (empresas ?? []).filter(
    (e) =>
      (estado === "todas" || e.estado === estado) &&
      (!q || normalizarBusqueda(e.razonSocial).includes(q) || e.ruc.includes(q)),
  );
  const totalPaginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const desde = (paginaActual - 1) * POR_PAGINA;
  const enPagina = visibles.slice(desde, desde + POR_PAGINA);

  function guardada(texto: string) {
    setAviso(texto);
    setNueva(false);
    setEditando(null);
    setCambiandoEstado(null);
    void cargar();
  }

  return (
    <div>
      <PageHeader
        title="Empresas"
        description="Empresas del personal: regístralas, corrige sus datos y actívalas o desactívalas."
        actions={
          <Button size="sm" onClick={() => setNueva(true)}>
            + Nueva empresa
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
          <Button type="button" variant="outline" size="sm" onClick={() => void cargar()}>
            Reintentar
          </Button>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:flex-1">
          <TableSearch
            value={busqueda}
            onChange={(v) => {
              setBusqueda(v);
              setPagina(1);
            }}
            placeholder="Buscar por razón social o RUC…"
          />
        </div>
        <Combobox
          className="sm:w-52"
          value={estado}
          onChange={(v) => {
            setEstado(v as FiltroEstado);
            setPagina(1);
          }}
          aria-label="Estado"
          options={[
            { value: "todas", label: "Todas" },
            { value: "activa", label: "Activas" },
            { value: "inactiva", label: "Inactivas" },
          ]}
        />
      </div>

      <Tarjeta className="overflow-hidden">
        {/* En el celular la tabla se desliza hacia los lados. */}
        <div className="overflow-x-auto [&_th]:whitespace-nowrap">
          <AltoEstable paginaCompleta={enPagina.length === POR_PAGINA} variasPaginas={totalPaginas > 1}>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  {["Empresa", "Contacto", "Personal activo", "Estado", ""].map((c, i) => (
                    <TableCell key={i} isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500">
                      {c}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {cargando && (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>
                      Cargando…
                    </TableCell>
                  </TableRow>
                )}
                {!cargando && empresas && visibles.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-sm text-gray-400" colSpan={5}>
                      {empresas.length ? "Sin resultados para esa búsqueda." : "Todavía no hay empresas. Usa “+ Nueva empresa”."}
                    </TableCell>
                  </TableRow>
                )}
                {!cargando &&
                  enPagina.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="px-5 py-4 text-sm">
                        <span className="block text-gray-800 dark:text-white/90">{e.razonSocial}</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">RUC {e.ruc}</span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm">
                        <span className="block text-gray-600 dark:text-gray-300">{e.correoContacto}</span>
                        {e.telefonoContacto && <span className="block text-xs text-gray-500 dark:text-gray-400">{e.telefonoContacto}</span>}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{e.personalActivo ?? 0}</TableCell>
                      <TableCell className="px-5 py-4 text-sm">
                        <Badge color={e.estado === "activa" ? "success" : "light"}>{e.estado === "activa" ? "Activa" : "Inactiva"}</Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm">
                        <div className="flex justify-end gap-2 whitespace-nowrap">
                          <Button type="button" size="sm" variant="outline" onClick={() => setEditando(e)}>
                            Editar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={e.estado === "activa" ? "outline-danger" : "outline"}
                            onClick={() => setCambiandoEstado(e)}
                          >
                            {e.estado === "activa" ? "Desactivar" : "Activar"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </AltoEstable>
        </div>
        {!cargando && (
          <TableFooter
            from={visibles.length ? desde + 1 : 0}
            to={desde + enPagina.length}
            total={visibles.length}
            page={paginaActual}
            totalPages={totalPaginas}
            onPageChange={setPagina}
          />
        )}
      </Tarjeta>

      <EmpresaModal isOpen={nueva} onClose={() => setNueva(false)} onGuardada={(e) => guardada(`Se registró ${e.razonSocial}.`)} />
      <EmpresaModal
        empresa={editando ?? undefined}
        isOpen={!!editando}
        onClose={() => setEditando(null)}
        onGuardada={(e) => guardada(`Se guardaron los cambios de ${e.razonSocial}.`)}
      />
      <ConfirmarEstado
        empresa={cambiandoEstado}
        onClose={() => setCambiandoEstado(null)}
        onCambiada={() =>
          guardada(`${cambiandoEstado?.razonSocial} quedó ${cambiandoEstado?.estado === "activa" ? "inactiva" : "activa"}.`)
        }
      />
    </div>
  );
}

export default function EmpresasPage() {
  return (
    <RequireRole roles={["administrador"]}>
      <EmpresasContent />
    </RequireRole>
  );
}
