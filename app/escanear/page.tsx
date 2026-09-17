import { redirect } from "next/navigation";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import FormularioEscanear from "./FormularioEscanear";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Identificar Planta — Plantfolio",
};

export default async function EscanearPage() {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) redirect("/entrar");

  return <FormularioEscanear />;
}
