import React from "react";
import type { EventoAcceso } from "@/lib/api/types";
import { AlertCircleIcon } from "@/icons";

/** Qué revisar cuando alguien no completa rostro y alcohol (contingencias, sección 3.2). */
export const PISTA_NO_COMPLETO =
  "Si dice que no pudo soplar: revise si el equipo facial muestra un punto rojo (alcoholímetro desconectado) y avise a soporte.";

/** Con el equipo facial desconectado la causa es otra: nadie puede completar (contingencias, sección 4). */
export const PISTA_EQUIPO_DESCONECTADO =
  "El equipo facial está desconectado: nadie puede completar rostro y alcohol. Avise a soporte.";

/** Explicación de la ⓘ de la tabla: sirve para cualquier momento, sin saber el estado del equipo de entonces. */
export const PISTA_TABLA = `Si el equipo facial estaba desconectado, nadie podía completar: avise a soporte. Si estaba conectado y la persona no pudo soplar, revise si muestra un punto rojo (alcoholímetro desconectado) y avise a soporte.`;

/** Ingreso que terminó en "No completó rostro y alcohol" y todavía merece el aviso. */
export interface AvisoNoCompleto {
  eventoId: number;
  persona: string;
  fechaHora: string;
}

/** Evento en vivo del panel (ver EventosAccesoService en el backend): solo los campos que usa el aviso. */
export interface EventoEnVivo {
  eventoId: number;
  tipoMovimiento?: string;
  resultado?: string;
  fechaHora?: string;
  persona?: { id?: number; nombres: string; apellidos: string } | null;
  motivos?: { sinVerificacion?: boolean };
  /** Orden "facial primero": rostro y alcohol antes del DNI (el Panel muestra la foto para comparar). */
  facialPrimero?: boolean;
  /** Facial primero: DNI de quien sopló según el equipo (null: no se pudo confirmar). */
  dniQueSoplo?: string | null;
  tieneFoto?: boolean;
  fotoVersion?: string | null;
}

/**
 * Cómo cambia el aviso con un evento en vivo: aparece si un ingreso no
 * completó rostro y alcohol, y se va cuando alguien ingresa bien. Las salidas
 * y los demás denegados no lo cambian.
 */
export function siguienteAviso(actual: AvisoNoCompleto | null, evento: EventoEnVivo): AvisoNoCompleto | null {
  if (evento.tipoMovimiento !== "ingreso") return actual;
  if (evento.motivos?.sinVerificacion) {
    return {
      eventoId: evento.eventoId,
      persona: evento.persona ? `${evento.persona.nombres} ${evento.persona.apellidos}` : "Una persona",
      fechaHora: evento.fechaHora ?? new Date().toISOString(),
    };
  }
  return evento.resultado === "autorizado" ? null : actual;
}

/**
 * El aviso al abrir el Panel (o al recargarlo): el último ingreso que lo
 * decide, de los más recientes primero, con la misma regla que en vivo.
 */
export function avisoDesdeHistorial(eventos: EventoAcceso[]): AvisoNoCompleto | null {
  const decisivo = eventos.find(
    (ev) => ev.tipoMovimiento === "ingreso" && (ev.denegadoSinVerificacion || ev.resultado === "autorizado"),
  );
  if (!decisivo?.denegadoSinVerificacion) return null;
  return {
    eventoId: decisivo.id,
    persona: decisivo.persona ? `${decisivo.persona.nombres} ${decisivo.persona.apellidos}` : "Una persona",
    fechaHora: decisivo.fechaHora,
  };
}

/**
 * Aviso ámbar arriba del Panel: quién no completó y qué revisar. Se cierra con
 * la ✕. Con el equipo facial desconectado, la causa no es el alcoholímetro.
 */
export function AvisoNoCompletoBanner({
  aviso,
  equipoFacialDesconectado = false,
  onCerrar,
}: {
  aviso: AvisoNoCompleto;
  equipoFacialDesconectado?: boolean;
  onCerrar: () => void;
}) {
  const hora = new Date(aviso.fechaHora).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm dark:border-warning-500/30 dark:bg-warning-500/10"
    >
      <AlertCircleIcon className="mt-0.5 size-5 shrink-0 text-warning-600 dark:text-orange-400" aria-hidden />
      <p className="min-w-0 flex-1 leading-relaxed text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-warning-700 dark:text-orange-400">
          {aviso.persona} no completó rostro y alcohol ({hora}).
        </span>{" "}
        {equipoFacialDesconectado ? PISTA_EQUIPO_DESCONECTADO : PISTA_NO_COMPLETO}
      </p>
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar aviso"
        title="Cerrar aviso"
        className="-mr-1 shrink-0 rounded-md px-1.5 text-lg leading-none text-gray-500 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-gray-400 dark:hover:text-gray-200"
      >
        ✕
      </button>
    </div>
  );
}
