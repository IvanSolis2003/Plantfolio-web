import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { crearSesion } from "@/lib/sesion";
import { estadoDe, MENSAJE_POR_ESTADO } from "@/lib/cuentas";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { email: string; password: string };
  const email = body.email.trim().toLowerCase();
  const { password } = body;

  const usuario = await prisma.user.findUnique({ where: { email } });
  if (!usuario) {
    return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 });
  }

  const valido = await bcrypt.compare(password, usuario.password);
  if (!valido) {
    return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 });
  }

  const estado = estadoDe(usuario);
  if (estado !== "lista") {
    return NextResponse.json({ success: false, error: MENSAJE_POR_ESTADO[estado] }, { status: 403 });
  }

  await crearSesion(usuario.id);

  return NextResponse.json({
    success: true,
    data: { id: usuario.id, email: usuario.email, name: usuario.name, createdAt: usuario.createdAt },
  });
}
