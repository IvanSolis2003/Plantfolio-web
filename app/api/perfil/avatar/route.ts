import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioId } from "@/lib/sesion";
import { subirImagen } from "@/lib/cloudinary";
import { parsearBody, imagenSchema } from "@/lib/validar";

export const maxDuration = 60;

const avatarSchema = z.object({
  image: imagenSchema,
});

export async function POST(req: NextRequest) {
  const userId = await obtenerUsuarioId();
  if (!userId) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const validacion = await parsearBody(req, avatarSchema);
  if ("error" in validacion) return validacion.error;

  const { image } = validacion.data;

  let avatarUrl: string;
  try {
    avatarUrl = await subirImagen(image);
  } catch (err) {
    console.error("avatar:", err);
    return NextResponse.json({ success: false, error: "Error al subir la foto" }, { status: 500 });
  }

  await prisma.user.update({ where: { id: userId }, data: { avatarUrl } });

  return NextResponse.json({ success: true, data: { avatarUrl } });
}
