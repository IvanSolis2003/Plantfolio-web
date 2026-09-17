import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import { identificarPlanta } from "@/lib/plantnet";
import { subirImagen } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const { image } = (await req.json()) as { image: string };

  try {
    const resultado = await identificarPlanta(image);
    const photoUrl = await subirImagen(image);

    const planta = await prisma.plant.upsert({
      where: { scientificName: resultado.scientificName },
      update: {},
      create: {
        scientificName: resultado.scientificName,
        commonName: resultado.commonName,
        family: resultado.family,
        rarity: resultado.rarity,
        nativeToChile: resultado.nativeToChile,
      },
    });

    await prisma.identificationLog.create({
      data: {
        userId: usuario.id,
        photoUrl,
        apiResponse: resultado.rawResponse as object,
        confidence: resultado.confidence,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        plantId: planta.id,
        photoUrl,
        scientificName: planta.scientificName,
        commonName: planta.commonName,
        family: planta.family,
        rarity: planta.rarity,
        nativeToChile: planta.nativeToChile,
        confidence: resultado.confidence,
      },
    });
  } catch (err) {
    console.error("identify:", err);
    return NextResponse.json(
      { success: false, error: "Error al identificar la planta" },
      { status: 500 }
    );
  }
}
