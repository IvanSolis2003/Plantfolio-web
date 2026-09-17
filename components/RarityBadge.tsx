const ETIQUETA: Record<string, string> = {
  COMUN: "Común",
  POCO_COMUN: "Poco común",
  ENDEMICA: "Endémica",
  PROTEGIDA: "Protegida",
  CASI_EXTINTA: "Casi extinta",
};

const COLOR: Record<string, string> = {
  COMUN: "bg-rare-comun/15 text-rare-comun",
  POCO_COMUN: "bg-rare-poco/15 text-rare-poco",
  ENDEMICA: "bg-rare-endemica/15 text-rare-endemica",
  PROTEGIDA: "bg-rare-protegida/15 text-rare-protegida",
  CASI_EXTINTA: "bg-rare-extinta/15 text-rare-extinta",
};

export default function RarityBadge({ rarity }: { rarity: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${COLOR[rarity] ?? ""}`}
    >
      {ETIQUETA[rarity] ?? rarity}
    </span>
  );
}
