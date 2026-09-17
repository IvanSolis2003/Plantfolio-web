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
    careInstructions:
      "Prefiere sombra parcial y suelo húmedo pero bien drenado; en cultivo necesita un tutor para trepar y protección del viento fuerte.",
    diseases:
      "Susceptible a pudrición de raíz por exceso de riego y a cochinillas en los tallos jóvenes.",
  },
  {
    scientificName: "Araucaria araucana",
    commonName: "Pehuén (Araucaria)",
    family: "Araucariaceae",
    description: "Conífera longeva sagrada para el pueblo mapuche-pehuenche, en peligro por la pérdida de hábitat.",
    rarity: "CASI_EXTINTA" as const,
    careInstructions:
      "Necesita pleno sol y suelos volcánicos bien drenados; es de crecimiento extremadamente lento y muy resistente al frío, no conviene trasplantarla una vez adulta.",
    diseases:
      "Puede verse afectada por hongos que causan muerte de ramas (dieback); conviene evitar heridas en la corteza.",
  },
  {
    scientificName: "Fitzroya cupressoides",
    commonName: "Alerce",
    family: "Cupressaceae",
    description: "Una de las especies de árbol más longevas del mundo, protegida por ley desde 1976.",
    rarity: "CASI_EXTINTA" as const,
    careInstructions:
      "Prefiere climas húmedos y fríos con suelos ácidos bien drenados; crece muy lento y está protegido por ley, no se debe cortar ni extraer de su hábitat natural.",
    diseases:
      "Poco susceptible a plagas en estado silvestre; en cultivo puede sufrir pudrición de raíz si el suelo no drena bien.",
  },
  {
    scientificName: "Jubaea chilensis",
    commonName: "Palma chilena",
    family: "Arecaceae",
    description: "Palmera endémica de Chile central, la más austral del mundo entre las palmas.",
    rarity: "PROTEGIDA" as const,
    careInstructions:
      "Necesita pleno sol y tolera bien la sequía una vez establecida; riego moderado durante los primeros años de crecimiento.",
    diseases:
      "Puede ser atacada por insectos barrenadores que perforan el tronco; conviene revisar la corona periódicamente.",
  },
  {
    scientificName: "Puya chilensis",
    commonName: "Chagual",
    family: "Bromeliaceae",
    description: "Bromelia terrestre endémica de las zonas semiáridas de Chile central.",
    rarity: "POCO_COMUN" as const,
    careInstructions:
      "Pleno sol y suelo pobre y bien drenado; es muy resistente a la sequía y no requiere riego frecuente en cultivo.",
    diseases:
      "Rara vez presenta plagas; el exceso de humedad en la base puede pudrir la roseta.",
  },
  {
    scientificName: "Crinodendron hookerianum",
    commonName: "Chaquihue",
    family: "Elaeocarpaceae",
    description: "Arbusto de flores rojas colgantes en forma de farol, nativo del sur de Chile.",
    rarity: "POCO_COMUN" as const,
    careInstructions:
      "Prefiere sombra parcial, suelo ácido y húmedo; no tolera bien la sequía prolongada ni el sol directo intenso.",
    diseases:
      "Sensible a pulgones y a manchas foliares por hongos en ambientes muy húmedos y poco ventilados.",
  },
  {
    scientificName: "Nothofagus obliqua",
    commonName: "Roble chileno",
    family: "Nothofagaceae",
    description: "Árbol caducifolio nativo, común en los bosques templados del centro-sur.",
    rarity: "COMUN" as const,
    careInstructions:
      "Requiere suelos profundos y húmedos con buen drenaje; crece mejor con luz plena a semisombra en climas templados.",
    diseases:
      "Puede verse afectado por pulgones y por hongos causantes de manchas foliares.",
  },
  {
    scientificName: "Nothofagus dombeyi",
    commonName: "Coihue",
    family: "Nothofagaceae",
    description: "Árbol siempreverde nativo de los bosques húmedos del sur de Chile.",
    rarity: "COMUN" as const,
    careInstructions:
      "Prefiere suelos húmedos con buen drenaje; tolera la sombra cuando es joven pero necesita más luz al crecer.",
    diseases:
      "Susceptible a hongos defoliadores en temporadas muy lluviosas.",
  },
  {
    scientificName: "Embothrium coccineum",
    commonName: "Notro (Ciruelillo)",
    family: "Proteaceae",
    description: "Arbusto o árbol pequeño de flores rojas llamativas, nativo del sur de Sudamérica.",
    rarity: "COMUN" as const,
    careInstructions:
      "Sol pleno o semisombra, suelo húmedo y bien drenado; tolera suelos pobres pero no la sequía extrema.",
    diseases:
      "Puede presentar pulgones en brotes nuevos y manchas foliares por exceso de humedad.",
  },
  {
    scientificName: "Aristotelia chilensis",
    commonName: "Maqui",
    family: "Elaeocarpaceae",
    description: "Arbusto nativo cuyo fruto es apreciado por su alto contenido de antioxidantes.",
    rarity: "COMUN" as const,
    careInstructions:
      "Muy resistente y de fácil cultivo; se adapta a sol o sombra parcial y a distintos tipos de suelo con buen drenaje.",
    diseases:
      "Ocasionalmente afectado por pulgones y por oídio en climas húmedos.",
  },
  {
    scientificName: "Drimys winteri",
    commonName: "Canelo",
    family: "Winteraceae",
    description: "Árbol sagrado para el pueblo mapuche, símbolo de paz y justicia.",
    rarity: "COMUN" as const,
    careInstructions:
      "Prefiere suelos húmedos, ácidos y bien drenados, con sombra parcial en climas más secos.",
    diseases:
      "Sensible a cochinillas y a pudrición de raíz si el suelo se anega.",
  },
  {
    scientificName: "Gunnera tinctoria",
    commonName: "Nalca (Pangue)",
    family: "Gunneraceae",
    description: "Planta herbácea de grandes hojas, nativa de las zonas húmedas del sur.",
    rarity: "COMUN" as const,
    careInstructions:
      "Necesita suelo muy húmedo o pantanoso y sombra parcial; sus hojas grandes se dañan con heladas fuertes.",
    diseases:
      "Puede sufrir ataques de babosas y caracoles que perforan las hojas.",
  },
  {
    scientificName: "Berberis microphylla",
    commonName: "Calafate",
    family: "Berberidaceae",
    description: "Arbusto espinoso de la Patagonia, conocido por su fruto comestible.",
    rarity: "COMUN" as const,
    careInstructions:
      "Pleno sol, tolera suelos pobres y secos; es muy resistente al frío y al viento.",
    diseases:
      "Rara vez presenta plagas; el exceso de riego puede causar pudrición de raíz.",
  },
  {
    scientificName: "Chusquea culeou",
    commonName: "Colihue",
    family: "Poaceae",
    description: "Bambú nativo de los bosques templados del sur de Chile y Argentina.",
    rarity: "COMUN" as const,
    careInstructions:
      "Prefiere sombra parcial y suelos húmedos; se expande por rizomas, conviene contener sus raíces en jardines pequeños.",
    diseases:
      "Puede verse afectado por pulgones en las cañas jóvenes.",
  },
  {
    scientificName: "Prosopis chilensis",
    commonName: "Algarrobo chileno",
    family: "Fabaceae",
    description: "Árbol adaptado a zonas áridas del norte y centro de Chile.",
    rarity: "POCO_COMUN" as const,
    careInstructions:
      "Pleno sol, muy tolerante a la sequía y a suelos salinos; riego mínimo una vez establecido.",
    diseases:
      "Susceptible a insectos barrenadores del tronco en climas cálidos.",
  },
  {
    scientificName: "Beilschmiedia berteroana",
    commonName: "Belloto del sur",
    family: "Lauraceae",
    description: "Árbol endémico en peligro de extinción, remanente de bosques relictos.",
    rarity: "CASI_EXTINTA" as const,
    careInstructions:
      "Necesita sombra y humedad constante, con suelos profundos y bien drenados; al ser una especie en peligro, no debe extraerse de su hábitat.",
    diseases:
      "Sensible a la pudrición de raíz por mal drenaje.",
  },
  {
    scientificName: "Legrandia concinna",
    commonName: "Luma del norte",
    family: "Myrtaceae",
    description: "Árbol endémico y en peligro crítico, con muy pocas poblaciones conocidas.",
    rarity: "CASI_EXTINTA" as const,
    careInstructions:
      "Requiere humedad constante y sombra parcial; al quedar muy pocas poblaciones silvestres, no debe recolectarse en su hábitat.",
    diseases:
      "Poco documentado por lo escasa que es la especie; conviene evitar el encharcamiento del suelo.",
  },
  {
    scientificName: "Eucryphia cordifolia",
    commonName: "Ulmo",
    family: "Cunoniaceae",
    description: "Árbol nativo cuya flor es la principal fuente de la miel de ulmo.",
    rarity: "COMUN" as const,
    careInstructions:
      "Prefiere clima húmedo, suelo ácido y bien drenado, con sol pleno a semisombra.",
    diseases:
      "Puede presentar cochinillas y manchas foliares por hongos en temporadas muy lluviosas.",
  },
];

async function main() {
  for (const planta of FLORA_CHILENA) {
    await prisma.plant.upsert({
      where: { scientificName: planta.scientificName },
      update: { ...planta, nativeToChile: true },
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
