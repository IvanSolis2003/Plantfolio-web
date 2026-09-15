import { NextRequest } from "next/server";
import { reenviarConToken } from "@/lib/proxyApi";

export async function GET(req: NextRequest) {
  const { search } = new URL(req.url);
  return reenviarConToken(`/api/plants${search}`);
}
