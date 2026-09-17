"use client";

import { useEffect, useState } from "react";
import type { ApiResponse } from "@/types";
import type { AlertaRiego as AlertaRiegoTipo } from "@/lib/clima";

export default function AlertaRiego() {
  const [alerta, setAlerta] = useState<AlertaRiegoTipo | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (posicion) => {
        try {
          const { latitude, longitude } = posicion.coords;
          const respuesta = await fetch(`/api/clima?lat=${latitude}&lon=${longitude}`);
          const data: ApiResponse<AlertaRiegoTipo> = await respuesta.json();
          if (data.success && data.data) setAlerta(data.data);
        } catch {
          // sin alerta si falla, no es crítico
        }
      },
      () => {},
      { timeout: 5000 }
    );
  }, []);

  if (!alerta) return null;

  return (
    <div className="mb-4 rounded-2xl border border-accent bg-surface p-4">
      <p className="mb-1 text-sm font-bold text-primary">
        💧 {Math.round(alerta.temperatura)}°C — Alerta de riego
      </p>
      <p className="text-sm text-text">{alerta.mensaje}</p>
    </div>
  );
}
