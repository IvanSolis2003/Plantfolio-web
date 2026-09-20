import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import AlbumCliente from "./AlbumCliente";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mi Álbum — Plantfolio",
};

export default async function AlbumPage() {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) redirect("/entrar");

  const entradas = await prisma.collectionEntry.findMany({
    where: { userId: usuario.id },
    include: { plant: true },
    orderBy: { identifiedAt: "desc" },
  });

  return (
    <AlbumCliente
      nombreUsuario={usuario.name}
      entradas={entradas.map((entrada) => ({
        ...entrada,
        identifiedAt: entrada.identifiedAt.toISOString(),
        notes: entrada.notes ?? undefined,
        latitude: entrada.latitude ?? undefined,
        longitude: entrada.longitude ?? undefined,
        ubicacionAprox: entrada.ubicacionAprox ?? undefined,
        lastWatered: entrada.lastWatered?.toISOString(),
        photoDates: entrada.photoDates.map((d) => d.toISOString()),
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
