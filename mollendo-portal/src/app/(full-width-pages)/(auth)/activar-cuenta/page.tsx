import ActivarCuentaForm from "@/components/auth/ActivarCuentaForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Activar cuenta — Control de Acceso Mollendo",
};

export default function ActivarCuentaPage() {
  return (
    <Suspense>
      <ActivarCuentaForm />
    </Suspense>
  );
}
