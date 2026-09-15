import { redirect } from "next/navigation";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import FormularioEntrar from "./FormularioEntrar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Entrar — Plantfolio",
};

export default async function EntrarPage() {
  const usuario = await obtenerUsuarioServidor();
  if (usuario) redirect("/");

  return <FormularioEntrar />;
}
