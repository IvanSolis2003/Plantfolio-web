import { redirect } from "next/navigation";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import FormularioOlvidePassword from "./FormularioOlvidePassword";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Recuperar contraseña — Plantfolio",
};

export default async function OlvidePasswordPage() {
  const usuario = await obtenerUsuarioServidor();
  if (usuario) redirect("/");

  return <FormularioOlvidePassword />;
}
