import { Rarity } from "@prisma/client";

interface ResultadoIdentificacion {
  scientificName: string;
  commonName: string;
  confidence: number;
  family?: string;
  rarity: Rarity;
  nativeToChile: boolean;
  rawResponse: unknown;
}

function mapearConfianzaARareza(confidence: number): Rarity {
  if (confidence >= 0.95) return "CASI_EXTINTA";
  if (confidence >= 0.85) return "PROTEGIDA";
  if (confidence >= 0.75) return "ENDEMICA";
  if (confidence >= 0.6) return "POCO_COMUN";
  return "COMUN";
}

export async function identificarPlanta(base64: string): Promise<ResultadoIdentificacion> {
  const datos = base64.includes(",") ? base64.split(",")[1] : base64;
  const buffer = Buffer.from(datos, "base64");

  const formData = new FormData();
  formData.append("images", new Blob([buffer], { type: "image/jpeg" }), "foto.jpg");
  formData.append("organs", "auto");

  const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_API_KEY}`;
  const respuesta = await fetch(url, { method: "POST", body: formData });

  if (!respuesta.ok) {
    throw new Error("No se pudo identificar la planta");
  }

  const data = await respuesta.json();
  const resultado = data?.results?.[0];
  if (!resultado) {
    throw new Error("No se pudo identificar la planta");
  }

  const confidence: number = resultado.score ?? 0;
  const scientificName: string = resultado.species?.scientificNameWithoutAuthor ?? "Desconocida";
  const commonName: string = resultado.species?.commonNames?.[0] ?? scientificName;
  const family: string | undefined = resultado.species?.family?.scientificNameWithoutAuthor;

  return {
    scientificName,
    commonName,
    confidence,
    family,
    rarity: mapearConfianzaARareza(confidence),
    nativeToChile: false,
    rawResponse: data,
  };
}
