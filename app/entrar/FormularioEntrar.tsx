"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ApiResponse, AuthTokens } from "@/types";

export default function FormularioEntrar() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data: ApiResponse<AuthTokens> = await respuesta.json();
      if (!data.success) throw new Error(data.error ?? "Credenciales inválidas");

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-1 justify-center bg-background px-6">
      <div className="flex w-full max-w-sm flex-col justify-center">
        <div className="mb-10 flex flex-col items-center">
          <span className="mb-2 text-5xl">🌿</span>
          <h1 className="text-3xl font-bold text-primary">Plantfolio</h1>
          <p className="mt-1 text-base text-muted">Tu colección de plantas</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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

          <div>
            <label className="mb-1 block text-sm font-medium text-text">Contraseña</label>
            <input
              type="password"
              className="w-full rounded-xl border border-accent bg-surface px-4 py-3 text-base text-text"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm font-medium text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-primary py-4 text-center text-base font-bold text-white disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <span className="text-muted">¿No tienes cuenta? </span>
          <Link href="/registro" className="font-semibold text-primary">
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}
