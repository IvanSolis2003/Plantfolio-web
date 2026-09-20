import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const plantas = await prisma.plant.findMany({ orderBy: { commonName: "asc" } });
  return NextResponse.json({ success: true, data: plantas });
}
