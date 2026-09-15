"use client";

import { useEffect, useState } from "react";

export default function EstadoConexion() {
  const [sinConexion, setSinConexion] = useState(false);

  useEffect(() => {
    const actualizar = () => setSinConexion(!navigator.onLine);

    actualizar();
    window.addEventListener("online", actualizar);
    window.addEventListener("offline", actualizar);

    return () => {
      window.removeEventListener("online", actualizar);
      window.removeEventListener("offline", actualizar);
    };
  }, []);

  if (!sinConexion) return null;

  return (
    <div
      role="status"
      className="bg-danger text-white sticky top-0 z-50 px-4 py-2 text-center"
    >
      <p className="text-xs font-semibold">
        Sin conexión. Estás viendo la última versión guardada.
      </p>
    </div>
  );
}
