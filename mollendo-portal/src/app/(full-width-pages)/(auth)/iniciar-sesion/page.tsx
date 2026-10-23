import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión · Control de Acceso",
  description: "Portal de control de acceso del Terminal de Mollendo",
};

export default function SignIn() {
  return <SignInForm />;
}
