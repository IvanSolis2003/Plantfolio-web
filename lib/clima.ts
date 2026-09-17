export interface AlertaRiego {
  temperatura: number;
  condicion: string;
  mensaje: string;
}

export async function obtenerAlertaRiego(lat: number, lon: number): Promise<AlertaRiego> {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error("No se pudo obtener el clima");
  }

  const data = await respuesta.json();
  const temperatura: number = data.main?.temp ?? 0;
  const humedad: number = data.main?.humidity ?? 0;
  const condicionPrincipal: string = data.weather?.[0]?.main ?? "Clear";
  const llovioReciente = ["Rain", "Drizzle", "Thunderstorm"].includes(condicionPrincipal);

  let mensaje: string;
  if (llovioReciente || humedad >= 70) {
    mensaje = "Hay humedad suficiente hoy, podés saltarte el riego.";
  } else if (temperatura >= 25) {
    mensaje = "Día caluroso y seco — buen momento para regar tus plantas.";
  } else {
    mensaje = "Clima moderado, regá según lo necesite cada planta.";
  }

  return { temperatura, condicion: condicionPrincipal, mensaje };
}
