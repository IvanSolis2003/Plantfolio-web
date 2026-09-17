"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiResponse } from "@/types";

export default function BotonAprobar({ id }: { id: string }) {
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  async function handleAprobar() {
    setCargando(true);
    try {
      const respuesta = await fetch("/api/admin/aprobar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data: ApiResponse<{ aviso: string }> = await respuesta.json();
      if (data.success) router.refresh();
    } finally {
      setCargando(false);
    }
  }

  return (
    <button
      onClick={handleAprobar}
      disabled={cargando}
      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
    >
      {cargando ? "Aprobando..." : "Aprobar"}
    </button>
  );
}
