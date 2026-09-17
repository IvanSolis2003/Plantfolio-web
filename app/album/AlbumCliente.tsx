"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import RarityBadge from "@/components/RarityBadge";
import type { ApiResponse, CollectionEntry, Rarity } from "@/types";

const RAREZAS: Rarity[] = ["COMUN", "POCO_COMUN", "ENDEMICA", "PROTEGIDA", "CASI_EXTINTA"];

export default function AlbumCliente({ entradas: entradasIniciales }: { entradas: CollectionEntry[] }) {
  const [entradas, setEntradas] = useState(entradasIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [rarezaFiltro, setRarezaFiltro] = useState<Rarity | "TODAS">("TODAS");
  const [eliminando, setEliminando] = useState<string | null>(null);
  const router = useRouter();

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return entradas.filter((entrada) => {
      const coincideTexto =
        !texto ||
        entrada.plant.commonName.toLowerCase().includes(texto) ||
        entrada.plant.scientificName.toLowerCase().includes(texto);
      const coincideRareza = rarezaFiltro === "TODAS" || entrada.plant.rarity === rarezaFiltro;
      return coincideTexto && coincideRareza;
    });
  }, [entradas, busqueda, rarezaFiltro]);

  async function handleEliminar(id: string) {
    if (!window.confirm("¿Eliminar esta planta de tu álbum?")) return;

    setEliminando(id);
    try {
      const respuesta = await fetch(`/api/album/${id}`, { method: "DELETE" });
      const data: ApiResponse<null> = await respuesta.json();
      if (!data.success) throw new Error(data.error ?? "Error al eliminar entrada");
      router.refresh();
    } catch {
      setEliminando(null);
    }
  }

  async function handleTogglePrivado(entrada: CollectionEntry) {
    const nuevoValor = !entrada.privado;
    setEntradas((prev) => prev.map((e) => (e.id === entrada.id ? { ...e, privado: nuevoValor } : e)));

    const respuesta = await fetch(`/api/album/${entrada.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ privado: nuevoValor }),
    });
    const data: ApiResponse<CollectionEntry> = await respuesta.json();
    if (!data.success) {
      setEntradas((prev) => prev.map((e) => (e.id === entrada.id ? { ...e, privado: entrada.privado } : e)));
    }
  }

  if (entradas.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
        <span className="mb-3 text-4xl">📗</span>
        <p className="text-xl font-bold text-primary">Mi Álbum</p>
        <p className="mt-2 text-sm text-muted">
          Todavía no identificaste ninguna planta. Andá a Escanear para empezar tu colección.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background px-5 pt-12 pb-6">
      <p className="mb-4 text-xl font-bold text-primary">Mi Álbum</p>

      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-3 w-full rounded-xl border border-accent bg-surface px-4 py-2.5 text-sm text-text"
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setRarezaFiltro("TODAS")}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            rarezaFiltro === "TODAS" ? "bg-primary text-white" : "bg-surface text-muted border border-accent"
          }`}
        >
          Todas
        </button>
        {RAREZAS.map((rareza) => (
          <button
            key={rareza}
            onClick={() => setRarezaFiltro(rareza)}
            className={rarezaFiltro === rareza ? "shrink-0" : "shrink-0 opacity-60"}
          >
            <RarityBadge rarity={rareza} />
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">Ninguna planta coincide con el filtro.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtradas.map((entrada) => (
            <div key={entrada.id} className="rounded-2xl border border-accent bg-surface p-2">
              <Image
                src={entrada.photoUrl}
                alt={entrada.plant.commonName}
                width={200}
                height={160}
                className="mb-2 h-28 w-full rounded-xl object-cover"
              />
              <p className="truncate text-sm font-bold text-primary">{entrada.plant.commonName}</p>
              <p className="truncate text-xs italic text-muted">{entrada.plant.scientificName}</p>
              <div className="my-1.5 flex items-center justify-between">
                <RarityBadge rarity={entrada.plant.rarity} />
                <button
                  onClick={() => handleTogglePrivado(entrada)}
                  title={entrada.privado ? "Privada — click para hacerla pública" : "Pública — click para ocultarla"}
                  className={`text-sm ${entrada.privado ? "opacity-100" : "opacity-30"}`}
                >
                  🔒
                </button>
              </div>
              <button
                onClick={() => handleEliminar(entrada.id)}
                disabled={eliminando === entrada.id}
                className="w-full rounded-lg border border-danger/30 bg-danger/10 py-1.5 text-xs font-semibold text-danger disabled:opacity-60"
              >
                {eliminando === entrada.id ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
