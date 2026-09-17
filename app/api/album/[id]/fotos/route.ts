import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import { subirImagen } from "@/lib/cloudinary";

export const maxDuration = 60;

const MAX_FOTOS = 3;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const entrada = await prisma.collectionEntry.findUnique({ where: { id } });

  if (!entrada || entrada.userId !== usuario.id) {
    return NextResponse.json({ success: false, error: "Entrada no encontrada" }, { status: 404 });
  }

  if (entrada.photos.length >= MAX_FOTOS) {
    return NextResponse.json(
      { success: false, error: `Máximo ${MAX_FOTOS} fotos por planta` },
      { status: 409 }
    );
  }

  const { image } = (await req.json()) as { image: string };
  const url = await subirImagen(image);

  const actualizada = await prisma.collectionEntry.update({
    where: { id },
    data: { photos: [...entrada.photos, url] },
    include: { plant: true },
  });

  return NextResponse.json({ success: true, data: actualizada });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const entrada = await prisma.collectionEntry.findUnique({ where: { id } });

  if (!entrada || entrada.userId !== usuario.id) {
    return NextResponse.json({ success: false, error: "Entrada no encontrada" }, { status: 404 });
  }

  if (entrada.photos.length <= 1) {
    return NextResponse.json(
      { success: false, error: "Necesitás al menos una foto" },
      { status: 409 }
    );
  }

  const { url } = (await req.json()) as { url: string };
  const actualizada = await prisma.collectionEntry.update({
    where: { id },
    data: { photos: entrada.photos.filter((f) => f !== url) },
    include: { plant: true },
  });

  return NextResponse.json({ success: true, data: actualizada });
}
