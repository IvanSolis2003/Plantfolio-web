import { reenviarConToken } from "@/lib/proxyApi";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return reenviarConToken(`/api/album/${id}`, { method: "DELETE" });
}
