import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioId } from "@/lib/sesion";
import { estadoDe } from "@/lib/cuentas";
import BotonAprobar from "./BotonAprobar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cuentas — Plantfolio",
};

const ETIQUETA_ESTADO: Record<string, string> = {
  "sin-verificar": "Sin verificar",
  "esperando-aprobacion": "Esperando aprobación",
  lista: "Habilitada",
};

export default async function AdminPage() {
  const userId = await obtenerUsuarioId();
  if (!userId) redirect("/entrar");

  const yo = await prisma.user.findUnique({ where: { id: userId }, select: { esAdmin: true } });
  if (!yo?.esAdmin) notFound();

  const usuarios = await prisma.user.findMany({
    orderBy: [{ aprobado: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      emailVerificado: true,
      aprobado: true,
      esAdmin: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-dvh px-5 pt-12 pb-6">
      <p className="mb-1 text-xl font-bold text-primary">Cuentas</p>
      <p className="mb-4 text-sm text-muted">
        {usuarios.length} {usuarios.length === 1 ? "cuenta registrada" : "cuentas registradas"}
      </p>

      <div className="flex flex-col gap-2">
        {usuarios.map((usuario) => {
          const estado = estadoDe(usuario);
          return (
            <div
              key={usuario.id}
              className="flex items-center justify-between rounded-xl border border-accent bg-surface p-3"
            >
              <div>
                <p className="text-sm font-bold text-text">
                  {usuario.name} {usuario.esAdmin && "👑"}
                </p>
                <p className="text-xs text-muted">{usuario.email}</p>
                <p className="text-xs text-muted">{ETIQUETA_ESTADO[estado]}</p>
              </div>
              {estado === "esperando-aprobacion" && <BotonAprobar id={usuario.id} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
