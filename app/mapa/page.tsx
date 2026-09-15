import { redirect } from "next/navigation";
import { obtenerUsuarioServidor } from "@/lib/sesion";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mapa de Hallazgos — Plantfolio",
};

export default async function MapaPage() {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) redirect("/entrar");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background">
      <span className="mb-3 text-4xl">🗺️</span>
      <p className="text-xl font-bold text-primary">Mapa de Hallazgos</p>
      <p className="mt-2 text-sm text-muted">Próximamente en Sprint 4</p>
    </div>
  );
}
