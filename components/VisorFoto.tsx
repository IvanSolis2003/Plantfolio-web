"use client";

import { useState } from "react";
import Image from "next/image";

export default function VisorFoto({
  fotos,
  indice,
  alt,
  onCerrar,
}: {
  fotos: string[];
  indice: number;
  alt: string;
  onCerrar: () => void;
}) {
  const [actual, setActual] = useState(indice);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onCerrar}
    >
      <button
        onClick={onCerrar}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl text-white"
      >
        ✕
      </button>

      <Image
        src={fotos[actual]}
        alt={alt}
        width={900}
        height={900}
        className="max-h-full max-w-full rounded-xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {fotos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActual((actual - 1 + fotos.length) % fotos.length);
            }}
            className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-2xl text-white"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActual((actual + 1) % fotos.length);
            }}
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-2xl text-white"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
