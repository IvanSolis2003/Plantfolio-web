import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./prisma";
import type { User } from "@/types";

const NOMBRE_COOKIE = "plantfolio_sesion";
const DURACION_DIAS = 7;

function huella(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function datosPublicos(usuario: {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  esAdmin: boolean;
  bio: string | null;
  avatarUrl: string | null;
  ubicacionTexto: string | null;
  compartirPerfil: boolean;
}): User {
  return {
    id: usuario.id,
    email: usuario.email,
    name: usuario.name,
    createdAt: usuario.createdAt.toISOString(),
    esAdmin: usuario.esAdmin,
    bio: usuario.bio ?? undefined,
    avatarUrl: usuario.avatarUrl ?? undefined,
    ubicacionTexto: usuario.ubicacionTexto ?? undefined,
    compartirPerfil: usuario.compartirPerfil,
  };
}

export async function crearSesion(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiraEn = new Date(Date.now() + DURACION_DIAS * 24 * 60 * 60 * 1000);

  await prisma.authSession.deleteMany({ where: { userId, expiraEn: { lt: new Date() } } });
  await prisma.authSession.create({ data: { id: huella(token), userId, expiraEn } });

  const almacen = await cookies();
  almacen.set(NOMBRE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_DIAS * 24 * 60 * 60,
  });
}

export async function cerrarSesion(): Promise<void> {
  const almacen = await cookies();
  const token = almacen.get(NOMBRE_COOKIE)?.value;

  if (token) {
    await prisma.authSession.deleteMany({ where: { id: huella(token) } });
  }
  almacen.delete(NOMBRE_COOKIE);
}

export async function obtenerUsuarioId(): Promise<string | null> {
  const almacen = await cookies();
  const token = almacen.get(NOMBRE_COOKIE)?.value;
  if (!token) return null;

  const sesion = await prisma.authSession.findUnique({
    where: { id: huella(token) },
    select: { userId: true, expiraEn: true },
  });

  if (!sesion) return null;

  if (sesion.expiraEn.getTime() <= Date.now()) {
    await prisma.authSession.deleteMany({ where: { id: huella(token) } });
    return null;
  }

  return sesion.userId;
}

export async function obtenerUsuarioServidor(): Promise<User | null> {
  const userId = await obtenerUsuarioId();
  if (!userId) return null;

  const usuario = await prisma.user.findUnique({ where: { id: userId } });
  return usuario ? datosPublicos(usuario) : null;
}
