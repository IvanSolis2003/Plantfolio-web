import { redirect } from "next/navigation";
import Link from "next/link";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import AlertaRiego from "./AlertaRiego";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) redirect("/entrar");

  return (
    <div className="min-h-dvh bg-background px-5 pt-12 pb-6">
      <div className="mb-6">
        <p className="text-base text-muted">Bienvenido,</p>
        <p className="text-2xl font-bold text-primary">{usuario.name} 🌿</p>
      </div>

      <AlertaRiego />

      <Link
        href="/escanear"
        className="mb-4 flex flex-col items-center rounded-2xl bg-primary p-6 text-center"
      >
        <span className="mb-2 text-4xl">🔍</span>
        <span className="text-lg font-bold text-white">Identificar Planta</span>
        <span className="mt-1 text-sm text-accent">
          Usa la IA para identificar cualquier planta
        </span>
      </Link>

      <div className="flex gap-3">
        <Link
          href="/album"
          className="flex flex-1 flex-col items-center rounded-2xl border border-accent bg-surface p-4"
        >
          <span className="mb-1 text-3xl">📗</span>
          <span className="text-sm font-semibold text-primary">Mi Álbum</span>
        </Link>

        <Link
          href="/mapa"
          className="flex flex-1 flex-col items-center rounded-2xl border border-accent bg-surface p-4"
        >
          <span className="mb-1 text-3xl">🗺️</span>
          <span className="text-sm font-semibold text-primary">Mi Mapa</span>
        </Link>
      </div>

      <Link
        href="/galeria"
        className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-accent bg-surface p-3 text-center"
      >
        <span className="text-xl">🌍</span>
        <span className="text-sm font-semibold text-primary">Ver galería pública</span>
      </Link>

      <div className="mt-4 rounded-2xl bg-accent/30 p-4">
        <p className="mb-1 font-bold text-primary">🇨🇱 Flora Chilena</p>
        <p className="text-sm text-text">
          Chile posee una de las floras más diversas del mundo. ¡Ayuda a documentarla!
        </p>
      </div>
    </div>
  );
}
