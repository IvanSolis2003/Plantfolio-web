import type { CollectionEntry } from "@/types";

const ENCABEZADOS = [
  "scientificName",
  "vernacularName",
  "eventDate",
  "decimalLatitude",
  "decimalLongitude",
  "locality",
  "recordedBy",
  "occurrenceRemarks",
  "associatedMedia",
  "establishmentMeans",
];

function celda(valor: unknown): string {
  return `"${String(valor ?? "").replace(/"/g, '""')}"`;
}

export function exportarAlbumComoCsv(entradas: CollectionEntry[], nombreUsuario: string) {
  const filas = entradas.map((entrada) => [
    entrada.plant.scientificName,
    entrada.plant.commonName,
    new Date(entrada.identifiedAt).toISOString().split("T")[0],
    entrada.latitude ?? "",
    entrada.longitude ?? "",
    entrada.ubicacionAprox ?? "",
    nombreUsuario,
    entrada.notes ?? "",
    entrada.photos.join("|"),
    entrada.plant.nativeToChile ? "native" : "",
  ]);

  const csv = [ENCABEZADOS, ...filas].map((fila) => fila.map(celda).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "plantfolio-avistamientos.csv";
  enlace.click();
  URL.revokeObjectURL(url);
}
