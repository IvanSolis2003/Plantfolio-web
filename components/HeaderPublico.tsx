import Link from "next/link";

export default function HeaderPublico() {
  return (
    <div className="flex items-center justify-between px-5 pt-6">
      <span className="text-lg font-bold text-primary">🌿 Plantfolio</span>
      <Link href="/entrar" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">
        Entrar
      </Link>
    </div>
  );
}
