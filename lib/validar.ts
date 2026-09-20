import { NextResponse } from "next/server";
import { z } from "zod";
import type { ZodSchema } from "zod";

const MAX_CARACTERES_IMAGEN = 8_000_000;

export const imagenSchema = z
  .string({ error: "Imagen requerida" })
  .min(1, "Imagen requerida")
  .max(MAX_CARACTERES_IMAGEN, "La imagen es demasiado grande");

export async function parsearBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  const body = await req.json().catch(() => null);
  const resultado = schema.safeParse(body);

  if (!resultado.success) {
    return {
      error: NextResponse.json(
        { success: false, error: resultado.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      ),
    };
  }

  return { data: resultado.data };
}
