import React from "react";
import type { EventoAcceso } from "@/lib/api/types";
import Badge from "@/components/ui/badge/Badge";
import { ArrowRightIcon, InfoIcon } from "@/icons";
import { PISTA_TABLA } from "./AvisoNoCompleto";

/** Ingreso (flecha hacia adentro, azul) o salida (hacia afuera, gris), para distinguirlos sin leer. */
export function Movimiento({ tipo }: { tipo: string }) {
  const ingreso = tipo === "ingreso";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={ingreso ? "text-brand-500 dark:text-brand-400" : "rotate-180 text-gray-400"}>
        <ArrowRightIcon className="size-4" />
      </span>
      {ingreso ? "Ingreso" : "Salida"}
    </span>
  );
}

export function MotivoDenegacion({
  evento,
  onVerDocumentos,
  onCorregir,
}: {
  evento: Pick<
    EventoAcceso,
    | "denegadoNoRegistrado"
    | "denegadoPorBaja"
    | "denegadoSinDocumentos"
    | "denegadoPorAlcohol"
    | "denegadoPorDocumentos"
    | "denegadoSinVerificacion"
    | "denegadoRostroNoCoincide"
    | "denegadoYaDentro"
    | "denegadoSinIngreso"
  >;
  onVerDocumentos: () => void;
  /** Antipassback: abre la corrección manual (registrar la salida o el ingreso que faltan). */
  onCorregir?: () => void;
}) {
  if (evento.denegadoNoRegistrado) return <Badge color="error">No registrado</Badge>;
  if (evento.denegadoPorBaja) return <Badge color="error">Dado de baja</Badge>;
  if (evento.denegadoYaDentro || evento.denegadoSinIngreso) {
    const texto = evento.denegadoYaDentro ? "Ya figura dentro" : "No registra ingreso";
    const accion = evento.denegadoYaDentro ? "Registrar salida manual" : "Registrar ingreso manual";
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <Badge color="error">{texto}</Badge>
        {onCorregir && (
          <button type="button" onClick={onCorregir} className="text-xs font-medium text-brand-500 hover:underline">
            {accion} ›
          </button>
        )}
      </span>
    );
  }
  if (evento.denegadoSinVerificacion) {
    // La ⓘ explica qué revisar, para quien lo mira después del aviso de arriba.
    return (
      <span title={PISTA_TABLA} aria-label={`No completó rostro y alcohol. ${PISTA_TABLA}`} className="cursor-help">
        <Badge color="error" endIcon={<InfoIcon className="size-3.5" />}>
          No completó rostro y alcohol
        </Badge>
      </span>
    );
  }
  if (evento.denegadoRostroNoCoincide) return <Badge color="error">Rostro no coincide</Badge>;
  const motivos: string[] = [];
  if (evento.denegadoSinDocumentos) motivos.push("Sin documentos");
  if (evento.denegadoPorAlcohol) motivos.push("Alcohol");
  if (evento.denegadoPorDocumentos) motivos.push("Documentos");
  if (motivos.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {motivos.map((m) =>
        m === "Alcohol" ? (
          <Badge key={m} color="error">{m}</Badge>
        ) : (
          // Documentos: clic para ver qué debe regularizar.
          <button key={m} type="button" onClick={onVerDocumentos} title="Ver documentos" className="underline-offset-2 hover:underline">
            <Badge color="error">{m} ›</Badge>
          </button>
        ),
      )}
    </div>
  );
}

/** Documento con el que se identificó (el leído por el equipo; si falta, el de la persona). */
export function documentoDelEvento(ev: EventoAcceso): string {
  const tipo = ev.tipoDocumentoIdentidad ?? ev.persona?.tipoDocumentoIdentidad;
  const numero = ev.numeroDocumento ?? ev.persona?.numeroDocumento;
  if (!numero) return "—";
  return tipo && tipo !== "DNI" ? `${tipo} ${numero}` : numero;
}

/** Movimiento registrado a mano (antipassback): quién lo registró; el motivo, al pasar el mouse. */
export function MarcaCorreccionManual({
  evento,
}: {
  evento: Pick<EventoAcceso, "correccionManual" | "motivoCorreccion" | "verificadoPor">;
}) {
  if (!evento.correccionManual) return null;
  return (
    <span title={`Registrado a mano, sin pasar por el molinete. Motivo: ${evento.motivoCorreccion ?? "-"}`} className="cursor-help">
      <Badge color="warning">Corrección manual{evento.verificadoPor ? ` · ${evento.verificadoPor.correo}` : ""}</Badge>
    </span>
  );
}

/** Verificación manual (equipo facial fuera de servicio): quién aprobó o denegó el ingreso. */
export function MarcaVerificacionManual({ evento }: { evento: Pick<EventoAcceso, "verificacionManual" | "verificadoPor"> }) {
  if (!evento.verificacionManual) return null;
  return (
    <span title="Rostro y alcohol los verificó un vigilante (equipo facial fuera de servicio)">
      <Badge color="primary">Manual{evento.verificadoPor ? ` · ${evento.verificadoPor.correo}` : ""}</Badge>
    </span>
  );
}
