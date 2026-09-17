import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

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
