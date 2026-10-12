import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cada prueba empieza con la pantalla y la sesión vacías.
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

// jsdom no trae IntersectionObserver (la lista de Personal lo usa para cargar por tandas).
class IntersectionObserverFalso {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
vi.stubGlobal("IntersectionObserver", IntersectionObserverFalso);

// Ni scrollIntoView (los desplegables llevan la opción elegida a la vista).
Element.prototype.scrollIntoView = () => {};
