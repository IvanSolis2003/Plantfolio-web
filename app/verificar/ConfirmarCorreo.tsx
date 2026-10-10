"use client";

import { useState } from "react";
import Link from "next/link";
import type { ApiResponse } from "@/types";

type Desenlace = "ok" | "ya-estaba" | "vencido" | "invalido";

const TEXTOS: Record<Desenlace, { titulo: string; texto: string }> = {
  ok: {
    titulo: "Correo confirmado",
    texto: "Gracias. Ahora falta que un administrador habilite tu cuenta. Te avisamos por correo cuando esté lista.",
  },
  "ya-estaba": {
    titulo: "Este correo ya estaba confirmado",
    texto: "No hace falta hacer nada más. Si todavía no puedes entrar, falta que un administrador habilite tu cuenta.",
  },
  vencido: {
    titulo: "El enlace venció",
    texto: "Los enlaces duran 24 horas. Andá a Entrar e intentá iniciar sesión con tu correo — ahí vas a poder pedir uno nuevo.",
  },
  invalido: {
    titulo: "Este enlace no sirve",
    texto: "Puede estar incompleto o ya haberse usado. Revisa que hayas copiado la dirección entera desde el correo.",
  },
};

export default function ConfirmarCorreo({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [desenlace, setDesenlace] = useState<Desenlace | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function confirmar() {
    setLoading(true);
    setError(null);
    try {
      const respuesta = await fetch("/api/auth/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data: ApiResponse<{ desenlace: Desenlace }> = await respuesta.json();
      if (!data.success || !data.data) throw new Error(data.error ?? "No pudimos confirmar tu correo");
      setDesenlace(data.data.desenlace);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al confirmar el correo");
    } finally {
      setLoading(false);
    }
  }

  if (desenlace) {
    const { titulo, texto } = TEXTOS[desenlace];
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <span className="mb-3 text-4xl">🌿</span>
        <p className="mb-2 text-xl font-bold text-primary">{titulo}</p>
        <p className="mb-6 text-sm text-muted">{texto}</p>
        <Link href="/entrar" className="rounded-xl bg-primary px-6 py-3 font-bold text-white">
          Ir a entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="mb-3 text-4xl">🌿</span>
      <p className="mb-2 text-xl font-bold text-primary">Confirma tu correo</p>
      <p className="mb-6 text-sm text-muted">Toca el botón para terminar de confirmar tu correo en Plantfolio.</p>
      {error && <p className="mb-4 text-sm font-medium text-red-600">{error}</p>}
      <button
        onClick={confirmar}
        disabled={loading}
        className="rounded-xl bg-primary px-6 py-3 font-bold text-white disabled:opacity-60"
      >
        {loading ? "Confirmando..." : "Confirmar mi correo"}
      </button>
    </div>
  );
}
