"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", emoji: "🏠", etiqueta: "Inicio" },
  { href: "/album", emoji: "📗", etiqueta: "Álbum" },
  { href: "/escanear", emoji: "🔍", etiqueta: "Escanear" },
  { href: "/mapa", emoji: "🗺️", etiqueta: "Mapa" },
  { href: "/perfil", emoji: "👤", etiqueta: "Perfil" },
];

const TABS_PUBLICO = [
  { href: "/", emoji: "🏠", etiqueta: "Inicio" },
  { href: "/galeria", emoji: "🌍", etiqueta: "Galería pública" },
  { href: "/catalogo", emoji: "🇨🇱", etiqueta: "Catálogo" },
];

export default function NavEscritorio({ conSesion }: { conSesion: boolean }) {
  const ruta = usePathname();
  const tabs = conSesion ? TABS : TABS_PUBLICO;

  return (
    <nav className="hidden md:flex md:w-56 md:shrink-0 md:flex-col md:gap-1 md:border-r md:border-accent md:bg-surface/70 md:px-3 md:py-6">
      <p className="mb-4 px-3 text-lg font-bold text-primary">🌿 Plantfolio</p>
      {tabs.map((tab) => {
        const activo = tab.href === "/" ? ruta === "/" : ruta.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={activo ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
              activo ? "bg-primary/10 text-primary" : "text-muted"
            }`}
          >
            <span className="text-xl">{tab.emoji}</span>
            {tab.etiqueta}
          </Link>
        );
      })}

      {!conSesion && (
        <div className="mt-auto flex flex-col gap-2 px-3">
          <Link
            href="/registro"
            className="rounded-xl bg-primary py-2.5 text-center text-sm font-bold text-white"
          >
            Crear cuenta gratis
          </Link>
          <Link
            href="/entrar"
            className="rounded-xl border border-accent py-2.5 text-center text-sm font-bold text-primary"
          >
            Entrar
          </Link>
        </div>
      )}
    </nav>
  );
}
