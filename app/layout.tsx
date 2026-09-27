import type { Metadata, Viewport } from "next";
import Script from "next/script";
import RegistrarServiceWorker from "./registrar-sw";
import QueryProvider from "./QueryProvider";
import SincronizarSesion from "./SincronizarSesion";
import EstadoConexion from "@/components/EstadoConexion";
import BarraInferior from "@/components/BarraInferior";
import NavEscritorio from "@/components/NavEscritorio";
import FondoHojas from "@/components/FondoHojas";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import { baseDeLaApp } from "@/lib/cuentas";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(baseDeLaApp()),
  title: "Plantfolio",
  description: "Identifica y colecciona la flora chilena con tu cámara.",
  applicationName: "Plantfolio",
  appleWebApp: {
    capable: true,
    title: "Plantfolio",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Plantfolio",
    description: "Identifica y colecciona la flora chilena con tu cámara.",
    siteName: "Plantfolio",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plantfolio",
    description: "Identifica y colecciona la flora chilena con tu cámara.",
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
      <body className="text-text">
        <FondoHojas />
        <QueryProvider>
          <div className="flex min-h-dvh">
            {usuario && <NavEscritorio />}
            <div className="min-w-0 flex-1">
              <SincronizarSesion usuario={usuario} />
              <EstadoConexion />
              <div className={usuario ? "pb-[60px] md:pb-0" : undefined}>{children}</div>
            </div>
          </div>
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
