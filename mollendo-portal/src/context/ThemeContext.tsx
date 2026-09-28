"use client";

import type React from "react";
import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// El tema elegido vive en localStorage; se lee como fuente externa para que el
// servidor renderice "light" y el navegador tome el guardado al hidratar.
const CLAVE_TEMA = "theme";
const oyentes = new Set<() => void>();

function leerTema(): Theme {
  try {
    return localStorage.getItem(CLAVE_TEMA) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function suscribirTema(oyente: () => void) {
  oyentes.add(oyente);
  window.addEventListener("storage", oyente);
  return () => {
    oyentes.delete(oyente);
    window.removeEventListener("storage", oyente);
  };
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useSyncExternalStore(suscribirTema, leerTema, () => "light" as Theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    try {
      localStorage.setItem(CLAVE_TEMA, leerTema() === "light" ? "dark" : "light");
    } catch {
      // sin localStorage el tema no se puede cambiar
    }
    oyentes.forEach((oyente) => oyente());
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  }
  return context;
};
