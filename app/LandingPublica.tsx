import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import HeaderPublico from "@/components/HeaderPublico";
import RarityBadge from "@/components/RarityBadge";
import CreditoIasmtech from "@/components/CreditoIasmtech";

export default async function LandingPublica() {
  const entradas = await prisma.collectionEntry.findMany({
    where: { privado: false, user: { coleccionPrivada: false } },
    include: { plant: true },
    orderBy: { identifiedAt: "desc" },
    take: 6,
  });

  return (
    <div className="min-h-dvh bg-background pb-10">
      <HeaderPublico />

      <div className="px-5 pt-8 text-center">
        <span className="mb-2 block text-5xl">🌿</span>
        <h1 className="mb-2 text-2xl font-bold text-primary">
          Identifica y colecciona la flora chilena
        </h1>
        <p className="mb-6 text-sm text-muted">
          Sacá una foto, dejá que la IA la identifique, y armá tu propio álbum de
          plantas encontradas.
        </p>
        <div className="mb-8 flex justify-center gap-3">
          <Link href="/registro" className="rounded-xl bg-primary px-6 py-3 font-bold text-white">
            Crear cuenta gratis
          </Link>
          <Link
            href="/entrar"
            className="rounded-xl border border-accent px-6 py-3 font-bold text-primary"
          >
            Entrar
          </Link>
        </div>
      </div>

      <div className="mx-5 mb-8 flex flex-col items-center rounded-2xl bg-primary p-6 text-center">
        <span className="mb-2 text-4xl">🔍</span>
        <span className="text-lg font-bold text-white">Identificar Planta</span>
        <span className="mt-1 text-sm text-accent">
          Con cuenta, usá la IA para identificar cualquier planta en segundos
        </span>
      </div>

      <div className="px-5">
        <p className="mb-3 text-lg font-bold text-primary">Plantas de la comunidad</p>

        {entradas.length === 0 ? (
          <p className="text-sm text-muted">Todavía nadie compartió una planta públicamente.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {entradas.map((entrada) => (
              <Link
                key={entrada.id}
                href={`/galeria/${entrada.id}`}
                className="rounded-2xl border border-accent bg-surface p-2"
              >
                <Image
                  src={entrada.photos[0]}
                  alt={entrada.plant.commonName}
                  width={200}
                  height={160}
                  className="mb-2 h-24 w-full rounded-xl object-cover"
                />
                <p className="truncate text-sm font-bold text-primary">{entrada.plant.commonName}</p>
                <RarityBadge rarity={entrada.plant.rarity} />
              </Link>
            ))}
          </div>
        )}

        <Link
          href="/galeria"
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-accent bg-surface p-3 text-center"
        >
          <span className="text-xl">🌍</span>
          <span className="text-sm font-semibold text-primary">Ver galería pública completa</span>
        </Link>

        <CreditoIasmtech />
      </div>
    </div>
  );
}
