"use client";

import React, { useEffect, useState } from "react";
import { AlertIcon } from "@/icons";

export function ErrorBanner({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  // Aparece con una transición de alto en vez de saltar de golpe: dentro de un
  // modal centrado con flexbox, un cambio de alto instantáneo recoloca todo el
  // modal de un salto y se percibe como un parpadeo.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${visible ? "max-h-40 opacity-100" : "max-h-0 opacity-0"} ${className}`}
    >
      <div className="flex items-start gap-2 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">
        <AlertIcon className="mt-0.5 size-4 shrink-0" />
        <span>{children}</span>
      </div>
    </div>
  );
}
