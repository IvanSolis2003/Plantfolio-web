import { cookies } from "next/headers";
import type { ApiResponse, User } from "@/types";

const NOMBRE_COOKIE = "plantfolio_sesion";
const DURACION_DIAS = 7;
const API_URL = process.env.PLANTFOLIO_API_URL ?? "http://localhost:3000";

export async function setCookieSesion(token: string): Promise<void> {
  const almacen = await cookies();
  almacen.set(NOMBRE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_DIAS * 24 * 60 * 60,
  });
}

export async function borrarCookieSesion(): Promise<void> {
  const almacen = await cookies();
  almacen.delete(NOMBRE_COOKIE);
}

export async function obtenerTokenSesion(): Promise<string | null> {
  const almacen = await cookies();
  return almacen.get(NOMBRE_COOKIE)?.value ?? null;
}

export async function obtenerUsuarioServidor(): Promise<User | null> {
  const token = await obtenerTokenSesion();
  if (!token) return null;

  try {
    const respuesta = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!respuesta.ok) return null;

    const data: ApiResponse<User> = await respuesta.json();
    return data.success && data.data ? data.data : null;
  } catch {
    return null;
  }
}
