import { Rarity } from "@prisma/client";

export interface CandidatoIdentificacion {
  scientificName: string;
  commonName: string;
  confidence: number;
  family?: string;
  rarity: Rarity;
  nativeToChile: boolean;
}

const MAX_CANDIDATOS = 3;

function mapearConfianzaARareza(confidence: number): Rarity {
  if (confidence >= 0.95) return "CASI_EXTINTA";
  if (confidence >= 0.85) return "PROTEGIDA";
  if (confidence >= 0.75) return "ENDEMICA";
  if (confidence >= 0.6) return "POCO_COMUN";
  return "COMUN";
}

export async function identificarPlanta(
  base64: string
): Promise<{ candidatos: CandidatoIdentificacion[]; rawResponse: unknown }> {
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
  const resultados: unknown[] = data?.results ?? [];
  if (resultados.length === 0) {
    throw new Error("No se pudo identificar la planta");
  }

  const candidatos: CandidatoIdentificacion[] = resultados.slice(0, MAX_CANDIDATOS).map((r) => {
    const resultado = r as {
      score?: number;
      species?: {
        scientificNameWithoutAuthor?: string;
        commonNames?: string[];
        family?: { scientificNameWithoutAuthor?: string };
      };
    };
    const confidence = resultado.score ?? 0;
    const scientificName = resultado.species?.scientificNameWithoutAuthor ?? "Desconocida";

    return {
      scientificName,
      commonName: resultado.species?.commonNames?.[0] ?? scientificName,
      confidence,
      family: resultado.species?.family?.scientificNameWithoutAuthor,
      rarity: mapearConfianzaARareza(confidence),
      nativeToChile: false,
    };
  });

  return { candidatos, rawResponse: data };
}
