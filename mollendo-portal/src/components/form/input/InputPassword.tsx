"use client";

import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import { EyeCloseIcon, EyeIcon } from "@/icons";

/**
 * Campo de contraseña con el ojo para mostrarla u ocultarla. El ojo es un botón
 * real: se alcanza con Tab, se activa con Enter o Espacio y el lector de
 * pantalla lo anuncia. Se usa en el inicio de sesión y al cambiar la contraseña.
 */
export default function InputPassword({
  id,
  placeholder,
  onChange,
}: {
  id?: string;
  placeholder?: string;
  onChange: (valor: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        className="pr-12"
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
      >
        {visible ? (
          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
        ) : (
          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
        )}
      </button>
    </div>
  );
}
