import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPapel } from "@/lib/papel";
import { logout } from "../actions";
import KanbanProjetos, { type ProjetoDB, type FaseDB } from "@/components/admin/KanbanProjetos";

export const metadata = {
  title: "Projetos — Painel Devano",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function ProjetosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const papel = user ? await getPapel(user.id) : null;

  const admin = createAdminClient();
  const { data: projetosRaw } = await admin
    .from("projetos")
    .select("*")
    .order("criado_em", { ascending: false });

  const { data: fasesRaw } = await admin
    .from("fases")
    .select("*")
    .order("ordem", { ascending: true });

  const fases = (fasesRaw ?? []) as FaseDB[];

  // lista de pessoas (para seleção no cadastro)
  const { data: perfisRaw } = await admin
    .from("perfis")
    .select("id, nome")
    .order("nome", { ascending: true });
  const pessoas = (perfisRaw ?? []).map((p) => ({ id: p.id, nome: p.nome ?? "—" }));

  // participantes por projeto
  const { data: partsRaw } = await admin
    .from("participantes")
    .select("projeto_id, perfil_id");
  const parts = partsRaw ?? [];

  const projetos: ProjetoDB[] = (projetosRaw ?? []).map((p) => ({
    id: p.id,
    nome: p.nome,
    cliente: p.cliente,
    tipo: p.tipo,
    fase_atual: p.fase_atual ?? 0,
    observacao: p.observacao,
    fases: fases.filter((f) => f.projeto_id === p.id),
    participantes: parts
      .filter((pt) => pt.projeto_id === p.id)
      .map((pt) => pessoas.find((pe) => pe.id === pt.perfil_id)?.nome || "")
      .filter(Boolean),
    participantesIds: parts
      .filter((pt) => pt.projeto_id === p.id)
      .map((pt) => pt.perfil_id),
  }));

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
        <div className="admin-breadcrumb">
          <Link href="/admin">Painel</Link> · Projetos
        </div>
        <p className="admin-eyebrow">Operação</p>
        <h1 className="admin-title">Projetos em andamento</h1>
        <p className="admin-lead">
          Acompanhe todos os projetos e suas fases.
          {papel === "gestor" && " Como gestor, você também acessa o financeiro de cada projeto."}
        </p>

        {papel === "gestor" && (
          <div className="fg-atalho">
            <Link href="/admin/projetos/financeiro" className="admin-chip">Ver financeiro consolidado →</Link>
          </div>
        )}

        <KanbanProjetos projetos={projetos} pessoas={pessoas} papel={papel} />
      </main>
    </div>
  );
}
