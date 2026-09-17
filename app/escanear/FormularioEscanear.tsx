"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import RarityBadge from "@/components/RarityBadge";
import type { ApiResponse, CollectionEntry, IdentifyResult } from "@/types";

function archivoABase64(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

function obtenerUbicacion(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicion) => resolve(posicion),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}

export default function FormularioEscanear() {
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<IdentifyResult | null>(null);
  const router = useRouter();

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
      setGuardado(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al identificar planta");
    } finally {
      setCargando(false);
      e.target.value = "";
    }
  }

  async function handleAgregarAlbum() {
    if (!resultado) return;

    setGuardando(true);
    setError(null);

    try {
      const posicion = await obtenerUbicacion();
      const respuesta = await fetch("/api/album", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantId: resultado.plantId,
          photoUrl: resultado.photoUrl,
          latitude: posicion?.coords.latitude,
          longitude: posicion?.coords.longitude,
        }),
      });
      const data: ApiResponse<CollectionEntry> = await respuesta.json();
      if (!data.success) throw new Error(data.error ?? "Error al guardar en álbum");

      setGuardado(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar en álbum");
    } finally {
      setGuardando(false);
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
          <div className="my-2">
            <RarityBadge rarity={resultado.rarity} />
          </div>
          <p className="mb-4 text-sm text-text">
            Confianza: {Math.round(resultado.confidence * 100)}%
          </p>
          <button
            onClick={handleAgregarAlbum}
            disabled={guardando || guardado}
            className="w-full rounded-xl bg-primary py-3 text-center font-semibold text-white disabled:opacity-60"
          >
            {guardado ? "Agregada al álbum ✓" : guardando ? "Guardando..." : "Agregar al álbum"}
          </button>
        </div>
      )}
    </div>
  );
}
