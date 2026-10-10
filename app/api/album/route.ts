import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import { ubicacionAproximada } from "@/lib/geocoding";
import { parsearBody, urlFotoSchema, notaSchema } from "@/lib/validar";
import { LIMITES, contarYLimitar } from "@/lib/limites";

const agregarAlbumSchema = z.object({
  plantId: z.string({ error: "plantId requerido" }).min(1, "plantId requerido"),
  photoUrl: urlFotoSchema,
  notes: notaSchema.optional(),
  latitude: z.number().min(-90, "Latitud inválida").max(90, "Latitud inválida").optional(),
  longitude: z.number().min(-180, "Longitud inválida").max(180, "Longitud inválida").optional(),
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

  const bloqueo = await contarYLimitar(`album:${usuario.id}`, LIMITES.guardarAlbumPorUsuario);
  if (bloqueo) return bloqueo;

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
      photoDates: [new Date()],
      notes,
      latitude,
      longitude,
      ubicacionAprox,
    },
    include: { plant: true },
  });

  return NextResponse.json({ success: true, data: entrada }, { status: 201 });
}
