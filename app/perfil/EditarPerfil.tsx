"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ApiResponse } from "@/types";

function archivoABase64(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

export default function EditarPerfil({
  avatarUrl: avatarInicial,
  bio: bioInicial,
  ubicacionTexto: ubicacionInicial,
  compartirPerfil: compartirInicial,
}: {
  avatarUrl?: string;
  bio?: string;
  ubicacionTexto?: string;
  compartirPerfil: boolean;
}) {
  const [avatarUrl, setAvatarUrl] = useState(avatarInicial);
  const [bio, setBio] = useState(bioInicial ?? "");
  const [ubicacion, setUbicacion] = useState(ubicacionInicial ?? "");
  const [compartir, setCompartir] = useState(compartirInicial);
  const [subiendoAvatar, setSubiendoAvatar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const router = useRouter();

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setSubiendoAvatar(true);
    try {
      const base64 = await archivoABase64(archivo);
      const respuesta = await fetch("/api/perfil/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const data: ApiResponse<{ avatarUrl: string }> = await respuesta.json();
      if (data.success && data.data) {
        setAvatarUrl(data.data.avatarUrl);
        router.refresh();
      }
    } finally {
      setSubiendoAvatar(false);
      e.target.value = "";
    }
  }

  async function handleGuardar() {
    setGuardando(true);
    try {
      const respuesta = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, ubicacionTexto: ubicacion, compartirPerfil: compartir }),
      });
      const data: ApiResponse<unknown> = await respuesta.json();
      if (data.success) {
        setGuardado(true);
        router.refresh();
        setTimeout(() => setGuardado(false), 2000);
      }
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="mb-6 flex flex-col items-center">
      <label className="relative mb-3 flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-accent">
        {avatarUrl ? (
          <Image src={avatarUrl} alt="Avatar" width={80} height={80} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <span className="text-4xl">👤</span>
        )}
        <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">
          {subiendoAvatar ? "…" : "✎"}
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={subiendoAvatar}
          onChange={handleAvatar}
        />
      </label>

      <div className="w-full">
        <label className="mb-1 block text-xs font-medium text-text">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
          placeholder="Coleccionista de flora nativa..."
          className="mb-2 w-full rounded-xl border border-accent bg-surface px-3 py-2 text-sm text-text"
        />

        <label className="mb-1 block text-xs font-medium text-text">Ciudad / región</label>
        <input
          type="text"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          placeholder="Talca, Región del Maule"
          className="mb-2 w-full rounded-xl border border-accent bg-surface px-3 py-2 text-sm text-text"
        />

        <label className="mb-3 flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={compartir}
            onChange={(e) => setCompartir(e.target.checked)}
          />
          Mostrar mi bio, foto y ciudad en las fichas públicas de mis plantas
        </label>

        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="w-full rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-white disabled:opacity-60"
        >
          {guardado ? "Guardado ✓" : guardando ? "Guardando..." : "Guardar perfil"}
        </button>
      </div>
    </div>
  );
}
