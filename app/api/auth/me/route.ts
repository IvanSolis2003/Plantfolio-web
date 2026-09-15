import { NextResponse } from "next/server";
import { obtenerUsuarioServidor } from "@/lib/sesion";

export async function GET() {
  const user = await obtenerUsuarioServidor();
  if (!user) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }
  return NextResponse.json({ success: true, data: user });
}
