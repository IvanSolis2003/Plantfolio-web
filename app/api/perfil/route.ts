import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioId } from "@/lib/sesion";

export async function PATCH(req: NextRequest) {
  const userId = await obtenerUsuarioId();
  if (!userId) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const { bio, ubicacionTexto, compartirPerfil } = (await req.json()) as {
    bio?: string;
    ubicacionTexto?: string;
    compartirPerfil?: boolean;
  };

  const usuario = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(bio !== undefined ? { bio } : {}),
      ...(ubicacionTexto !== undefined ? { ubicacionTexto } : {}),
      ...(compartirPerfil !== undefined ? { compartirPerfil } : {}),
    },
    select: { bio: true, ubicacionTexto: true, compartirPerfil: true, avatarUrl: true },
  });

  return NextResponse.json({ success: true, data: usuario });
}
