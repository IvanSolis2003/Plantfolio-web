import type { Metadata, Viewport } from "next";
import RegistrarServiceWorker from "./registrar-sw";
import EstadoConexion from "@/components/EstadoConexion";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plantfolio",
  description: "Tu colección de plantas",
  applicationName: "Plantfolio",
  appleWebApp: {
    capable: true,
    title: "Plantfolio",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#2D6A4F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-background text-text">
        <EstadoConexion />
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}
