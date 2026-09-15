"use client";

import { useEffect } from "react";
import type { User } from "@/types";
import { useAuthStore } from "@/store/authStore";

export default function SincronizarSesion({ usuario }: { usuario: User | null }) {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    if (usuario) setUser(usuario);
    else clearUser();
  }, [usuario, setUser, clearUser]);

  return null;
}
