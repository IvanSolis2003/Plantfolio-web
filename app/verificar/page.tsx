import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { tokenVigente } from "@/lib/cuentas";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Confirmar correo — Plantfolio",
};

type Desenlace = "ok" | "ya-estaba" | "vencido" | "invalido";

async function verificar(token: string | undefined): Promise<Desenlace> {
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return "invalido";

  const cuenta = await prisma.user.findUnique({
    where: { tokenVerificacion: token },
    select: { id: true, emailVerificado: true, tokenExpira: true },
  });

  if (!cuenta) return "invalido";
  if (cuenta.emailVerificado) return "ya-estaba";
  if (!tokenVigente(cuenta.tokenExpira)) return "vencido";

  await prisma.user.update({
    where: { id: cuenta.id },
    data: { emailVerificado: new Date(), tokenVerificacion: null, tokenExpira: null },
  });

  return "ok";
}

const TEXTOS: Record<Desenlace, { titulo: string; texto: string }> = {
  ok: {
    titulo: "Correo confirmado",
    texto: "Gracias. Ahora falta que un administrador habilite tu cuenta. Te avisamos por correo cuando esté lista.",
  },
  "ya-estaba": {
    titulo: "Este correo ya estaba confirmado",
    texto: "No hace falta hacer nada más. Si todavía no puedes entrar, falta que un administrador habilite tu cuenta.",
  },
  vencido: {
    titulo: "El enlace venció",
    texto: "Los enlaces duran 24 horas. Andá a Entrar e intentá iniciar sesión con tu correo — ahí vas a poder pedir uno nuevo.",
  },
  invalido: {
    titulo: "Este enlace no sirve",
    texto: "Puede estar incompleto o ya haberse usado. Revisa que hayas copiado la dirección entera desde el correo.",
  },
};

export default async function VerificarPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const desenlace = await verificar(token);
  const { titulo, texto } = TEXTOS[desenlace];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="mb-3 text-4xl">🌿</span>
      <p className="mb-2 text-xl font-bold text-primary">{titulo}</p>
      <p className="mb-6 text-sm text-muted">{texto}</p>
      <Link href="/entrar" className="rounded-xl bg-primary px-6 py-3 font-bold text-white">
        Ir a entrar
      </Link>
    </div>
  );
}
