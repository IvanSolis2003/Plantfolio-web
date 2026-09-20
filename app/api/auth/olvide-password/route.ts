import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { baseDeLaApp, nuevoToken, vencimiento } from "@/lib/cuentas";
import { enviarCorreo, plantillaRecuperacion } from "@/lib/correo";
import { parsearBody } from "@/lib/validar";

const MENSAJE_GENERICO = "Si el correo existe, te enviamos un enlace para restablecer tu contraseña.";

const olvideSchema = z.object({
  email: z.string({ error: "El correo es requerido" }).trim().toLowerCase().email("Correo inválido"),
});

export async function POST(req: NextRequest) {
  const validacion = await parsearBody(req, olvideSchema);
  if ("error" in validacion) return validacion.error;

  const { email } = validacion.data;

  const usuario = await prisma.user.findUnique({ where: { email } });

  if (!usuario) {
    return NextResponse.json({ success: true, data: { mensaje: MENSAJE_GENERICO } });
  }

  const tokenReciente =
    usuario.tokenResetExpira !== null &&
    usuario.tokenResetExpira.getTime() - Date.now() > 23 * 60 * 60 * 1000;

  if (tokenReciente) {
    return NextResponse.json({
      success: true,
      data: { mensaje: "Ya te mandamos un correo hace instantes. Revisá tu bandeja (y la carpeta de spam)." },
    });
  }

  const token = nuevoToken();
  await prisma.user.update({
    where: { id: usuario.id },
    data: { tokenReset: token, tokenResetExpira: vencimiento() },
  });

  const enlace = `${baseDeLaApp()}/restablecer?token=${token}`;
  const envio = await enviarCorreo(email, "Recuperar contraseña de Plantfolio", plantillaRecuperacion(enlace));

  if (!envio.ok) {
    return NextResponse.json(
      { success: false, error: `No pudimos enviarte el correo: ${envio.error}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: { mensaje: MENSAJE_GENERICO } });
}
