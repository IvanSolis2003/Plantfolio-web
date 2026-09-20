"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ApiResponse, CollectionEntry } from "@/types";

export default function PlantasPorRegar({ entradas }: { entradas: CollectionEntry[] }) {
  const [regando, setRegando] = useState<string | null>(null);
  const [regadas, setRegadas] = useState<string[]>([]);
  const router = useRouter();

  const pendientes = entradas.filter((entrada) => !regadas.includes(entrada.id));
  if (pendientes.length === 0) return null;

  async function handleRegar(id: string) {
    setRegando(id);
    try {
      const respuesta = await fetch(`/api/album/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regada: true }),
      });
      const data: ApiResponse<CollectionEntry> = await respuesta.json();
      if (data.success) {
        setRegadas((prev) => [...prev, id]);
        router.refresh();
      }
    } finally {
      setRegando(null);
    }
  }

  return (
    <div className="mb-4 rounded-2xl border border-accent bg-surface p-4">
      <p className="mb-2 text-sm font-bold text-primary">💧 Plantas por regar</p>
      <div className="flex flex-col gap-2">
        {pendientes.map((entrada) => (
          <div key={entrada.id} className="flex items-center justify-between gap-2">
            <Link href={`/album/${entrada.id}`} className="truncate text-sm text-text">
              {entrada.plant.commonName}
            </Link>
            <button
              onClick={() => handleRegar(entrada.id)}
              disabled={regando === entrada.id}
              className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {regando === entrada.id ? "..." : "Regué"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
