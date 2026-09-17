import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import DetalleCliente from "./DetalleCliente";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Detalle de planta — Plantfolio",
};

export default async function DetalleEntradaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) redirect("/entrar");

  const { id } = await params;
  const entrada = await prisma.collectionEntry.findUnique({
    where: { id },
    include: { plant: true },
  });

  if (!entrada || entrada.userId !== usuario.id) notFound();

  return (
    <DetalleCliente
      entrada={{
        ...entrada,
        identifiedAt: entrada.identifiedAt.toISOString(),
        notes: entrada.notes ?? undefined,
        latitude: entrada.latitude ?? undefined,
        longitude: entrada.longitude ?? undefined,
        ubicacionAprox: entrada.ubicacionAprox ?? undefined,
        plant: {
          ...entrada.plant,
          family: entrada.plant.family ?? undefined,
          description: entrada.plant.description ?? undefined,
          careInstructions: entrada.plant.careInstructions ?? undefined,
          diseases: entrada.plant.diseases ?? undefined,
        },
      }}
    />
  );
}
