import type { CollectionEntry, Plant } from "../types/index.ts";

export function crearPlanta(cambios: Partial<Plant> = {}): Plant {
  return {
    id: "planta-1",
    commonName: "Copihue",
    scientificName: "Lapageria rosea",
    rarity: "COMUN",
    nativeToChile: false,
    wateringFrequencyDays: 7,
    ...cambios,
  };
}

export function crearEntrada(cambios: Partial<CollectionEntry> = {}): CollectionEntry {
  return {
    id: "entrada-1",
    userId: "usuario-1",
    plantId: "planta-1",
    photos: ["https://example.com/foto.jpg"],
    photoDates: ["2026-01-01T00:00:00.000Z"],
    privado: false,
    identifiedAt: "2026-01-01T00:00:00.000Z",
    plant: crearPlanta(),
    ...cambios,
  };
}

export function haceDias(dias: number, desde: Date): string {
  return new Date(desde.getTime() - dias * 24 * 60 * 60 * 1000).toISOString();
}
