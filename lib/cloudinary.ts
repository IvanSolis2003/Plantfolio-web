import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function subirImagen(base64: string): Promise<string> {
  const dataUri = base64.startsWith("data:") ? base64 : `data:image/jpeg;base64,${base64}`;

  const resultado = await cloudinary.uploader.upload(dataUri, {
    folder: "plantfolio",
    resource_type: "image",
  });

  return resultado.secure_url;
}

export async function eliminarImagen(url: string): Promise<void> {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  if (!match) return;

  await cloudinary.uploader.destroy(match[1]).catch(() => {});
}
