import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import { calcularLogros } from "@/lib/logros";
import { calcularDesafios, nombreTemporada } from "@/lib/desafios";
import BotonSalir from "./BotonSalir";
import ToggleColeccionPrivada from "./ToggleColeccionPrivada";
import EditarPerfil from "./EditarPerfil";
import CreditoIasmtech from "@/components/CreditoIasmtech";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mi perfil — Plantfolio",
};

export default async function PerfilPage() {
  const usuario = await obtenerUsuarioServidor();
  if (!usuario) redirect("/entrar");

  const { coleccionPrivada } = await prisma.user.findUniqueOrThrow({
    where: { id: usuario.id },
    select: { coleccionPrivada: true },
  });

  const entradas = await prisma.collectionEntry.findMany({
    where: { userId: usuario.id },
    include: { plant: true },
  });

  const plantas = entradas.length;
  const especies = new Set(entradas.map((entrada) => entrada.plantId)).size;
  const raras = entradas.filter((entrada) => entrada.plant.rarity !== "COMUN").length;

  const estadisticas = [
    { label: "Plantas", value: plantas },
    { label: "Especies", value: especies },
    { label: "Raras", value: raras },
  ];

  const entradasMapeadas = entradas.map((entrada) => ({
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
  }));

  const logros = calcularLogros(entradasMapeadas);
  const desafios = calcularDesafios(entradasMapeadas);

  return (
    <div className="flex min-h-dvh flex-col px-6 md:grid md:grid-cols-[320px_1fr] md:items-start md:gap-x-10 md:max-w-5xl md:mx-auto md:px-8 md:pt-12">
      <div className="mt-16 mb-2 flex flex-col items-center md:col-start-1 md:row-start-1 md:mt-0">
        <p className="text-2xl font-bold text-primary">{usuario.name}</p>
        <p className="mb-4 text-sm text-muted">{usuario.email}</p>
      </div>

      <div className="md:col-start-1 md:row-start-2">
        <EditarPerfil
          avatarUrl={usuario.avatarUrl}
          bio={usuario.bio}
          ubicacionTexto={usuario.ubicacionTexto}
          compartirPerfil={usuario.compartirPerfil}
        />
      </div>

      <div className="mb-6 flex gap-3 md:col-start-1 md:row-start-3">
        {estadisticas.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-1 flex-col items-center rounded-xl border border-accent bg-surface p-3"
          >
            <p className="text-xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="md:col-start-2 md:row-start-1">
        <p className="mb-3 text-sm font-bold text-primary">Logros</p>
        <div className="mb-6 grid grid-cols-3 gap-2">
          {logros.map((logro) => (
            <div
              key={logro.id}
              title={logro.descripcion}
              className={`flex flex-col items-center rounded-xl border p-2 text-center ${
                logro.desbloqueado
                  ? "border-accent bg-surface"
                  : "border-accent/40 bg-surface/40 opacity-50"
              }`}
            >
              <span className="text-2xl">{logro.emoji}</span>
              <p className="mt-1 text-[10px] font-semibold text-text">{logro.nombre}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-start-2 md:row-start-2">
        <p className="mb-3 text-sm font-bold text-primary">🍂 Desafíos de {nombreTemporada()}</p>
        <div className="mb-6 flex flex-col gap-2">
          {desafios.map((desafio) => (
            <div
              key={desafio.id}
              className={`rounded-xl border p-3 ${
                desafio.completado ? "border-primary bg-primary/10" : "border-accent bg-surface"
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-text">
                  {desafio.emoji} {desafio.nombre}
                </p>
                <p className="shrink-0 text-xs font-bold text-primary">
                  {desafio.progreso}/{desafio.meta}
                </p>
              </div>
              <p className="mb-2 text-xs text-muted">{desafio.descripcion}</p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent/30">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, (desafio.progreso / desafio.meta) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-start-1 md:row-start-4">
        <ToggleColeccionPrivada valorInicial={coleccionPrivada} />
      </div>

      {usuario.esAdmin && (
        <Link
          href="/admin"
          className="mb-4 block rounded-xl border border-accent py-3 text-center font-semibold text-primary md:col-start-1 md:row-start-5"
        >
          Panel de administración
        </Link>
      )}

      <div className="mt-auto md:col-start-1 md:row-start-6 md:mt-0">
        <BotonSalir />
      </div>

      <div className="md:col-span-2 md:row-start-7">
        <CreditoIasmtech />
      </div>
    </div>
  );
}
