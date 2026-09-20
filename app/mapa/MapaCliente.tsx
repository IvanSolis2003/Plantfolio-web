"use client";

import dynamic from "next/dynamic";
import type { CollectionEntry } from "@/types";

const MapaLeaflet = dynamic(() => import("./MapaLeaflet"), { ssr: false });

export default function MapaCliente({ entradas }: { entradas: CollectionEntry[] }) {
  if (entradas.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <span className="mb-3 text-4xl">🗺️</span>
        <p className="text-xl font-bold text-primary">Mapa de Hallazgos</p>
        <p className="mt-2 text-sm text-muted">
          Todavía no guardaste ninguna planta con ubicación. Al identificar una desde
          Escanear, aceptá el permiso de ubicación para que aparezca acá.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <p className="px-5 pt-6 pb-3 text-xl font-bold text-primary">Mapa de Hallazgos</p>
      <div className="flex-1">
        <MapaLeaflet entradas={entradas} />
      </div>
    </div>
  );
}
