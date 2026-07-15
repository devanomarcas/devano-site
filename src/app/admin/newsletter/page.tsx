import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../actions";

export const metadata = {
  title: "Inscritos — Painel Devano",
  robots: { index: false, follow: false },
};

export default async function InscritosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: inscritos, count } = await supabase
    .from("inscritos")
    .select("*", { count: "exact" })
    .order("criado_em", { ascending: false });

  function formatarData(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <Link href="/admin">
            <Image src="/brand/logo-musgo.png" alt="Devano" width={120} height={26} />
          </Link>
          <div className="admin-topbar-right">
            <span className="admin-user">{user?.email}</span>
            <form action={logout}>
              <button type="submit" className="admin-logout">Sair</button>
            </form>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <Link href="/admin" className="admin-voltar">← Voltar ao painel</Link>
        <p className="admin-eyebrow">Marketing · Newsletter</p>
        <h1 className="admin-title">Inscritos da Marketeiros</h1>
        <p className="admin-lead">
          {count ?? 0} {count === 1 ? "pessoa inscrita" : "pessoas inscritas"} até agora.
        </p>

        {inscritos && inscritos.length > 0 ? (
          <div className="admin-tabela">
            <div className="admin-tabela-head">
              <span>E-mail</span>
              <span>Inscrito em</span>
            </div>
            {inscritos.map((i) => (
              <div className="admin-tabela-row" key={i.id}>
                <span>{i.email}</span>
                <span className="admin-tabela-data">{formatarData(i.criado_em)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-vazio">
            Ainda não há inscritos. Divulgue devanobranding.com/#newsletter para
            começar a captar.
          </div>
        )}
      </main>
    </div>
  );
}
