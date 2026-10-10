import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { crearSesion } from "@/lib/sesion";
import { estadoDe, MENSAJE_POR_ESTADO } from "@/lib/cuentas";
import { parsearBody } from "@/lib/validar";
import { LIMITES, anotarIntento, ipDelCliente, limiteSuperado, olvidarIntentos } from "@/lib/limites";

const HASH_SIN_USUARIO = "$2b$10$Pc5h7DsaxKvVzQQP.TQu8uRA2/lp4stBzNYntzeQV6N77xxoO9HLq";

const loginSchema = z.object({
  email: z.string({ error: "El correo es requerido" }).trim().toLowerCase().email("Correo inválido"),
  password: z.string({ error: "La contraseña es requerida" }).min(1, "La contraseña es requerida"),
});

export async function POST(req: NextRequest) {
  const validacion = await parsearBody(req, loginSchema);
  if ("error" in validacion) return validacion.error;

  const { email, password } = validacion.data;

  const porCorreo = `entrar:correo:${email}`;
  const porIp = `entrar:ip:${await ipDelCliente()}`;

  const bloqueo =
    (await limiteSuperado(porCorreo, LIMITES.entrarPorCorreo)) ??
    (await limiteSuperado(porIp, LIMITES.entrarPorIp));
  if (bloqueo) return bloqueo;

  const usuario = await prisma.user.findUnique({ where: { email } });
  const coincide = await bcrypt.compare(password, usuario?.password ?? HASH_SIN_USUARIO);
  const valido = usuario !== null && coincide;

  if (!usuario || !valido) {
    await anotarIntento(porCorreo, LIMITES.entrarPorCorreo);
    await anotarIntento(porIp, LIMITES.entrarPorIp);
    return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 });
  }

  await olvidarIntentos(porCorreo);

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
