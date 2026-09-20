import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { tokenVigente } from "@/lib/cuentas";
import { parsearBody } from "@/lib/validar";

const restablecerSchema = z.object({
  token: z.string({ error: "Token requerido" }).regex(/^[0-9a-f]{64}$/, "Token inválido"),
  password: z.string({ error: "La contraseña es requerida" }).min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(req: NextRequest) {
  const validacion = await parsearBody(req, restablecerSchema);
  if ("error" in validacion) return validacion.error;

  const { token, password } = validacion.data;

  const usuario = await prisma.user.findUnique({ where: { tokenReset: token } });

  if (!usuario || !tokenVigente(usuario.tokenResetExpira)) {
    return NextResponse.json(
      { success: false, error: "El enlace no es válido o venció. Pedí uno nuevo." },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: usuario.id },
      data: { password: hashed, tokenReset: null, tokenResetExpira: null },
    }),
    prisma.authSession.deleteMany({ where: { userId: usuario.id } }),
  ]);

  return NextResponse.json({ success: true, data: null });
}
