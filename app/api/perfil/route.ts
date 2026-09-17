import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioId } from "@/lib/sesion";
import { parsearBody } from "@/lib/validar";

const perfilSchema = z.object({
  bio: z.string().optional(),
  ubicacionTexto: z.string().optional(),
  compartirPerfil: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const userId = await obtenerUsuarioId();
  if (!userId) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const validacion = await parsearBody(req, perfilSchema);
  if ("error" in validacion) return validacion.error;

  const { bio, ubicacionTexto, compartirPerfil } = validacion.data;

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
