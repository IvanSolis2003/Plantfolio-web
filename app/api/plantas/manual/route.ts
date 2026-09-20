import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import { esNativaDeChile } from "@/lib/floraNativaChile";
import { parsearBody } from "@/lib/validar";

const manualSchema = z.object({
  nombre: z.string({ error: "Escribí el nombre de la planta" }).trim().min(1, "Escribí el nombre de la planta"),
});

export async function POST(req: NextRequest) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const validacion = await parsearBody(req, manualSchema);
  if ("error" in validacion) return validacion.error;

  const { nombre: nombreLimpio } = validacion.data;

  const existente = await prisma.plant.findFirst({
    where: {
      OR: [
        { commonName: { equals: nombreLimpio, mode: "insensitive" } },
        { scientificName: { equals: nombreLimpio, mode: "insensitive" } },
      ],
    },
  });

  if (existente) {
    return NextResponse.json({ success: true, data: existente });
  }

  try {
    const planta = await prisma.plant.create({
      data: {
        commonName: nombreLimpio,
        scientificName: nombreLimpio,
        nativeToChile: esNativaDeChile(nombreLimpio),
      },
    });
    return NextResponse.json({ success: true, data: planta });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const planta = await prisma.plant.findUniqueOrThrow({ where: { scientificName: nombreLimpio } });
      return NextResponse.json({ success: true, data: planta });
    }
    throw err;
  }
}
