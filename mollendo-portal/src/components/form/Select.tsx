"use client";

import React, { useState } from "react";
import Combobox, { type Opcion } from "./Combobox";

type Option = Opcion;

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  /** false = sin texto de ayuda (cuando una opción real ya hace de "todos"). */
  mostrarPlaceholder?: boolean;
}

/**
 * Desplegable no controlado (guarda la opción elegida) con el diseño de
 * Combobox: panel propio con buscador, ✓ y teclado, en vez de la lista nativa.
 */
const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Seleccione una opción",
  onChange,
  className = "",
  defaultValue = "",
  mostrarPlaceholder = true,
}) => {
  const [valor, setValor] = useState(defaultValue);

  return (
    <Combobox
      className={className}
      options={options}
      value={valor}
      placeholder={mostrarPlaceholder ? placeholder : (options[0]?.label ?? placeholder)}
      onChange={(v) => {
        setValor(v);
        onChange(v);
      }}
    />
  );
};

export default Select;
