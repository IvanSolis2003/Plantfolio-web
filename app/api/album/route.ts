import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import { ubicacionAproximada } from "@/lib/geocoding";

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

  const { plantId, photoUrl, notes, latitude, longitude } = (await req.json()) as {
    plantId: string;
    photoUrl: string;
    notes?: string;
    latitude?: number;
    longitude?: number;
  };

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
