import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { crearSesion } from "@/lib/sesion";

export async function POST(req: NextRequest) {
  const { email, password } = (await req.json()) as { email: string; password: string };

  const usuario = await prisma.user.findUnique({ where: { email } });
  if (!usuario) {
    return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 });
  }

  const valido = await bcrypt.compare(password, usuario.password);
  if (!valido) {
    return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 });
  }

  await crearSesion(usuario.id);

  return NextResponse.json({
    success: true,
    data: { id: usuario.id, email: usuario.email, name: usuario.name, createdAt: usuario.createdAt },
  });
}
