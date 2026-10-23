import React from "react";
import type { EventoAcceso } from "@/lib/api/types";
import Button from "@/components/ui/button/Button";
import { AvisoPanel } from "./AvisoPanel";

/** Qué revisar cuando alguien no completa rostro y alcohol (contingencias, sección 3.2). */
export const PISTA_NO_COMPLETO =
  "Si dice que no pudo soplar: revise si arriba dice Alcoholímetro desconectado y avise a soporte.";

/** Con el equipo facial desconectado la causa es otra: nadie puede completar (contingencias, sección 4). */
export const PISTA_EQUIPO_DESCONECTADO =
  "El equipo facial está desconectado: nadie puede completar rostro y alcohol. Avise a soporte.";

/** Explicación de la ⓘ de la tabla: sirve para cualquier momento, sin saber el estado del equipo de entonces. */
export const PISTA_TABLA = `Si el equipo facial estaba desconectado, nadie podía completar: avise a soporte. Si estaba conectado y la persona no pudo soplar, revise si arriba dice Alcoholímetro desconectado y avise a soporte.`;

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
 * Con `onActivarManual` (sin verificación manual activa) ofrece activarla: es
 * la única señal si el alcoholímetro está conectado pero no mide.
 */
export function AvisoNoCompletoBanner({
  aviso,
  equipoFacialDesconectado = false,
  onCerrar,
  onActivarManual,
}: {
  aviso: AvisoNoCompleto;
  equipoFacialDesconectado?: boolean;
  onCerrar: () => void;
  onActivarManual?: () => void;
}) {
  const hora = new Date(aviso.fechaHora).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  return (
    <AvisoPanel
      tono="warning"
      etiqueta="Ingreso"
      pulso={false}
      pildora={`${aviso.persona} no completó rostro y alcohol (${hora})`}
      acciones={
        <>
          {onActivarManual && (
            <Button type="button" size="sm" onClick={onActivarManual}>
              Activar verificación manual
            </Button>
          )}
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar aviso"
            title="Cerrar aviso"
            className="rounded-md px-1.5 text-lg leading-none text-gray-500 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </>
      }
    >
      {equipoFacialDesconectado ? (
        PISTA_EQUIPO_DESCONECTADO
      ) : (
        // PISTA_NO_COMPLETO, con el nombre del aviso en negrita.
        <>
          Si dice que no pudo soplar: revise si arriba dice <b className="text-gray-800 dark:text-white/90">Alcoholímetro desconectado</b> y
          avise a soporte.
        </>
      )}
    </AvisoPanel>
  );
}
