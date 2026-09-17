import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import { esNativaDeChile } from "@/lib/floraNativaChile";

export async function POST(req: NextRequest) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const { nombre } = (await req.json()) as { nombre: string };
  const nombreLimpio = nombre?.trim();

  if (!nombreLimpio) {
    return NextResponse.json(
      { success: false, error: "Escribí el nombre de la planta" },
      { status: 400 }
    );
  }

  const existente = await prisma.plant.findFirst({
    where: {
      OR: [
        { commonName: { equals: nombreLimpio, mode: "insensitive" } },
        { scientificName: { equals: nombreLimpio, mode: "insensitive" } },
      ],
    },
  });

  const planta =
    existente ??
    (await prisma.plant.create({
      data: {
        commonName: nombreLimpio,
        scientificName: nombreLimpio,
        nativeToChile: esNativaDeChile(nombreLimpio),
      },
    }));

  return NextResponse.json({ success: true, data: planta });
}
