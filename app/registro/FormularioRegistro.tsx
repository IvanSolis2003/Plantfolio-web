"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ApiResponse, AuthTokens } from "@/types";

export default function FormularioRegistro() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError("Completa todos los campos.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);
      const respuesta = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data: ApiResponse<AuthTokens> = await respuesta.json();
      if (!data.success) throw new Error(data.error ?? "Error al registrarse");

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-1 justify-center bg-background px-6 py-10">
      <div className="flex w-full max-w-sm flex-col justify-center">
        <div className="mb-8 flex flex-col items-center">
          <span className="mb-2 text-5xl">🌱</span>
          <h1 className="text-2xl font-bold text-primary">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-muted">Comienza a coleccionar plantas</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text">Nombre</label>
            <input
              type="text"
              className="w-full rounded-xl border border-accent bg-surface px-4 py-3 text-base text-text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

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
              placeholder="Mín. 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Confirmar contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-accent bg-surface px-4 py-3 text-base text-text"
              placeholder="Repite tu contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-sm font-medium text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-primary py-4 text-center text-base font-bold text-white disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <div className="mt-6 mb-8 flex justify-center">
          <span className="text-muted">¿Ya tienes cuenta? </span>
          <Link href="/entrar" className="font-semibold text-primary">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
