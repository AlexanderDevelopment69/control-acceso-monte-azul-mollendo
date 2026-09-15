import RecuperarPasswordForm from "@/components/auth/RecuperarPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar contraseña — Control de Acceso Mollendo",
};

export default function RecuperarPasswordPage() {
  return <RecuperarPasswordForm />;
}
