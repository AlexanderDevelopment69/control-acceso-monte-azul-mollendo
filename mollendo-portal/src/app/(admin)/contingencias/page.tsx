import { redirect } from "next/navigation";

/** "Contingencias" agrupa sus opciones en el menú; la dirección sola lleva a la primera. */
export default function ContingenciasPage() {
  redirect("/contingencias/tarjetas");
}
