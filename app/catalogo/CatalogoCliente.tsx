"use client";

import { useEffect, useMemo, useState } from "react";
import RarityBadge from "@/components/RarityBadge";
import type { ApiResponse, Plant } from "@/types";

export default function CatalogoCliente() {
  const [plantas, setPlantas] = useState<Plant[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("/api/plants")
      .then((r) => r.json())
      .then((data: ApiResponse<Plant[]>) => {
        if (data.success && data.data) setPlantas(data.data);
      })
      .finally(() => setCargando(false));
  }, []);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return plantas;
    return plantas.filter(
      (planta) =>
        planta.commonName.toLowerCase().includes(texto) ||
        planta.scientificName.toLowerCase().includes(texto)
    );
  }, [plantas, busqueda]);

  return (
    <>
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-4 w-full rounded-xl border border-accent bg-surface px-4 py-2.5 text-sm text-text"
      />

      {cargando ? (
        <p className="mt-8 text-center text-sm text-muted">Cargando catálogo...</p>
      ) : filtradas.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">Ninguna especie coincide con la búsqueda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtradas.map((planta) => (
            <div key={planta.id} className="rounded-2xl border border-accent bg-surface p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="font-bold text-primary">{planta.commonName}</p>
                <RarityBadge rarity={planta.rarity} />
              </div>
              <p className="mb-2 text-sm italic text-muted">{planta.scientificName}</p>

              <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text">
                {planta.family && (
                  <span>
                    <span className="font-semibold">Familia:</span> {planta.family}
                  </span>
                )}
                {planta.nativeToChile && (
                  <span className="font-semibold text-primary">🇨🇱 Nativa de Chile</span>
                )}
                <span>
                  <span className="font-semibold">💧 Riego:</span> cada {planta.wateringFrequencyDays} días
                </span>
              </div>

              {planta.description && (
                <p className="mb-2 text-sm text-text">{planta.description}</p>
              )}
              {planta.careInstructions && (
                <p className="text-xs text-muted">
                  <span className="font-semibold text-text">Cuidados:</span> {planta.careInstructions}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
