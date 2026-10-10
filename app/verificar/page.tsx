import ConfirmarCorreo from "./ConfirmarCorreo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Confirmar correo — Plantfolio",
};

export default async function VerificarPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return <ConfirmarCorreo token={token ?? ""} />;
}
