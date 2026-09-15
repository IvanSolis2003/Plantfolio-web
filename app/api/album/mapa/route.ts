import { reenviarConToken } from "@/lib/proxyApi";

export async function GET() {
  return reenviarConToken("/api/album/map");
}
