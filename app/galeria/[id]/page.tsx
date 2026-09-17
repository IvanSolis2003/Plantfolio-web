import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RarityBadge from "@/components/RarityBadge";
import HeaderPublico from "@/components/HeaderPublico";
import CreditoIasmtech from "@/components/CreditoIasmtech";
import { obtenerUsuarioServidor } from "@/lib/sesion";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Planta — Plantfolio",
};

export default async function DetallePublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const usuario = await obtenerUsuarioServidor();

  const entrada = await prisma.collectionEntry.findUnique({
    where: { id: (await params).id },
    include: { plant: true, user: true },
  });

  if (!entrada || entrada.privado || entrada.user.coleccionPrivada) notFound();

  const { user } = entrada;

  return (
    <div className="min-h-dvh bg-background pb-10">
      {!usuario && <HeaderPublico />}

      <div className="px-5 pt-6">
        <Link href="/galeria" className="mb-4 inline-block text-sm font-semibold text-primary">
          ← Volver a la galería
        </Link>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {entrada.photos.map((url) => (
            <Image
              key={url}
              src={url}
              alt={entrada.plant.commonName}
              width={150}
              height={150}
              className="h-24 w-full rounded-xl object-cover"
            />
          ))}
        </div>

        <p className="text-xl font-bold text-primary">{entrada.plant.commonName}</p>
        <p className="mb-2 text-sm italic text-muted">{entrada.plant.scientificName}</p>
        <div className="mb-4 flex items-center gap-2">
          <RarityBadge rarity={entrada.plant.rarity} />
          {entrada.plant.nativeToChile && (
            <span className="text-xs font-semibold text-primary">🇨🇱 Nativa de Chile</span>
          )}
        </div>

        <p className="mb-1 text-sm text-text">
          <span className="font-semibold">Familia:</span> {entrada.plant.family ?? "Desconocida"}
        </p>
        {entrada.ubicacionAprox && (
          <p className="mb-4 text-sm text-text">
            <span className="font-semibold">📍 Ubicación:</span> {entrada.ubicacionAprox}
          </p>
        )}

        {entrada.plant.careInstructions && (
          <>
            <p className="mb-1 text-sm font-bold text-primary">Cuidados</p>
            <p className="mb-3 text-sm text-text">{entrada.plant.careInstructions}</p>
          </>
        )}

        {entrada.plant.diseases && (
          <>
            <p className="mb-1 text-sm font-bold text-primary">Plagas y enfermedades comunes</p>
            <p className="mb-4 text-sm text-text">{entrada.plant.diseases}</p>
          </>
        )}

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-accent bg-surface p-4">
          {user.compartirPerfil && user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl">
              👤
            </div>
          )}
          <div>
            <p className="font-bold text-primary">{user.name}</p>
            {user.compartirPerfil && user.ubicacionTexto && (
              <p className="text-xs text-muted">{user.ubicacionTexto}</p>
            )}
            {user.compartirPerfil && user.bio && (
              <p className="mt-1 text-sm text-text">{user.bio}</p>
            )}
          </div>
        </div>

        <CreditoIasmtech />
      </div>
    </div>
  );
}
