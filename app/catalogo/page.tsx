import HeaderPublico from "@/components/HeaderPublico";
import CreditoIasmtech from "@/components/CreditoIasmtech";
import { obtenerUsuarioServidor } from "@/lib/sesion";
import CatalogoCliente from "./CatalogoCliente";

export const metadata = {
  title: "Catálogo de especies — Plantfolio",
};

export default async function CatalogoPage() {
  const usuario = await obtenerUsuarioServidor();

  return (
    <div className="min-h-dvh bg-background pb-6">
      {!usuario && <HeaderPublico />}

      <div className="px-5 pt-6">
        <p className="mb-1 text-xl font-bold text-primary">Catálogo de flora chilena</p>
        <p className="mb-4 text-sm text-muted">
          Especies documentadas en Plantfolio, con cuidados y datos de conservación.
        </p>

        <CatalogoCliente />

        <CreditoIasmtech />
      </div>
    </div>
  );
}
