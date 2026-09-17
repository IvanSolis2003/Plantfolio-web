import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";

export async function GET() {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const entradas = await prisma.collectionEntry.findMany({
    where: { userId: usuario.id, latitude: { not: null }, longitude: { not: null } },
    include: { plant: true },
    orderBy: { identifiedAt: "desc" },
  });

  return NextResponse.json({ success: true, data: entradas });
}
