import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { crearSesion } from "@/lib/sesion";

export async function POST(req: NextRequest) {
  const { name, email, password } = (await req.json()) as {
    name: string;
    email: string;
    password: string;
  };

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json({ success: false, error: "El correo ya está registrado" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const usuario = await prisma.user.create({ data: { name, email, password: hashed } });

  await crearSesion(usuario.id);

  return NextResponse.json(
    {
      success: true,
      data: { id: usuario.id, email: usuario.email, name: usuario.name, createdAt: usuario.createdAt },
    },
    { status: 201 }
  );
}
