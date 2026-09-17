import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioId } from "@/lib/sesion";
import { enviarCorreo, plantillaAprobacion } from "@/lib/correo";
import { parsearBody } from "@/lib/validar";

const aprobarSchema = z.object({
  id: z.string({ error: "id requerido" }).min(1, "id requerido"),
});

export async function POST(req: NextRequest) {
  const userId = await obtenerUsuarioId();
  if (!userId) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const yo = await prisma.user.findUnique({ where: { id: userId }, select: { esAdmin: true } });
  if (!yo?.esAdmin) {
    return NextResponse.json({ success: false, error: "Solo un administrador puede hacer esto" }, { status: 403 });
  }

  const validacion = await parsearBody(req, aprobarSchema);
  if ("error" in validacion) return validacion.error;

  const { id } = validacion.data;
  const cuenta = await prisma.user.findUnique({
    where: { id },
    select: { email: true, emailVerificado: true, aprobado: true },
  });

  if (!cuenta) {
    return NextResponse.json({ success: false, error: "Esa cuenta ya no existe" }, { status: 404 });
  }

  if (!cuenta.emailVerificado) {
    return NextResponse.json(
      { success: false, error: "Esa cuenta todavía no confirmó su correo" },
      { status: 409 }
    );
  }

  if (cuenta.aprobado) {
    return NextResponse.json({ success: true, data: { aviso: `${cuenta.email} ya estaba habilitada.` } });
  }

  await prisma.user.update({ where: { id }, data: { aprobado: true } });
  const envio = await enviarCorreo(cuenta.email, "Tu cuenta de Plantfolio está lista", plantillaAprobacion());

  return NextResponse.json({
    success: true,
    data: {
      aviso: envio.ok
        ? `${cuenta.email} habilitada y avisada por correo.`
        : `${cuenta.email} habilitada, pero no pudimos avisarle: ${envio.error}`,
    },
  });
}
