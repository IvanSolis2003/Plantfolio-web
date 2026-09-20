import type { CollectionEntry } from "@/types";

export interface Desafio {
  id: string;
  emoji: string;
  nombre: string;
  descripcion: string;
  progreso: number;
  meta: number;
  completado: boolean;
}

const RAREZAS_DESTACADAS = ["POCO_COMUN", "ENDEMICA", "PROTEGIDA", "CASI_EXTINTA"];

export function nombreTemporada(fecha: Date = new Date()): string {
  const mes = fecha.getMonth();
  if (mes === 11 || mes === 0 || mes === 1) return "Verano";
  if (mes >= 2 && mes <= 4) return "Otoño";
  if (mes >= 5 && mes <= 7) return "Invierno";
  return "Primavera";
}

export function inicioTemporada(fecha: Date = new Date()): Date {
  const mes = fecha.getMonth();
  const anio = fecha.getFullYear();
  if (mes === 11) return new Date(anio, 11, 1);
  if (mes === 0 || mes === 1) return new Date(anio - 1, 11, 1);
  if (mes >= 2 && mes <= 4) return new Date(anio, 2, 1);
  if (mes >= 5 && mes <= 7) return new Date(anio, 5, 1);
  return new Date(anio, 8, 1);
}

export function calcularDesafios(entradas: CollectionEntry[]): Desafio[] {
  const inicio = inicioTemporada();
  const entradasTemporada = entradas.filter((e) => new Date(e.identifiedAt) >= inicio);

  const nuevas = entradasTemporada.length;
  const nativas = entradasTemporada.filter((e) => e.plant.nativeToChile).length;
  const destacadas = entradasTemporada.filter((e) =>
    RAREZAS_DESTACADAS.includes(e.plant.rarity)
  ).length;

  return [
    {
      id: "racha-temporada",
      emoji: "🌱",
      nombre: "Racha de temporada",
      descripcion: "Identificá 3 plantas esta temporada",
      progreso: Math.min(nuevas, 3),
      meta: 3,
      completado: nuevas >= 3,
    },
    {
      id: "nativa-temporada",
      emoji: "🇨🇱",
      nombre: "Nativa de temporada",
      descripcion: "Encontrá una especie nativa de Chile esta temporada",
      progreso: Math.min(nativas, 1),
      meta: 1,
      completado: nativas >= 1,
    },
    {
      id: "rareza-temporada",
      emoji: "✨",
      nombre: "Rareza de temporada",
      descripcion: "Encontrá una especie poco común, endémica, protegida o casi extinta esta temporada",
      progreso: Math.min(destacadas, 1),
      meta: 1,
      completado: destacadas >= 1,
    },
  ];
}
