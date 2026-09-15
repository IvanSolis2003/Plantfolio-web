import { redirect } from "next/navigation";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import BotonSalir from "./BotonSalir";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mi perfil — Plantfolio",
};

const ESTADISTICAS = [
  { label: "Plantas", value: "0" },
  { label: "Especies", value: "0" },
  { label: "Raras", value: "0" },
];

export default async function PerfilPage() {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) redirect("/entrar");

  return (
    <div className="flex min-h-dvh flex-col bg-background px-6">
      <div className="mb-8 mt-16 flex flex-col items-center">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-accent">
          <span className="text-4xl">👤</span>
        </div>
        <p className="text-2xl font-bold text-primary">{usuario.name}</p>
        <p className="text-sm text-muted">{usuario.email}</p>
      </div>

      <div className="mb-6 flex gap-3">
        {ESTADISTICAS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-1 flex-col items-center rounded-xl border border-accent bg-surface p-3"
          >
            <p className="text-xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <BotonSalir />
    </div>
  );
}
