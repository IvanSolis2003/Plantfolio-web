"use client";

import { useState } from "react";
import Image from "next/image";
import VisorFoto from "@/components/VisorFoto";

export default function GaleriaFotos({ fotos, alt }: { fotos: string[]; alt: string }) {
  const [fotoAbierta, setFotoAbierta] = useState<number | null>(null);

  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {fotos.map((url, indice) => (
          <button key={url} onClick={() => setFotoAbierta(indice)} className="block">
            <Image
              src={url}
              alt={alt}
              width={150}
              height={150}
              className="h-24 w-full rounded-xl object-cover"
            />
          </button>
        ))}
      </div>

      {fotoAbierta !== null && (
        <VisorFoto fotos={fotos} indice={fotoAbierta} alt={alt} onCerrar={() => setFotoAbierta(null)} />
      )}
    </>
  );
}
