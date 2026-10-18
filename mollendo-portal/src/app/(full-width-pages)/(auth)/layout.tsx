import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Image, { getImageProps } from "next/image";
import React from "react";

// Foto del terminal (playa de despacho, de monteazulsur.com.pe) para el panel
// derecho, que solo se ve desde 1024 px (lg). Va en <picture> con esa condición:
// en computadora se pide de inmediato (es lo más grande de la página) y en
// celular el navegador ni la conoce, así que no gasta datos.
const { props: fotoDespacho } = getImageProps({
  src: "/images/login/despacho.webp",
  alt: "",
  width: 1800,
  height: 972,
  sizes: "50vw",
});
/** Imagen vacía (1×1 transparente) para pantallas donde el panel no se ve. */
const SIN_IMAGEN = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pagina-acceso relative px-6 bg-white z-1 dark:bg-gray-900 sm:px-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full min-h-dvh justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="relative lg:w-1/2 w-full lg:min-h-dvh overflow-hidden bg-brand-950 lg:grid items-center hidden">
            {/* La foto, con un velo oscuro encima para que el logo y el texto se lean. */}
            <picture className="absolute inset-0">
              <source media="(min-width: 1024px)" srcSet={fotoDespacho.srcSet} sizes={fotoDespacho.sizes} />
              <img src={SIN_IMAGEN} alt="" decoding="async" fetchPriority="high" className="absolute inset-0 size-full object-cover" />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-brand-950/60 to-brand-950/40" aria-hidden />
            <div className="relative items-center justify-center flex z-1">
              <div className="flex flex-col items-center max-w-xs">
                <div className="mb-4 rounded-2xl bg-white p-5 shadow-theme-lg">
                  <Image
                    width={260}
                    height={128}
                    src="/images/logo/auth-logo-mollendo.png"
                    alt="Monte Azul Sur"
                  />
                </div>
                <p className="text-center font-medium text-white drop-shadow">
                  Control de Acceso · Terminal de Mollendo
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
