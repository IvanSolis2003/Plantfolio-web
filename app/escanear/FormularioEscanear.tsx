"use client";

import { useState } from "react";
import Image from "next/image";
import type { ApiResponse, IdentifyResult } from "@/types";

const ETIQUETA_RAREZA: Record<string, string> = {
  COMUN: "Común",
  POCO_COMUN: "Poco común",
  ENDEMICA: "Endémica",
  PROTEGIDA: "Protegida",
  CASI_EXTINTA: "Casi extinta",
};

function archivoABase64(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

export default function FormularioEscanear() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<IdentifyResult | null>(null);

  async function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setError(null);
    setResultado(null);
    setCargando(true);

    try {
      const base64 = await archivoABase64(archivo);
      const respuesta = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const data: ApiResponse<IdentifyResult> = await respuesta.json();
      if (!data.success || !data.data) throw new Error(data.error ?? "Error al identificar planta");

      setResultado(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al identificar planta");
    } finally {
      setCargando(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center bg-background px-6 pt-12 pb-6">
      <span className="mb-3 text-4xl">🔍</span>
      <p className="mb-6 text-xl font-bold text-primary">Identificar Planta</p>

      <label className="mb-4 flex w-full max-w-sm cursor-pointer flex-col items-center rounded-2xl border border-accent bg-surface p-6 text-center">
        <span className="mb-2 text-3xl">📷</span>
        <span className="font-semibold text-primary">
          {cargando ? "Identificando..." : "Tomar o subir foto"}
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          disabled={cargando}
          onChange={handleArchivo}
        />
      </label>

      {error && <p className="text-sm font-medium text-danger">{error}</p>}

      {resultado && (
        <div className="w-full max-w-sm rounded-2xl border border-accent bg-surface p-4">
          <Image
            src={resultado.photoUrl}
            alt={resultado.commonName}
            width={400}
            height={300}
            className="mb-3 h-48 w-full rounded-xl object-cover"
          />
          <p className="text-lg font-bold text-primary">{resultado.commonName}</p>
          <p className="mb-2 text-sm italic text-muted">{resultado.scientificName}</p>
          <p className="text-sm text-text">
            Familia: {resultado.family ?? "Desconocida"}
          </p>
          <p className="text-sm text-text">
            Rareza: {ETIQUETA_RAREZA[resultado.rarity]}
          </p>
          <p className="mb-4 text-sm text-text">
            Confianza: {Math.round(resultado.confidence * 100)}%
          </p>
          <button
            disabled
            className="w-full rounded-xl bg-accent/40 py-3 text-center font-semibold text-muted"
          >
            Agregar al álbum — Próximamente
          </button>
        </div>
      )}
    </div>
  );
}
