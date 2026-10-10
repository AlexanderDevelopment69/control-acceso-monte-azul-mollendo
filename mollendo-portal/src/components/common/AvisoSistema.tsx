"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { panelApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { problemasDelSistema } from "@/lib/problemasSistema";
import { AlertIcon, CloseLineIcon } from "@/icons";

const CADA_MS = 30_000;
const CLAVE_OCULTO = "aviso-sistema-oculto";

/**
 * Franja arriba de todas las páginas del administrador cuando algo de
 * "Sistema y APIs" está caído, para verlo sin entrar a esa pantalla. Se puede
 * ocultar; vuelve a aparecer si cambia lo que está caído.
 */
export function AvisoSistema() {
  const { user } = useAuth();
  const pathname = usePathname();
  const esAdmin = user?.rol === "administrador";
  const [problemas, setProblemas] = useState<string[]>([]);
  // La franja recién aparece cuando llega el primer estado, así que leer aquí no descuadra la hidratación.
  const [oculto, setOculto] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(CLAVE_OCULTO);
    } catch {
      return null; // Sin almacenamiento (modo privado o en el servidor): no se recuerda el "ocultar".
    }
  });

  useEffect(() => {
    if (!esAdmin) return;
    let activo = true;
    const revisar = () =>
      panelApi
        .estadoSistema()
        .then((estado) => activo && setProblemas(problemasDelSistema(estado)))
        .catch((err) => {
          if (!activo) return;
          // Sin sesión o sin permiso no es una caída; sin respuesta del backend, sí.
          if (err instanceof ApiError && err.status < 500) return;
          setProblemas(["No se puede contactar con el backend"]);
        });
    revisar();
    const id = setInterval(revisar, CADA_MS);
    return () => {
      activo = false;
      clearInterval(id);
    };
  }, [esAdmin]);

  const firma = problemas.join(" · ");
  if (!esAdmin || problemas.length === 0 || oculto === firma) return null;

  const ocultar = () => {
    setOculto(firma);
    try {
      sessionStorage.setItem(CLAVE_OCULTO, firma);
    } catch {
      // Ver arriba.
    }
  };

  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-3 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400 md:mb-6"
    >
      <AlertIcon className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{problemas.length === 1 ? "Hay un problema en el sistema" : `Hay ${problemas.length} problemas en el sistema`}</p>
        <p className="mt-0.5">{firma}</p>
        {pathname !== "/sistema" && (
          <Link href="/sistema" className="mt-1 inline-block font-medium underline underline-offset-2">
            Ver Sistema y APIs
          </Link>
        )}
      </div>
      <button type="button" onClick={ocultar} title="Ocultar" aria-label="Ocultar aviso" className="shrink-0 rounded p-1 hover:bg-error-100 dark:hover:bg-error-500/20">
        <CloseLineIcon className="size-4" />
      </button>
    </div>
  );
}
