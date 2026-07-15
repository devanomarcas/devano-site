import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export const metadata = {
  title: "Painel Devano",
  robots: { index: false, follow: false },
};

export default async function AdminHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <Image src="/brand/logo-musgo.png" alt="Devano" width={120} height={26} />
          <div className="admin-topbar-right">
            <span className="admin-user">{user?.email}</span>
            <form action={logout}>
              <button type="submit" className="admin-logout">Sair</button>
            </form>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <p className="admin-eyebrow">Gestão e Inteligência Devano</p>
        <h1 className="admin-title">Bem-vindo de volta.</h1>
        <p className="admin-lead">
          Escolha um setor para começar. Nesta fase, o setor de Marketing já
          conta com as primeiras ferramentas.
        </p>

        <div className="admin-setores">
          <div className="admin-setor ativo">
            <h2>Marketing</h2>
            <p>Blog e newsletter Marketeiros.</p>
            <div className="admin-setor-links">
              <span className="admin-chip em-breve">Blog · em breve</span>
              <Link href="/admin/newsletter" className="admin-chip">Newsletter →</Link>
            </div>
          </div>

          <div className="admin-setor">
            <h2>Comercial</h2>
            <p>Gerador de propostas.</p>
            <span className="admin-chip em-breve">Em breve</span>
          </div>

          <div className="admin-setor">
            <h2>Financeiro</h2>
            <p>Controle de entradas, saídas e projeções.</p>
            <span className="admin-chip em-breve">Em breve</span>
          </div>
        </div>
      </main>
    </div>
  );
}
