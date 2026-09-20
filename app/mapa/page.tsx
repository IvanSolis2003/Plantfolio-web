import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import MapaCliente from "./MapaCliente";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mapa de Hallazgos — Plantfolio",
};

export default async function MapaPage() {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) redirect("/entrar");

  const entradas = await prisma.collectionEntry.findMany({
    where: { userId: usuario.id, latitude: { not: null }, longitude: { not: null } },
    include: { plant: true },
    orderBy: { identifiedAt: "desc" },
  });

  return (
    <MapaCliente
      entradas={entradas.map((entrada) => ({
        ...entrada,
        identifiedAt: entrada.identifiedAt.toISOString(),
        notes: entrada.notes ?? undefined,
        latitude: entrada.latitude ?? undefined,
        longitude: entrada.longitude ?? undefined,
        ubicacionAprox: entrada.ubicacionAprox ?? undefined,
        lastWatered: entrada.lastWatered?.toISOString(),
        plant: {
          ...entrada.plant,
          family: entrada.plant.family ?? undefined,
          description: entrada.plant.description ?? undefined,
          careInstructions: entrada.plant.careInstructions ?? undefined,
          diseases: entrada.plant.diseases ?? undefined,
        },
      }))}
    />
  );
}
