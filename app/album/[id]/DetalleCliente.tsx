"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RarityBadge from "@/components/RarityBadge";
import VisorFoto from "@/components/VisorFoto";
import { archivoAJpegBase64 } from "@/lib/imagenCliente";
import { diasDesdeUltimoRiego, necesitaRiego } from "@/lib/riego";
import type { ApiResponse, CollectionEntry } from "@/types";

const MAX_FOTOS = 3;

export default function DetalleCliente({ entrada: entradaInicial }: { entrada: CollectionEntry }) {
  const [entrada, setEntrada] = useState(entradaInicial);
  const [nota, setNota] = useState(entrada.notes ?? "");
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [notaGuardada, setNotaGuardada] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [eliminandoFoto, setEliminandoFoto] = useState<string | null>(null);
  const [fotoAbierta, setFotoAbierta] = useState<number | null>(null);
  const [regando, setRegando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRegar() {
    setRegando(true);
    setError(null);
    try {
      const respuesta = await fetch(`/api/album/${entrada.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regada: true }),
      });
      const data: ApiResponse<CollectionEntry> = await respuesta.json();
      if (!data.success || !data.data) throw new Error(data.error ?? "Error al registrar el riego");
      setEntrada(data.data);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrar el riego");
    } finally {
      setRegando(false);
    }
  }

  async function handleGuardarNota() {
    setGuardandoNota(true);
    setError(null);
    try {
      const respuesta = await fetch(`/api/album/${entrada.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: nota }),
      });
      const data: ApiResponse<CollectionEntry> = await respuesta.json();
      if (!data.success) throw new Error(data.error ?? "Error al guardar la nota");
      setNotaGuardada(true);
      setTimeout(() => setNotaGuardada(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar la nota");
    } finally {
      setGuardandoNota(false);
    }
  }

  async function handleAgregarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setSubiendoFoto(true);
    setError(null);
    try {
      const base64 = await archivoAJpegBase64(archivo);
      const respuesta = await fetch(`/api/album/${entrada.id}/fotos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const data: ApiResponse<CollectionEntry> = await respuesta.json();
      if (!data.success || !data.data) throw new Error(data.error ?? "Error al subir la foto");
      setEntrada(data.data);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al subir la foto");
    } finally {
      setSubiendoFoto(false);
      e.target.value = "";
    }
  }

  async function handleEliminarFoto(url: string) {
    if (!window.confirm("¿Eliminar esta foto?")) return;

    setEliminandoFoto(url);
    setError(null);
    try {
      const respuesta = await fetch(`/api/album/${entrada.id}/fotos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data: ApiResponse<CollectionEntry> = await respuesta.json();
      if (!data.success || !data.data) throw new Error(data.error ?? "Error al eliminar la foto");
      setEntrada(data.data);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar la foto");
    } finally {
      setEliminandoFoto(null);
    }
  }

  return (
    <div className="min-h-dvh bg-background/90 px-5 pt-8 pb-10">
      <Link href="/album" className="mb-4 inline-block text-sm font-semibold text-primary">
        ← Volver al álbum
      </Link>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {entrada.photos.map((url, indice) => (
          <div key={url} className="relative">
            <button onClick={() => setFotoAbierta(indice)} className="block w-full">
              <Image
                src={url}
                alt={entrada.plant.commonName}
                width={150}
                height={150}
                className="h-24 w-full rounded-xl object-cover"
              />
            </button>
            <button
              onClick={() => handleEliminarFoto(url)}
              disabled={eliminandoFoto === url || entrada.photos.length <= 1}
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-xs font-bold text-white disabled:opacity-40"
              title={entrada.photos.length <= 1 ? "Necesitás al menos una foto" : "Eliminar foto"}
            >
              ×
            </button>
          </div>
        ))}
        {entrada.photos.length < MAX_FOTOS && (
          <label className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-accent text-center text-xs text-muted">
            {subiendoFoto ? "Subiendo..." : "+ Agregar"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={subiendoFoto}
              onChange={handleAgregarFoto}
            />
          </label>
        )}
      </div>

      {error && <p className="mb-3 text-sm font-medium text-danger">{error}</p>}

      <p className="text-xl font-bold text-primary">{entrada.plant.commonName}</p>
      <p className="mb-2 text-sm italic text-muted">{entrada.plant.scientificName}</p>
      <div className="mb-4 flex items-center gap-2">
        <RarityBadge rarity={entrada.plant.rarity} />
        {entrada.plant.nativeToChile && (
          <span className="text-xs font-semibold text-primary">🇨🇱 Nativa de Chile</span>
        )}
      </div>

      <p className="mb-1 text-sm text-text">
        <span className="font-semibold">Familia:</span> {entrada.plant.family ?? "Desconocida"}
      </p>
      <p className="mb-1 text-sm text-text">
        <span className="font-semibold">Identificada el:</span>{" "}
        {new Date(entrada.identifiedAt).toLocaleDateString("es-CL")}
      </p>

      <div
        className={`mb-4 flex items-center justify-between rounded-2xl border p-3 ${
          necesitaRiego(entrada) ? "border-danger/40 bg-danger/10" : "border-accent bg-surface"
        }`}
      >
        <div>
          <p className="text-sm font-bold text-primary">💧 Riego</p>
          <p className="text-xs text-muted">
            {entrada.lastWatered
              ? `Regada hace ${diasDesdeUltimoRiego(entrada)} día(s)`
              : `Sin registro — ${diasDesdeUltimoRiego(entrada)} día(s) desde que la identificaste`}
            {" · cada "}
            {entrada.plant.wateringFrequencyDays} días
          </p>
        </div>
        <button
          onClick={handleRegar}
          disabled={regando}
          className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {regando ? "..." : "Regué hoy"}
        </button>
      </div>

      {entrada.photos.length > 1 && (
        <>
          <p className="mb-2 text-sm font-bold text-primary">📅 Cómo creció</p>
          <div className="mb-4 flex flex-col gap-2">
            {entrada.photos.map((url, indice) => (
              <button
                key={url}
                onClick={() => setFotoAbierta(indice)}
                className="flex items-center gap-3 rounded-xl border border-accent bg-surface p-2 text-left"
              >
                <Image
                  src={url}
                  alt={entrada.plant.commonName}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <p className="text-xs text-muted">
                  {new Date(entrada.photoDates[indice]).toLocaleDateString("es-CL")}
                </p>
              </button>
            ))}
          </div>
        </>
      )}

      {entrada.plant.careInstructions && (
        <>
          <p className="mb-1 text-sm font-bold text-primary">Cuidados</p>
          <p className="mb-3 text-sm text-text">{entrada.plant.careInstructions}</p>
        </>
      )}

      {entrada.plant.diseases && (
        <>
          <p className="mb-1 text-sm font-bold text-primary">Plagas y enfermedades comunes</p>
          <p className="mb-4 text-sm text-text">{entrada.plant.diseases}</p>
        </>
      )}

      <p className="mb-1 text-sm font-bold text-primary">Mi nota</p>
      <p className="mb-2 text-xs text-muted">
        Agregá lo que quieras: desde cuándo la tenés, edad, cuidados, ubicación en tu casa...
      </p>
      <textarea
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        rows={4}
        placeholder="Ej: la tengo desde marzo 2026, la encontré en el patio de mi abuela..."
        className="mb-2 w-full rounded-xl border border-accent bg-surface px-4 py-3 text-sm text-text"
      />
      <button
        onClick={handleGuardarNota}
        disabled={guardandoNota}
        className="w-full rounded-xl bg-primary py-3 text-center font-semibold text-white disabled:opacity-60"
      >
        {notaGuardada ? "Guardado ✓" : guardandoNota ? "Guardando..." : "Guardar nota"}
      </button>

      {fotoAbierta !== null && (
        <VisorFoto
          fotos={entrada.photos}
          indice={fotoAbierta}
          alt={entrada.plant.commonName}
          onCerrar={() => setFotoAbierta(null)}
        />
      )}
    </div>
  );
}
