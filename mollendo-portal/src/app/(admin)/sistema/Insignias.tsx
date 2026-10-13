import React from "react";
import Badge from "@/components/ui/badge/Badge";

/** Etiqueta verde de algo en línea o conectado, con un punto que late: está vivo. */
export function Activo({ children }: { children: React.ReactNode }) {
  return (
    <Badge color="success">
      <span className="relative mr-0.5 flex size-2 shrink-0" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-success-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-success-500" />
      </span>
      {children}
    </Badge>
  );
}

/** Etiqueta roja de algo caído, con un punto que late (como el aviso de fallas). */
export function Falla({ children }: { children: React.ReactNode }) {
  return (
    <Badge color="error">
      <span className="relative mr-0.5 flex size-2 shrink-0" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-error-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-error-500" />
      </span>
      {children}
    </Badge>
  );
}

/** Mientras llega la primera respuesta del backend no se sabe el estado. */
export function ComprobandoBadge() {
  return <Badge color="light">Comprobando…</Badge>;
}

export function EstadoBadge({ ok }: { ok: boolean }) {
  return ok ? <Activo>En línea</Activo> : <Falla>Sin conexión</Falla>;
}

export function ConfiguradoBadge({ ok }: { ok: boolean }) {
  return <Badge color={ok ? "success" : "warning"}>{ok ? "Configurado" : "No configurado"}</Badge>;
}
