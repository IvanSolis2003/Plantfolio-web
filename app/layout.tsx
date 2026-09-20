import type { Metadata, Viewport } from "next";
import Script from "next/script";
import RegistrarServiceWorker from "./registrar-sw";
import QueryProvider from "./QueryProvider";
import SincronizarSesion from "./SincronizarSesion";
import EstadoConexion from "@/components/EstadoConexion";
import BarraInferior from "@/components/BarraInferior";
import FondoHojas from "@/components/FondoHojas";
import { obtenerUsuarioServidor } from "@/lib/sesion";
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const usuario = await obtenerUsuarioServidor();

  return (
    <html lang="es">
      <body className="bg-background text-text">
        <FondoHojas />
        <QueryProvider>
          <SincronizarSesion usuario={usuario} />
          <EstadoConexion />
          <div className={usuario ? "pb-[60px]" : undefined}>{children}</div>
          {usuario && <BarraInferior />}
        </QueryProvider>
        <RegistrarServiceWorker />
        <Script
          src="https://iasm-pulse.vercel.app/track.js"
          data-site="plantfolio-web.vercel.app"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
