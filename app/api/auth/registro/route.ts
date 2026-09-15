import { NextRequest, NextResponse } from "next/server";
import { setCookieSesion } from "@/lib/sesion";
import type { ApiResponse, AuthTokens } from "@/types";

const API_URL = process.env.PLANTFOLIO_API_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const respuesta = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const data: ApiResponse<AuthTokens> = await respuesta.json();

  if (data.success && data.data?.token) {
    await setCookieSesion(data.data.token);
  }

  return NextResponse.json(data, { status: respuesta.status });
}
