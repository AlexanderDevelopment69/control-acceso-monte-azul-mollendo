"use client";

import React from "react";
import Label from "@/components/form/Label";
import DatePicker from "@/components/form/date-picker";
import type { Periodo } from "@/lib/periodo";

/**
 * Período de autorización (opcional): fecha de ingreso, de finalización y
 * motivo. Mismo estilo que el bloque "Foto del personal" del formulario.
 */
export function PeriodoAutorizacionCampos({
  id,
  periodo,
  onChange,
  className = "mt-5 border-t border-gray-100 pt-4 dark:border-gray-800",
  conTitulo = true,
}: {
  /** Para los id de los selectores de fecha (únicos en la página). */
  id: string;
  periodo: Periodo;
  onChange: (periodo: Periodo) => void;
  /** Separación del bloque anterior (por defecto, una línea arriba, como "Foto del personal"). */
  className?: string;
  /** false = sin el título ni la descripción (cuando ya los pone el recuadro que lo contiene). */
  conTitulo?: boolean;
}) {
  return (
    <div className={className}>
      {conTitulo && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Período de autorización</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Opcional. Fuera de estas fechas no podrá ingresar.</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Fecha de ingreso</Label>
          <DatePicker
            id={`${id}-desde`}
            placeholder="DD-MM-AAAA"
            value={periodo.desde}
            onChange={(desde) => onChange({ ...periodo, desde })}
          />
        </div>
        <div>
          <Label>Fecha de finalización</Label>
          <DatePicker
            id={`${id}-hasta`}
            placeholder="DD-MM-AAAA"
            min={periodo.desde || undefined}
            value={periodo.hasta}
            onChange={(hasta) => onChange({ ...periodo, hasta })}
          />
        </div>
        <div className="sm:col-span-2">
          {/* Como el motivo de la baja: área de texto con contador (la base guarda hasta 300). */}
          <Label htmlFor={`${id}-motivo`}>Motivo de la autorización</Label>
          <textarea
            id={`${id}-motivo`}
            rows={3}
            maxLength={300}
            value={periodo.motivo}
            onChange={(e) => onChange({ ...periodo, motivo: e.target.value })}
            placeholder="Por ejemplo: visita técnica, obra hasta fin de mes"
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
          />
          <p className="mt-1 text-right text-xs text-gray-400">{periodo.motivo.length}/300</p>
        </div>
      </div>
    </div>
  );
}
