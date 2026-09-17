import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const entrada = await prisma.collectionEntry.findUnique({ where: { id } });

  if (!entrada || entrada.userId !== usuario.id) {
    return NextResponse.json({ success: false, error: "Entrada no encontrada" }, { status: 404 });
  }

  await prisma.collectionEntry.delete({ where: { id } });
  return NextResponse.json({ success: true, data: null });
}
