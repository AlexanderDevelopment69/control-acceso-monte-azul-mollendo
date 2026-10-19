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
    | "denegadoSinFacial"
    | "denegadoSinDni"
    | "denegadoNoEsQuienSoplo"
    | "dniQueSoplo"
  >;
  onVerDocumentos: () => void;
}) {
  if (evento.denegadoNoRegistrado) return <Badge color="error">No registrado</Badge>;
  if (evento.denegadoPorBaja) return <Badge color="error">Dado de baja</Badge>;
  if (evento.denegadoYaDentro) return <Badge color="error">Ya figura dentro</Badge>;
  if (evento.denegadoSinIngreso) return <Badge color="error">No registra ingreso</Badge>;
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
  // Orden "facial primero" (en prueba).
  if (evento.denegadoSinFacial) {
    return (
      <span title="Facial primero: pasó su DNI sin haber hecho antes rostro y alcohol en el equipo facial" className="cursor-help">
        <Badge color="error">DNI antes del facial</Badge>
      </span>
    );
  }
  if (evento.denegadoNoEsQuienSoplo) {
    return (
      <span
        title={`El equipo facial indica que sopló otra persona${evento.dniQueSoplo ? ` (DNI ${evento.dniQueSoplo})` : ""}, no la del DNI que se pasó.`}
        className="cursor-help"
      >
        <Badge color="error">No es quien sopló</Badge>
      </span>
    );
  }
  if (evento.denegadoSinDni) {
    return (
      <span title="Aprobó rostro y alcohol, pero no pasó su DNI en los 15 segundos que mostró el Panel. Debe empezar otra vez por el equipo facial." className="cursor-help">
        <Badge color="error">No pasó su DNI a tiempo</Badge>
      </span>
    );
  }
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

/** Orden "facial primero": rostro y alcohol antes del DNI; confirmado si el equipo dijo quién sopló. */
export function MarcaFacialPrimero({ evento }: { evento: Pick<EventoAcceso, "facialPrimero" | "resultado" | "dniQueSoplo"> }) {
  if (!evento.facialPrimero || evento.resultado !== "autorizado") return null;
  if (evento.dniQueSoplo) {
    return (
      <span title="Rostro y alcohol en el equipo facial antes del DNI. El equipo confirmó que sopló la persona del DNI." className="cursor-help">
        <Badge color="success">Facial primero</Badge>
      </span>
    );
  }
  return (
    <span title="Rostro y alcohol en el equipo facial antes del DNI. No se pudo confirmar que quien sopló sea la persona del DNI." className="cursor-help">
      <Badge color="warning">Facial primero · sin confirmar</Badge>
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
