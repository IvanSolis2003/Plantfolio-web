import { redirect } from "next/navigation";
import { obtenerUsuarioServidor } from "@/lib/sesion";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Identificar Planta — Plantfolio",
};

export default async function EscanearPage() {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) redirect("/entrar");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background">
      <span className="mb-3 text-4xl">🔍</span>
      <p className="text-xl font-bold text-primary">Identificar Planta</p>
      <p className="mt-2 text-sm text-muted">Próximamente en Sprint 2</p>
    </div>
  );
}
