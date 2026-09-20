import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import { parsearBody } from "@/lib/validar";

const actualizarEntradaSchema = z.object({
  privado: z.boolean().optional(),
  notes: z.string().optional(),
  regada: z.boolean().optional(),
});

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const entrada = await prisma.collectionEntry.findUnique({ where: { id } });

  if (!entrada || entrada.userId !== usuario.id) {
    return NextResponse.json({ success: false, error: "Entrada no encontrada" }, { status: 404 });
  }

  const validacion = await parsearBody(req, actualizarEntradaSchema);
  if ("error" in validacion) return validacion.error;

  const { privado, notes, regada } = validacion.data;
  const actualizada = await prisma.collectionEntry.update({
    where: { id },
    data: {
      ...(privado !== undefined ? { privado } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(regada ? { lastWatered: new Date() } : {}),
    },
    include: { plant: true },
  });

  return NextResponse.json({ success: true, data: actualizada });
}
