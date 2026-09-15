import { NextResponse } from "next/server";
import { obtenerTokenSesion } from "./sesion";

const API_URL = process.env.PLANTFOLIO_API_URL ?? "http://localhost:3000";

export async function reenviarConToken(ruta: string, init?: RequestInit): Promise<NextResponse> {
  const token = await obtenerTokenSesion();
  if (!token) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await respuesta.json().catch(() => null);
  return NextResponse.json(data, { status: respuesta.status });
}
