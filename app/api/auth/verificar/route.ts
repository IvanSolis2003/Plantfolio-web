import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { huellaDeToken, tokenVigente } from "@/lib/cuentas";
import { parsearBody } from "@/lib/validar";

const verificarSchema = z.object({
  token: z.string({ error: "Token requerido" }).regex(/^[0-9a-f]{64}$/, "Token inválido"),
});

export async function POST(req: NextRequest) {
  const validacion = await parsearBody(req, verificarSchema);
  if ("error" in validacion) {
    return NextResponse.json({ success: true, data: { desenlace: "invalido" } });
  }

  const cuenta = await prisma.user.findUnique({
    where: { tokenVerificacion: huellaDeToken(validacion.data.token) },
    select: { id: true, emailVerificado: true, tokenExpira: true },
  });

  if (!cuenta) return NextResponse.json({ success: true, data: { desenlace: "invalido" } });
  if (cuenta.emailVerificado) return NextResponse.json({ success: true, data: { desenlace: "ya-estaba" } });
  if (!tokenVigente(cuenta.tokenExpira)) return NextResponse.json({ success: true, data: { desenlace: "vencido" } });

  await prisma.user.update({
    where: { id: cuenta.id },
    data: { emailVerificado: new Date(), tokenVerificacion: null, tokenExpira: null },
  });

  return NextResponse.json({ success: true, data: { desenlace: "ok" } });
}
