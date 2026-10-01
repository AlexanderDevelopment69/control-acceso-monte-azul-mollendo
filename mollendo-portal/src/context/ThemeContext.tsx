"use client";

import type React from "react";
import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  /** Cambia el tema. Con el punto del clic, el tema nuevo se abre en círculo desde ahí. */
  toggleTheme: (origen?: { clientX: number; clientY: number }) => void;
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
    const raiz = document.documentElement;
    if (raiz.classList.contains("dark") === (theme === "dark")) return;
    // Sin transiciones mientras cambia el tema: si no, cada botón y tarjeta con
    // transición de color (pensada para el paso del mouse) anima su cambio por
    // su cuenta y parece que la pantalla cambia de a poco. Se reactivan al
    // siguiente cuadro, ya con los colores nuevos aplicados.
    raiz.classList.add("cambiando-tema");
    raiz.classList.toggle("dark", theme === "dark");
    void raiz.offsetHeight; // aplica los colores nuevos antes de reactivar las transiciones
    const cuadro = requestAnimationFrame(() => raiz.classList.remove("cambiando-tema"));
    return () => {
      cancelAnimationFrame(cuadro);
      raiz.classList.remove("cambiando-tema");
    };
  }, [theme]);

  const toggleTheme = useCallback((origen?: { clientX: number; clientY: number }) => {
    const nuevo: Theme = leerTema() === "light" ? "dark" : "light";
    const aplicar = () => {
      try {
        localStorage.setItem(CLAVE_TEMA, nuevo);
      } catch {
        // sin localStorage el tema no se puede cambiar
      }
      // La clase se cambia aquí mismo (y no solo en el efecto) para que la
      // transición de vista capture la pantalla ya con el tema nuevo.
      document.documentElement.classList.toggle("dark", nuevo === "dark");
      oyentes.forEach((oyente) => oyente());
    };

    // Transición de vista (Chrome, Edge, Safari 18+): el navegador fotografía la
    // pantalla antes y después, y el tema nuevo se abre en un círculo que crece
    // desde el botón. Sin soporte, o si el sistema pide reducir el movimiento,
    // el cambio es inmediato (y sin transiciones sueltas, ver el efecto).
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reducir) {
      aplicar();
      return;
    }
    const x = origen?.clientX ?? window.innerWidth - 40;
    const y = origen?.clientY ?? 40;
    const radio = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const raiz = document.documentElement;
    raiz.classList.add("cambiando-tema");
    const transicion = document.startViewTransition(aplicar);
    transicion.ready
      .then(() =>
        raiz.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radio}px at ${x}px ${y}px)`] },
          { duration: 550, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
        ),
      )
      .catch(() => {});
    transicion.finished.finally(() => raiz.classList.remove("cambiando-tema"));
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
