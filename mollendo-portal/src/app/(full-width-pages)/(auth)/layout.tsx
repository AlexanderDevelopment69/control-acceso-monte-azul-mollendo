import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative px-6 bg-white z-1 dark:bg-gray-900 sm:px-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full min-h-dvh justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full lg:min-h-dvh bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <div className="mb-4 rounded-2xl bg-white p-5 shadow-theme-lg">
                  <Image
                    width={260}
                    height={128}
                    src="/images/logo/auth-logo-mollendo.png"
                    alt="Monte Azul Sur"
                  />
                </div>
                <p className="text-center text-gray-400 dark:text-white/60">
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
