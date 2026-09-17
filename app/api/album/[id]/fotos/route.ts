import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import { subirImagen } from "@/lib/cloudinary";
import { parsearBody } from "@/lib/validar";

export const maxDuration = 60;

const MAX_FOTOS = 3;

const agregarFotoSchema = z.object({
  image: z.string({ error: "Imagen requerida" }).min(1, "Imagen requerida"),
});

const eliminarFotoSchema = z.object({
  url: z.string({ error: "url requerida" }).min(1, "url requerida"),
});

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

  const validacion = await parsearBody(req, agregarFotoSchema);
  if ("error" in validacion) return validacion.error;

  const { image } = validacion.data;

  let url: string;
  try {
    url = await subirImagen(image);
  } catch (err) {
    console.error("agregar-foto:", err);
    return NextResponse.json({ success: false, error: "Error al subir la foto" }, { status: 500 });
  }

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

  const validacionDelete = await parsearBody(req, eliminarFotoSchema);
  if ("error" in validacionDelete) return validacionDelete.error;

  const { url } = validacionDelete.data;
  const actualizada = await prisma.collectionEntry.update({
    where: { id },
    data: { photos: entrada.photos.filter((f) => f !== url) },
    include: { plant: true },
  });

  return NextResponse.json({ success: true, data: actualizada });
}
