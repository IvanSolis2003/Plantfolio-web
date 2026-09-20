import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { crearSesion } from "@/lib/sesion";
import { estadoDe, MENSAJE_POR_ESTADO } from "@/lib/cuentas";
import { parsearBody } from "@/lib/validar";

const loginSchema = z.object({
  email: z.string({ error: "El correo es requerido" }).trim().toLowerCase().email("Correo inválido"),
  password: z.string({ error: "La contraseña es requerida" }).min(1, "La contraseña es requerida"),
});

export async function POST(req: NextRequest) {
  const validacion = await parsearBody(req, loginSchema);
  if ("error" in validacion) return validacion.error;

  const { email, password } = validacion.data;

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
    return NextResponse.json(
      { success: false, error: MENSAJE_POR_ESTADO[estado], estado },
      { status: 403 }
    );
  }

  await crearSesion(usuario.id);

  return NextResponse.json({
    success: true,
    data: { id: usuario.id, email: usuario.email, name: usuario.name, createdAt: usuario.createdAt },
  });
}
