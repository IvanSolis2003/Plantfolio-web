import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const FLORA_CHILENA = [
  {
    scientificName: "Lapageria rosea",
    commonName: "Copihue",
    family: "Philesiaceae",
    description: "Flor nacional de Chile, endémica del bosque templado del sur.",
    rarity: "PROTEGIDA" as const,
  },
  {
    scientificName: "Araucaria araucana",
    commonName: "Pehuén (Araucaria)",
    family: "Araucariaceae",
    description: "Conífera longeva sagrada para el pueblo mapuche-pehuenche, en peligro por la pérdida de hábitat.",
    rarity: "CASI_EXTINTA" as const,
  },
  {
    scientificName: "Fitzroya cupressoides",
    commonName: "Alerce",
    family: "Cupressaceae",
    description: "Una de las especies de árbol más longevas del mundo, protegida por ley desde 1976.",
    rarity: "CASI_EXTINTA" as const,
  },
  {
    scientificName: "Jubaea chilensis",
    commonName: "Palma chilena",
    family: "Arecaceae",
    description: "Palmera endémica de Chile central, la más austral del mundo entre las palmas.",
    rarity: "PROTEGIDA" as const,
  },
  {
    scientificName: "Puya chilensis",
    commonName: "Chagual",
    family: "Bromeliaceae",
    description: "Bromelia terrestre endémica de las zonas semiáridas de Chile central.",
    rarity: "POCO_COMUN" as const,
  },
  {
    scientificName: "Crinodendron hookerianum",
    commonName: "Chaquihue",
    family: "Elaeocarpaceae",
    description: "Arbusto de flores rojas colgantes en forma de farol, nativo del sur de Chile.",
    rarity: "POCO_COMUN" as const,
  },
  {
    scientificName: "Nothofagus obliqua",
    commonName: "Roble chileno",
    family: "Nothofagaceae",
    description: "Árbol caducifolio nativo, común en los bosques templados del centro-sur.",
    rarity: "COMUN" as const,
  },
  {
    scientificName: "Nothofagus dombeyi",
    commonName: "Coihue",
    family: "Nothofagaceae",
    description: "Árbol siempreverde nativo de los bosques húmedos del sur de Chile.",
    rarity: "COMUN" as const,
  },
  {
    scientificName: "Embothrium coccineum",
    commonName: "Notro (Ciruelillo)",
    family: "Proteaceae",
    description: "Arbusto o árbol pequeño de flores rojas llamativas, nativo del sur de Sudamérica.",
    rarity: "COMUN" as const,
  },
  {
    scientificName: "Aristotelia chilensis",
    commonName: "Maqui",
    family: "Elaeocarpaceae",
    description: "Arbusto nativo cuyo fruto es apreciado por su alto contenido de antioxidantes.",
    rarity: "COMUN" as const,
  },
  {
    scientificName: "Drimys winteri",
    commonName: "Canelo",
    family: "Winteraceae",
    description: "Árbol sagrado para el pueblo mapuche, símbolo de paz y justicia.",
    rarity: "COMUN" as const,
  },
  {
    scientificName: "Gunnera tinctoria",
    commonName: "Nalca (Pangue)",
    family: "Gunneraceae",
    description: "Planta herbácea de grandes hojas, nativa de las zonas húmedas del sur.",
    rarity: "COMUN" as const,
  },
  {
    scientificName: "Berberis microphylla",
    commonName: "Calafate",
    family: "Berberidaceae",
    description: "Arbusto espinoso de la Patagonia, conocido por su fruto comestible.",
    rarity: "COMUN" as const,
  },
  {
    scientificName: "Chusquea culeou",
    commonName: "Colihue",
    family: "Poaceae",
    description: "Bambú nativo de los bosques templados del sur de Chile y Argentina.",
    rarity: "COMUN" as const,
  },
  {
    scientificName: "Prosopis chilensis",
    commonName: "Algarrobo chileno",
    family: "Fabaceae",
    description: "Árbol adaptado a zonas áridas del norte y centro de Chile.",
    rarity: "POCO_COMUN" as const,
  },
  {
    scientificName: "Beilschmiedia berteroana",
    commonName: "Belloto del sur",
    family: "Lauraceae",
    description: "Árbol endémico en peligro de extinción, remanente de bosques relictos.",
    rarity: "CASI_EXTINTA" as const,
  },
  {
    scientificName: "Legrandia concinna",
    commonName: "Luma del norte",
    family: "Myrtaceae",
    description: "Árbol endémico y en peligro crítico, con muy pocas poblaciones conocidas.",
    rarity: "CASI_EXTINTA" as const,
  },
  {
    scientificName: "Eucryphia cordifolia",
    commonName: "Ulmo",
    family: "Cunoniaceae",
    description: "Árbol nativo cuya flor es la principal fuente de la miel de ulmo.",
    rarity: "COMUN" as const,
  },
];

async function main() {
  for (const planta of FLORA_CHILENA) {
    await prisma.plant.upsert({
      where: { scientificName: planta.scientificName },
      update: {},
      create: { ...planta, nativeToChile: true },
    });
  }
  console.log(`Sembradas ${FLORA_CHILENA.length} especies de flora chilena.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
