"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiResponse } from "@/types";

export default function ToggleColeccionPrivada({ valorInicial }: { valorInicial: boolean }) {
  const [privada, setPrivada] = useState(valorInicial);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    const nuevoValor = !privada;
    setCargando(true);

    try {
      const respuesta = await fetch("/api/perfil/privacidad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coleccionPrivada: nuevoValor }),
      });
      const data: ApiResponse<{ coleccionPrivada: boolean }> = await respuesta.json();
      if (data.success) {
        setPrivada(nuevoValor);
        router.refresh();
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={cargando}
      className="mb-4 flex items-center justify-between rounded-xl border border-accent bg-surface p-3 text-left disabled:opacity-60"
    >
      <div>
        <p className="text-sm font-bold text-text">Colección privada</p>
        <p className="text-xs text-muted">
          {privada
            ? "Nadie sin cuenta puede ver tu álbum en la galería pública."
            : "Tu álbum aparece en la galería pública (salvo plantas marcadas privadas)."}
        </p>
      </div>
      <span className={`text-2xl ${privada ? "opacity-100" : "opacity-30"}`}>🔒</span>
    </button>
  );
}
