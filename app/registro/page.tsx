import { redirect } from "next/navigation";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import FormularioRegistro from "./FormularioRegistro";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Crea tu cuenta — Plantfolio",
};

export default async function RegistroPage() {
  const usuario = await obtenerUsuarioServidor();
  if (usuario) redirect("/");

  return <FormularioRegistro />;
}
