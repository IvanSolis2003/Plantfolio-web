import type { CollectionEntry } from "@/types";

export interface Logro {
  id: string;
  emoji: string;
  nombre: string;
  descripcion: string;
  desbloqueado: boolean;
}

export function calcularLogros(entradas: CollectionEntry[]): Logro[] {
  const plantas = entradas.length;
  const especies = new Set(entradas.map((e) => e.plantId)).size;
  const tieneRara = entradas.some((e) => e.plant.rarity !== "COMUN");
  const tieneProtegida = entradas.some(
    (e) => e.plant.rarity === "PROTEGIDA" || e.plant.rarity === "CASI_EXTINTA"
  );
  const tieneUbicacion = entradas.some((e) => e.latitude != null && e.longitude != null);

  return [
    {
      id: "primera-planta",
      emoji: "🌱",
      nombre: "Primera planta",
      descripcion: "Identifica tu primera planta",
      desbloqueado: plantas >= 1,
    },
    {
      id: "coleccionista",
      emoji: "📗",
      nombre: "Coleccionista",
      descripcion: "Junta 10 plantas en tu álbum",
      desbloqueado: plantas >= 10,
    },
    {
      id: "botanico",
      emoji: "🔬",
      nombre: "Botánico",
      descripcion: "Junta 25 plantas en tu álbum",
      desbloqueado: plantas >= 25,
    },
    {
      id: "explorador",
      emoji: "🧭",
      nombre: "Explorador",
      descripcion: "Identifica 5 especies distintas",
      desbloqueado: especies >= 5,
    },
    {
      id: "cazador-rarezas",
      emoji: "✨",
      nombre: "Cazador de rarezas",
      descripcion: "Encuentra una planta que no sea común",
      desbloqueado: tieneRara,
    },
    {
      id: "guardian",
      emoji: "🛡️",
      nombre: "Guardián",
      descripcion: "Encuentra una planta protegida o casi extinta",
      desbloqueado: tieneProtegida,
    },
    {
      id: "fotografo-de-campo",
      emoji: "📍",
      nombre: "Fotógrafo de campo",
      descripcion: "Guarda un hallazgo con ubicación",
      desbloqueado: tieneUbicacion,
    },
  ];
}
