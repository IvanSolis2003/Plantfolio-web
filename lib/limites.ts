import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";

export type Limite = { maximo: number; minutos: number };

export const LIMITES = {
  entrarPorCorreo: { maximo: 8, minutos: 15 },
  entrarPorIp: { maximo: 30, minutos: 15 },
  registroPorIp: { maximo: 5, minutos: 60 },
  recuperarPorCorreo: { maximo: 4, minutos: 60 },
  recuperarPorIp: { maximo: 10, minutos: 60 },
  identificarPorUsuario: { maximo: 30, minutos: 60 },
  subirFotoPorUsuario: { maximo: 30, minutos: 60 },
  avatarPorUsuario: { maximo: 10, minutos: 60 },
} as const satisfies Record<string, Limite>;

export const IP_DESCONOCIDA = "ip-desconocida";

export async function ipDelCliente(): Promise<string> {
  const cabeceras = await headers();
  const reenviada = cabeceras.get("x-forwarded-for");

  if (reenviada) {
    const primera = reenviada.split(",")[0]?.trim();
    if (primera) return primera;
  }

  return cabeceras.get("x-real-ip")?.trim() || IP_DESCONOCIDA;
}

function desde(limite: Limite): Date {
  return new Date(Date.now() - limite.minutos * 60 * 1000);
}

export async function anotarIntento(clave: string, limite: Limite): Promise<void> {
  await prisma.intento.deleteMany({
    where: { clave, createdAt: { lt: desde(limite) } },
  });

  await prisma.intento.create({ data: { clave } });
}

export async function contarIntentos(clave: string, limite: Limite): Promise<number> {
  return prisma.intento.count({
    where: { clave, createdAt: { gte: desde(limite) } },
  });
}

export async function seExcedio(clave: string, limite: Limite): Promise<boolean> {
  return (await contarIntentos(clave, limite)) >= limite.maximo;
}

export async function olvidarIntentos(clave: string): Promise<void> {
  await prisma.intento.deleteMany({ where: { clave } });
}

export function mensajeDeEspera(limite: Limite): string {
  const unidad = limite.minutos === 60 ? "una hora" : `${limite.minutos} minutos`;
  return `Demasiados intentos seguidos. Espera ${unidad} y vuelve a probar.`;
}

export function respuestaDeLimite(limite: Limite): NextResponse {
  return NextResponse.json(
    { success: false, error: mensajeDeEspera(limite) },
    { status: 429, headers: { "Retry-After": String(limite.minutos * 60) } }
  );
}

export async function limiteSuperado(clave: string, limite: Limite): Promise<NextResponse | null> {
  return (await seExcedio(clave, limite)) ? respuestaDeLimite(limite) : null;
}

export async function contarYLimitar(clave: string, limite: Limite): Promise<NextResponse | null> {
  const bloqueo = await limiteSuperado(clave, limite);
  if (bloqueo) return bloqueo;

  await anotarIntento(clave, limite);
  return null;
}
