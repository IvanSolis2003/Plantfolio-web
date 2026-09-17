import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import RarityBadge from "@/components/RarityBadge";
import HeaderPublico from "@/components/HeaderPublico";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Galería pública — Plantfolio",
};

export default async function GaleriaPage() {
  const usuario = await obtenerUsuarioServidor();

  const entradas = await prisma.collectionEntry.findMany({
    where: { privado: false, user: { coleccionPrivada: false } },
    include: { plant: true, user: { select: { name: true } } },
    orderBy: { identifiedAt: "desc" },
    take: 60,
  });

  return (
    <div className="min-h-dvh bg-background pb-6">
      {!usuario && <HeaderPublico />}

      <div className="px-5 pt-6">
        <p className="mb-1 text-xl font-bold text-primary">Galería pública</p>
        <p className="mb-4 text-sm text-muted">
          Plantas que la comunidad de Plantfolio identificó y compartió.
        </p>

        {entradas.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted">
            Todavía nadie compartió una planta públicamente.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {entradas.map((entrada) => (
              <div key={entrada.id} className="rounded-2xl border border-accent bg-surface p-2">
                <Image
                  src={entrada.photos[0]}
                  alt={entrada.plant.commonName}
                  width={200}
                  height={160}
                  className="mb-2 h-28 w-full rounded-xl object-cover"
                />
                <p className="truncate text-sm font-bold text-primary">{entrada.plant.commonName}</p>
                <p className="truncate text-xs italic text-muted">{entrada.plant.scientificName}</p>
                <div className="my-1.5">
                  <RarityBadge rarity={entrada.plant.rarity} />
                </div>
                <p className="truncate text-xs text-muted">por {entrada.user.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
