import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioId } from "@/lib/sesion";

export async function POST(req: NextRequest) {
  const userId = await obtenerUsuarioId();
  if (!userId) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const { coleccionPrivada } = (await req.json()) as { coleccionPrivada: boolean };

  await prisma.user.update({ where: { id: userId }, data: { coleccionPrivada } });

  return NextResponse.json({ success: true, data: { coleccionPrivada } });
}
