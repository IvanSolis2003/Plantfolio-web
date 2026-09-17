import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { baseDeLaApp, nuevoToken, vencimiento } from "@/lib/cuentas";
import { enviarCorreo, plantillaVerificacion } from "@/lib/correo";
import { parsearBody } from "@/lib/validar";

const MENSAJE_OK =
  "Cuenta creada. Revisa tu correo (incluida la carpeta de spam) para confirmarlo.";

const registroSchema = z.object({
  name: z.string({ error: "El nombre es requerido" }).trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string({ error: "El correo es requerido" }).trim().toLowerCase().email("Correo inválido"),
  password: z.string({ error: "La contraseña es requerida" }).min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(req: NextRequest) {
  const validacion = await parsearBody(req, registroSchema);
  if ("error" in validacion) return validacion.error;

  const { name, email, password } = validacion.data;

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
