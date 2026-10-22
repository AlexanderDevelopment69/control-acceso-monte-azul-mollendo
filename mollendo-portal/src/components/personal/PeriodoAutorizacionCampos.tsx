"use client";

import React from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
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
}: {
  /** Para los id de los selectores de fecha (únicos en la página). */
  id: string;
  periodo: Periodo;
  onChange: (periodo: Periodo) => void;
  /** Separación del bloque anterior (por defecto, una línea arriba, como "Foto del personal"). */
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Período de autorización</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Opcional. Fuera de estas fechas no podrá ingresar.</p>
      </div>
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
          <Label>Motivo de la autorización</Label>
          <Input
            placeholder="Por ejemplo: visita técnica, obra hasta fin de mes"
            defaultValue={periodo.motivo}
            onChange={(e) => onChange({ ...periodo, motivo: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
