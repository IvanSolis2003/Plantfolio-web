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

export default function NavEscritorio() {
  const ruta = usePathname();

  return (
    <nav className="hidden md:flex md:w-56 md:shrink-0 md:flex-col md:gap-1 md:border-r md:border-accent md:bg-surface/70 md:px-3 md:py-6">
      <p className="mb-4 px-3 text-lg font-bold text-primary">🌿 Plantfolio</p>
      {TABS.map((tab) => {
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
    </nav>
  );
}
