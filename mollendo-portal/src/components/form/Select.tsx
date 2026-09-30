import React, { useState } from "react";
import { ChevronDownIcon } from "@/icons";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  /** false = sin la opción de ayuda deshabilitada (cuando una opción real ya hace de "todos"). */
  mostrarPlaceholder?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Selecciona una opción",
  onChange,
  className = "",
  defaultValue = "",
  mostrarPlaceholder = true,
}) => {
  // Manage the selected value
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  // La lista nativa no avisa cuándo se abre o se cierra: se estima con el clic,
  // la elección, el teclado y la pérdida de foco, para girar la flecha.
  const [abierto, setAbierto] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    setAbierto(false);
    onChange(value); // Trigger parent handler
  };

  // Texto gris solo mientras se ve el placeholder; una opción real vacía ("Todos…") va en color normal.
  const muestraPlaceholder = mostrarPlaceholder && !selectedValue;

  return (
    <div className={`relative ${className}`}>
      <select
        className={`h-11 w-full appearance-none truncate rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
          muestraPlaceholder
            ? "text-gray-400 dark:text-gray-400"
            : "text-gray-800 dark:text-white/90"
        }`}
        value={selectedValue}
        onChange={handleChange}
        onMouseDown={() => setAbierto((a) => !a)}
        onBlur={() => setAbierto(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter" || e.key === "Tab") setAbierto(false);
          else if (e.key === " " || (e.altKey && e.key === "ArrowDown")) setAbierto(true);
        }}
      >
        {/* Placeholder option */}
        {mostrarPlaceholder && (
          <option
            value=""
            disabled
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {placeholder}
          </option>
        )}
        {/* Map over options */}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        aria-hidden
        className={`pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${
          abierto ? "rotate-180" : ""
        }`}
      />
    </div>
  );
};

export default Select;
