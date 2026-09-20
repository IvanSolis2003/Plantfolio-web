"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CreditoIasmtech from "@/components/CreditoIasmtech";
import type { ApiResponse } from "@/types";

export default function FormularioRestablecer({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Este enlace no es válido.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const respuesta = await fetch("/api/auth/restablecer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data: ApiResponse<null> = await respuesta.json();
      if (!data.success) throw new Error(data.error ?? "No pudimos restablecer tu contraseña");

      setListo(true);
      setTimeout(() => router.push("/entrar"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-1 justify-center bg-background px-6">
      <div className="flex w-full max-w-sm flex-col justify-center">
        <div className="mb-10 flex flex-col items-center">
          <span className="mb-2 text-5xl">🌿</span>
          <h1 className="text-2xl font-bold text-primary">Elegí tu nueva contraseña</h1>
        </div>

        {listo ? (
          <p className="text-center text-sm font-medium text-primary">
            Contraseña actualizada. Te llevamos a Entrar...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-text">Nueva contraseña</label>
              <input
                type="password"
                className="w-full rounded-xl border border-accent bg-surface px-4 py-3 text-base text-text"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-text">Confirmar contraseña</label>
              <input
                type="password"
                className="w-full rounded-xl border border-accent bg-surface px-4 py-3 text-base text-text"
                placeholder="••••••••"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {error && <p className="text-sm font-medium text-danger">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-primary py-4 text-center text-base font-bold text-white disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
          </form>
        )}

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
