import { redirect } from "next/navigation";
import { obtenerUsuarioServidor } from "@/lib/sesion";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) redirect("/entrar");

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-primary text-lg font-bold">Plantfolio 🌿</p>
    </div>
  );
}
