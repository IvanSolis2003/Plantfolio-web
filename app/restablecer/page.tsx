import { redirect } from "next/navigation";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import FormularioRestablecer from "./FormularioRestablecer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Elegir nueva contraseña — Plantfolio",
};

export default async function RestablecerPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const usuario = await obtenerUsuarioServidor();
  if (usuario) redirect("/");

  const { token } = await searchParams;

  return <FormularioRestablecer token={token ?? ""} />;
}
