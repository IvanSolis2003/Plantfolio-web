import { NextRequest, NextResponse } from "next/server";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import { obtenerAlertaRiego } from "@/lib/clima";
import { LIMITES, contarYLimitar } from "@/lib/limites";

export async function GET(req: NextRequest) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const bloqueo = await contarYLimitar(`clima:${usuario.id}`, LIMITES.climaPorUsuario);
  if (bloqueo) return bloqueo;

  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  const fueraDeRango = Math.abs(lat) > 90 || Math.abs(lon) > 180;
  if (Number.isNaN(lat) || Number.isNaN(lon) || fueraDeRango) {
    return NextResponse.json({ success: false, error: "Coordenadas inválidas" }, { status: 400 });
  }

  try {
    const alerta = await obtenerAlertaRiego(lat, lon);
    return NextResponse.json({ success: true, data: alerta });
  } catch (err) {
    console.error("clima:", err);
    return NextResponse.json({ success: false, error: "No se pudo obtener el clima" }, { status: 500 });
  }
}
