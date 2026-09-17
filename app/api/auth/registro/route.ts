import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { baseDeLaApp, nuevoToken, vencimiento } from "@/lib/cuentas";
import { enviarCorreo, plantillaVerificacion } from "@/lib/correo";

const MENSAJE_OK =
  "Cuenta creada. Revisa tu correo (incluida la carpeta de spam) para confirmarlo.";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { name: string; email: string; password: string };
  const name = body.name.trim();
  const email = body.email.trim().toLowerCase();
  const { password } = body;

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json({ success: false, error: "El correo ya está registrado" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const token = nuevoToken();

  const usuario = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      tokenVerificacion: token,
      tokenExpira: vencimiento(),
    },
  });

  const enlace = `${baseDeLaApp()}/verificar?token=${token}`;
  const envio = await enviarCorreo(email, "Confirma tu correo en Plantfolio", plantillaVerificacion(enlace));

  if (!envio.ok) {
    return NextResponse.json(
      { success: false, error: `Creamos tu cuenta pero no pudimos enviarte el correo: ${envio.error}` },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, data: { id: usuario.id, mensaje: MENSAJE_OK } },
    { status: 201 }
  );
}
