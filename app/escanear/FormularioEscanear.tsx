"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import RarityBadge from "@/components/RarityBadge";
import { archivoAJpegBase64 } from "@/lib/imagenCliente";
import type { ApiResponse, CollectionEntry, IdentifyResponse, IdentifyResult, Plant } from "@/types";

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
  const [resultado, setResultado] = useState<IdentifyResponse | null>(null);
  const [seleccionada, setSeleccionada] = useState<IdentifyResult | null>(null);
  const [nombreManual, setNombreManual] = useState("");
  const [buscandoManual, setBuscandoManual] = useState(false);
  const [soloIdentificada, setSoloIdentificada] = useState(false);
  const router = useRouter();

  function reiniciar() {
    setResultado(null);
    setSeleccionada(null);
    setNombreManual("");
    setGuardado(false);
    setSoloIdentificada(false);
    setError(null);
  }

  async function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    reiniciar();
    setCargando(true);

    try {
      const base64 = await archivoAJpegBase64(archivo);
      const respuesta = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const data: ApiResponse<IdentifyResponse> = await respuesta.json();
      if (!data.success || !data.data) throw new Error(data.error ?? "Error al identificar planta");

      setResultado(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al identificar planta");
    } finally {
      setCargando(false);
      e.target.value = "";
    }
  }

  async function handleBuscarManual() {
    const nombre = nombreManual.trim();
    if (!nombre || !resultado) return;

    setBuscandoManual(true);
    setError(null);

    try {
      const respuesta = await fetch("/api/plantas/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const data: ApiResponse<Plant> = await respuesta.json();
      if (!data.success || !data.data) throw new Error(data.error ?? "Error al buscar la planta");

      setSeleccionada({
        plantId: data.data.id,
        photoUrl: resultado.photoUrl,
        scientificName: data.data.scientificName,
        commonName: data.data.commonName,
        family: data.data.family,
        rarity: data.data.rarity,
        nativeToChile: data.data.nativeToChile,
        confidence: 0,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al buscar la planta");
    } finally {
      setBuscandoManual(false);
    }
  }

  function handleSoloIdentificar() {
    if (!seleccionada) return;
    setSoloIdentificada(true);
    setError(null);
  }

  async function handleAgregarAlbum() {
    if (!seleccionada) return;

    setGuardando(true);
    setError(null);

    try {
      const posicion = await obtenerUbicacion();
      const respuesta = await fetch("/api/album", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantId: seleccionada.plantId,
          photoUrl: seleccionada.photoUrl,
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
    <div className="flex min-h-dvh flex-col items-center px-6 pt-12 pb-6">
      <span className="mb-3 text-4xl">🔍</span>
      <p className="mb-6 text-xl font-bold text-primary">Identificar Planta</p>

      {!resultado && (
        <label className="mb-4 flex w-full max-w-sm cursor-pointer flex-col items-center rounded-2xl border border-accent bg-surface p-6 text-center">
          <span className="mb-2 text-3xl">📷</span>
          <span className="font-semibold text-primary">
            {cargando ? "Identificando..." : "Tomar o subir foto"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={cargando}
            onChange={handleArchivo}
          />
        </label>
      )}

      {error && <p className="text-sm font-medium text-danger">{error}</p>}

      {resultado && (
        <div className="w-full max-w-sm">
          <Image
            src={resultado.photoUrl}
            alt="Foto identificada"
            width={400}
            height={300}
            className="mb-3 h-48 w-full rounded-xl object-cover"
          />

          <p className="mb-2 text-sm font-semibold text-text">
            ¿Cuál de estas opciones es tu planta?
          </p>

          <div className="mb-4 flex flex-col gap-2">
            {resultado.candidatos.map((candidato) => {
              const elegida = seleccionada?.plantId === candidato.plantId;
              return (
                <button
                  key={candidato.plantId}
                  onClick={() => setSeleccionada(candidato)}
                  className={`rounded-2xl border p-3 text-left ${
                    elegida ? "border-primary bg-primary/10" : "border-accent bg-surface"
                  }`}
                >
                  <p className="font-bold text-primary">{candidato.commonName}</p>
                  <p className="mb-1 text-sm italic text-muted">{candidato.scientificName}</p>
                  <div className="flex items-center gap-2">
                    <RarityBadge rarity={candidato.rarity} />
                    <span className="text-xs text-muted">
                      {Math.round(candidato.confidence * 100)}% de coincidencia
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {soloIdentificada && seleccionada && (
            <div className="mb-3 w-full rounded-2xl border border-primary bg-primary/10 p-3 text-center">
              <p className="font-bold text-primary">{seleccionada.commonName}</p>
              <p className="text-sm italic text-muted">{seleccionada.scientificName}</p>
              <p className="mt-1 text-xs text-muted">Identificada, no se guardó en tu álbum.</p>
            </div>
          )}

          <div className="mb-2 flex w-full gap-2">
            <button
              onClick={handleAgregarAlbum}
              disabled={!seleccionada || guardando || guardado}
              className="flex-1 rounded-xl bg-primary py-3 text-center font-semibold text-white disabled:opacity-60"
            >
              {guardado ? "Agregada ✓" : guardando ? "Guardando..." : "Agregar al álbum"}
            </button>

            <button
              onClick={handleSoloIdentificar}
              disabled={!seleccionada || guardando}
              className="flex-1 rounded-xl border border-primary py-3 text-center font-semibold text-primary disabled:opacity-60"
            >
              Solo identificar
            </button>
          </div>

          <button
            onClick={reiniciar}
            className="mb-4 w-full rounded-xl border border-accent py-3 text-center font-semibold text-muted"
          >
            {soloIdentificada || guardado ? "Identificar otra" : "Ninguna es correcta — volver a intentar"}
          </button>

          <div className="w-full rounded-2xl border border-dashed border-accent bg-surface p-3">
            <p className="mb-2 text-xs font-semibold text-muted">
              ¿La reconocés pero no aparece en la lista? Escribí su nombre:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={nombreManual}
                onChange={(e) => setNombreManual(e.target.value)}
                placeholder="Ej: Copihue"
                className="flex-1 rounded-xl border border-accent bg-background px-3 py-2 text-sm text-text"
              />
              <button
                onClick={handleBuscarManual}
                disabled={!nombreManual.trim() || buscandoManual}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {buscandoManual ? "..." : "Buscar"}
              </button>
            </div>
            {seleccionada && !resultado.candidatos.some((c) => c.plantId === seleccionada.plantId) && (
              <p className="mt-2 text-sm font-semibold text-primary">
                Seleccionada: {seleccionada.commonName} ({seleccionada.scientificName})
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
