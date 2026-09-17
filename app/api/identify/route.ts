import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import { identificarPlanta } from "@/lib/plantnet";
import { subirImagen } from "@/lib/cloudinary";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const { image } = (await req.json()) as { image: string };

  try {
    const [{ candidatos, rawResponse }, photoUrl] = await Promise.all([
      identificarPlanta(image),
      subirImagen(image),
    ]);

    const plantas = await Promise.all(
      candidatos.map((candidato) =>
        prisma.plant.upsert({
          where: { scientificName: candidato.scientificName },
          update: {},
          create: {
            scientificName: candidato.scientificName,
            commonName: candidato.commonName,
            family: candidato.family,
            rarity: candidato.rarity,
            nativeToChile: candidato.nativeToChile,
          },
        })
      )
    );

    await prisma.identificationLog.create({
      data: {
        userId: usuario.id,
        photoUrl,
        apiResponse: rawResponse as object,
        confidence: candidatos[0].confidence,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        photoUrl,
        candidatos: plantas.map((planta, i) => ({
          plantId: planta.id,
          photoUrl,
          scientificName: planta.scientificName,
          commonName: planta.commonName,
          family: planta.family,
          rarity: planta.rarity,
          nativeToChile: planta.nativeToChile,
          confidence: candidatos[i].confidence,
        })),
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
