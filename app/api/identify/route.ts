import { NextRequest } from "next/server";
import { reenviarConToken } from "@/lib/proxyApi";

export async function POST(req: NextRequest) {
  const body = await req.text();
  return reenviarConToken("/api/identify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
