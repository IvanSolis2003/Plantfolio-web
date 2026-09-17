import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import { ubicacionAproximada } from "@/lib/geocoding";
import { parsearBody } from "@/lib/validar";

const agregarAlbumSchema = z.object({
  plantId: z.string({ error: "plantId requerido" }).min(1, "plantId requerido"),
  photoUrl: z.string({ error: "photoUrl requerido" }).min(1, "photoUrl requerido"),
  notes: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function GET() {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const entradas = await prisma.collectionEntry.findMany({
    where: { userId: usuario.id },
    include: { plant: true },
    orderBy: { identifiedAt: "desc" },
  });

  return NextResponse.json({ success: true, data: entradas });
}

export async function POST(req: NextRequest) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const validacion = await parsearBody(req, agregarAlbumSchema);
  if ("error" in validacion) return validacion.error;

  const { plantId, photoUrl, notes, latitude, longitude } = validacion.data;

  const planta = await prisma.plant.findUnique({ where: { id: plantId } });
  if (!planta) {
    return NextResponse.json({ success: false, error: "Planta no encontrada" }, { status: 404 });
  }

  const ubicacionAprox =
    latitude !== undefined && longitude !== undefined
      ? await ubicacionAproximada(latitude, longitude)
      : null;

  const entrada = await prisma.collectionEntry.create({
    data: {
      userId: usuario.id,
      plantId,
      photos: [photoUrl],
      notes,
      latitude,
      longitude,
      ubicacionAprox,
    },
    include: { plant: true },
  });

  return NextResponse.json({ success: true, data: entrada }, { status: 201 });
}
