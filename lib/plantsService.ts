import type { ApiResponse, CollectionEntry, IdentifyResult, Plant } from "@/types";

export async function getPlants(filters?: {
  rarity?: string;
  nativeToChile?: boolean;
  search?: string;
}): Promise<Plant[]> {
  const params = new URLSearchParams(
    Object.entries(filters ?? {}).reduce<Record<string, string>>((acc, [clave, valor]) => {
      if (valor !== undefined) acc[clave] = String(valor);
      return acc;
    }, {})
  );

  const respuesta = await fetch(`/api/plants?${params}`);
  const data: ApiResponse<Plant[]> = await respuesta.json();
  if (!data.success || !data.data) throw new Error(data.error ?? "Error al obtener plantas");
  return data.data;
}

export async function getPlantById(id: string): Promise<Plant> {
  const respuesta = await fetch(`/api/plants/${id}`);
  const data: ApiResponse<Plant> = await respuesta.json();
  if (!data.success || !data.data) throw new Error(data.error ?? "Planta no encontrada");
  return data.data;
}

export async function identifyPlant(base64Image: string): Promise<IdentifyResult> {
  const respuesta = await fetch("/api/identify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64Image }),
  });
  const data: ApiResponse<IdentifyResult> = await respuesta.json();
  if (!data.success || !data.data) throw new Error(data.error ?? "Error al identificar planta");
  return data.data;
}

export async function getAlbum(): Promise<CollectionEntry[]> {
  const respuesta = await fetch("/api/album");
  const data: ApiResponse<CollectionEntry[]> = await respuesta.json();
  if (!data.success || !data.data) throw new Error(data.error ?? "Error al obtener álbum");
  return data.data;
}

export async function addToAlbum(input: {
  plantId: string;
  photoBase64: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}): Promise<CollectionEntry> {
  const respuesta = await fetch("/api/album", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data: ApiResponse<CollectionEntry> = await respuesta.json();
  if (!data.success || !data.data) throw new Error(data.error ?? "Error al guardar en álbum");
  return data.data;
}

export async function deleteFromAlbum(entryId: string): Promise<void> {
  const respuesta = await fetch(`/api/album/${entryId}`, { method: "DELETE" });
  const data: ApiResponse<null> = await respuesta.json();
  if (!data.success) throw new Error(data.error ?? "Error al eliminar entrada");
}

export async function getMapEntries(): Promise<CollectionEntry[]> {
  const respuesta = await fetch("/api/album/mapa");
  const data: ApiResponse<CollectionEntry[]> = await respuesta.json();
  if (!data.success || !data.data) throw new Error(data.error ?? "Error al obtener mapa");
  return data.data;
}
