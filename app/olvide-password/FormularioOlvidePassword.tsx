"use client";

import { useState } from "react";
import Link from "next/link";
import CreditoIasmtech from "@/components/CreditoIasmtech";
import type { ApiResponse } from "@/types";

export default function FormularioOlvidePassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMensaje(null);
    try {
      const respuesta = await fetch("/api/auth/olvide-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data: ApiResponse<{ mensaje: string }> = await respuesta.json();
      setMensaje(data.data?.mensaje ?? data.error ?? "Listo.");
    } catch {
      setMensaje("No pudimos procesar la solicitud, intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-1 justify-center bg-background px-6">
      <div className="flex w-full max-w-sm flex-col justify-center">
        <div className="mb-10 flex flex-col items-center">
          <span className="mb-2 text-5xl">🌿</span>
          <h1 className="text-2xl font-bold text-primary">Recuperar contraseña</h1>
          <p className="mt-1 text-center text-base text-muted">
            Te mandamos un enlace a tu correo para elegir una nueva.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Correo electrónico
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-accent bg-surface px-4 py-3 text-base text-text"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {mensaje && <p className="text-sm font-medium text-primary">{mensaje}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-primary py-4 text-center text-base font-bold text-white disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <Link href="/entrar" className="font-semibold text-primary">
            Volver a entrar
          </Link>
        </div>

        <CreditoIasmtech />
      </div>
    </div>
  );
}
