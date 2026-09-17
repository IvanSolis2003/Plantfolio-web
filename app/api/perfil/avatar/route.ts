import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioId } from "@/lib/sesion";
import { subirImagen } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const userId = await obtenerUsuarioId();
  if (!userId) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const { image } = (await req.json()) as { image: string };
  const avatarUrl = await subirImagen(image);

  await prisma.user.update({ where: { id: userId }, data: { avatarUrl } });

  return NextResponse.json({ success: true, data: { avatarUrl } });
}
