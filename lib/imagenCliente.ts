const ANCHO_MAXIMO = 1600;
const CALIDAD_JPEG = 0.85;

export function archivoAJpegBase64(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onload = () => {
      const img = new window.Image();

      img.onload = () => {
        const escala = Math.min(1, ANCHO_MAXIMO / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Tu navegador no puede procesar la imagen"));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", CALIDAD_JPEG));
      };

      img.onerror = () => reject(new Error("No se pudo leer la imagen. Probá con otra foto."));
      img.src = lector.result as string;
    };

    lector.onerror = () => reject(new Error("No se pudo leer el archivo"));
    lector.readAsDataURL(archivo);
  });
}
