"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function BotonSalir() {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();

  function cerrar() {
    if (!window.confirm("¿Estás seguro que quieres cerrar sesión?")) return;

    iniciarTransicion(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      (await navigator.serviceWorker?.getRegistration())?.active?.postMessage("limpiar-paginas");
      router.push("/entrar");
      router.refresh();
    });
  }

  return (
    <button
      onClick={cerrar}
      disabled={pendiente}
      className="mt-auto mb-8 rounded-xl border border-danger/30 bg-danger/10 py-4 text-center font-semibold text-danger disabled:opacity-60"
    >
      {pendiente ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );
}
