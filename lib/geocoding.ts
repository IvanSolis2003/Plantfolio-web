function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export async function ubicacionAproximada(lat: number, lon: number): Promise<string | null> {
  const latRedondeada = redondear(lat);
  const lonRedondeada = redondear(lon);

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${latRedondeada}&lon=${lonRedondeada}&format=json&zoom=10&accept-language=es`;

  try {
    const respuesta = await fetch(url, {
      headers: { "User-Agent": "Plantfolio (plantfolio-web.vercel.app)" },
    });
    if (!respuesta.ok) return null;

    const data = await respuesta.json();
    const direccion = data?.address;
    if (!direccion) return null;

    const lugar = direccion.city ?? direccion.town ?? direccion.village ?? direccion.county;
    const region = direccion.state;

    if (lugar && region && lugar !== region) return `${lugar}, ${region}`;
    return lugar ?? region ?? data?.display_name ?? null;
  } catch {
    return null;
  }
}
