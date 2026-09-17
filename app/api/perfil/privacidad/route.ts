import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioId } from "@/lib/sesion";
import { parsearBody } from "@/lib/validar";

const privacidadSchema = z.object({
  coleccionPrivada: z.boolean({ error: "coleccionPrivada requerido" }),
});

export async function POST(req: NextRequest) {
  const userId = await obtenerUsuarioId();
  if (!userId) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const validacion = await parsearBody(req, privacidadSchema);
  if ("error" in validacion) return validacion.error;

  const { coleccionPrivada } = validacion.data;

  await prisma.user.update({ where: { id: userId }, data: { coleccionPrivada } });

  return NextResponse.json({ success: true, data: { coleccionPrivada } });
}
