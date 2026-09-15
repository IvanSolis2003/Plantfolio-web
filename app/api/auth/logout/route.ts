import { NextResponse } from "next/server";
import { borrarCookieSesion } from "@/lib/sesion";

export async function POST() {
  await borrarCookieSesion();
  return NextResponse.json({ success: true });
}
