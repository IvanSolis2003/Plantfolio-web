import type { CollectionEntry } from "@/types";

const MS_POR_DIA = 1000 * 60 * 60 * 24;

export function diasDesdeUltimoRiego(entrada: CollectionEntry): number {
  const desde = entrada.lastWatered ?? entrada.identifiedAt;
  const ms = Date.now() - new Date(desde).getTime();
  return Math.floor(ms / MS_POR_DIA);
}

export function necesitaRiego(entrada: CollectionEntry): boolean {
  return diasDesdeUltimoRiego(entrada) >= entrada.plant.wateringFrequencyDays;
}
