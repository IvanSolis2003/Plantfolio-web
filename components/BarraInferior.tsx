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

export default function BarraInferior() {
  const ruta = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-[60px] items-center justify-around border-t border-accent bg-surface pb-2">
      {TABS.map((tab) => {
        const activo = tab.href === "/" ? ruta === "/" : ruta.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-0.5"
            aria-current={activo ? "page" : undefined}
          >
            <span className={activo ? "text-[26px] opacity-100" : "text-[22px] opacity-50"}>
              {tab.emoji}
            </span>
            <span
              className={`text-[11px] font-semibold ${activo ? "text-primary" : "text-muted"}`}
            >
              {tab.etiqueta}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
