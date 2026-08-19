import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ehGestor } from "@/lib/papel";
import { logout } from "../../actions";

export const metadata = {
  title: "Financeiro geral — Painel Devano",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

const fmt = (v: number) => "R$ " + Math.round(v).toLocaleString("pt-BR");

export default async function FinanceiroGeralPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proteção: só gestor acessa. Equipe é redirecionada.
  if (!user || !(await ehGestor(user.id))) {
    redirect("/admin/projetos");
  }

  const admin = createAdminClient();
  const [{ data: projetos }, { data: financeiro }, { data: custos }, { data: parcelas }] =
    await Promise.all([
      admin.from("projetos").select("id, nome, tipo"),
      admin.from("financeiro").select("*"),
      admin.from("custos").select("*"),
      admin.from("parcelas").select("*"),
    ]);

  const proj = projetos ?? [];
  const fin = financeiro ?? [];
  const cst = custos ?? [];
  const parc = parcelas ?? [];

  // Totais gerais
  const totalFaturado = parc.reduce((s, p) => s + (Number(p.valor) || 0), 0);
  const totalRecebido = parc.filter((p) => p.recebida).reduce((s, p) => s + (Number(p.valor) || 0), 0);
  const totalAReceber = totalFaturado - totalRecebido;
  const valorContratado = fin.reduce((s, f) => s + (Number(f.valor_total) || 0), 0);
  const totalCustos = cst.reduce((s, c) => s + (Number(c.valor) || 0), 0);
  const totalAdmin = valorContratado * 0.15;
  const totalLiquido = valorContratado - totalCustos - totalAdmin;

  // Fluxo futuro por mês (parcelas não recebidas, agrupadas por mês)
  const porMes: Record<string, number> = {};
  parc
    .filter((p) => !p.recebida && p.vencimento)
    .forEach((p) => {
      const mes = String(p.vencimento).slice(0, 7); // YYYY-MM
      porMes[mes] = (porMes[mes] || 0) + (Number(p.valor) || 0);
    });
  const meses = Object.keys(porMes).sort();
  const maxMes = Math.max(1, ...Object.values(porMes));

  function nomeMes(iso: string): string {
    const [ano, mes] = iso.split("-");
    const nomes = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    return `${nomes[parseInt(mes) - 1]}/${ano.slice(2)}`;
  }

  // Por tipo de projeto
  const porTipo: Record<string, number> = { branding: 0, visual: 0, excepcional: 0 };
  proj.forEach((pr) => {
    const f = fin.find((x) => x.projeto_id === pr.id);
    if (f) porTipo[pr.tipo] = (porTipo[pr.tipo] || 0) + (Number(f.valor_total) || 0);
  });
  const TIPO_LABEL: Record<string, string> = {
    branding: "Branding completo", visual: "Comunicação visual", excepcional: "Excepcionais",
  };

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
          <Link href="/admin">Painel</Link> · <Link href="/admin/projetos">Projetos</Link> · Financeiro geral
        </div>
        <p className="admin-eyebrow">Financeiro · Visão geral</p>
        <h1 className="admin-title">Financeiro consolidado</h1>
        <p className="admin-lead">Visão de todos os projetos juntos. Restrito ao gestor.</p>

        <div className="fg-cards">
          <div className="fg-card faturado"><span>Faturado (parcelas)</span><strong>{fmt(totalFaturado)}</strong></div>
          <div className="fg-card recebido"><span>Já recebido</span><strong>{fmt(totalRecebido)}</strong></div>
          <div className="fg-card areceber"><span>A receber</span><strong>{fmt(totalAReceber)}</strong></div>
        </div>

        <div className="fg-secao">
          <h2 className="fg-titulo">Fluxo futuro — o que entra por mês</h2>
          {meses.length === 0 ? (
            <p className="kb-dica">Nenhuma parcela futura a receber.</p>
          ) : (
            <div className="fg-fluxo">
              {meses.map((m) => (
                <div className="fg-fluxo-linha" key={m}>
                  <span className="fg-fluxo-mes">{nomeMes(m)}</span>
                  <div className="fg-fluxo-barra-tras">
                    <div className="fg-fluxo-barra" style={{ width: `${(porMes[m] / maxMes) * 100}%` }} />
                  </div>
                  <span className="fg-fluxo-valor">{fmt(porMes[m])}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="fg-duas">
          <div className="fg-secao">
            <h2 className="fg-titulo">Resultado geral</h2>
            <div className="fg-resumo">
              <div className="fg-resumo-linha"><span>Valor contratado</span><span>{fmt(valorContratado)}</span></div>
              <div className="fg-resumo-linha"><span>− Custos de pessoal</span><span>{fmt(totalCustos)}</span></div>
              <div className="fg-resumo-linha"><span>− Administrativo (15%)</span><span>{fmt(totalAdmin)}</span></div>
              <div className="fg-resumo-linha total"><span>Líquido estimado</span><span>{fmt(totalLiquido)}</span></div>
            </div>
          </div>

          <div className="fg-secao">
            <h2 className="fg-titulo">Contratado por tipo</h2>
            <div className="fg-tipos">
              {Object.entries(porTipo).map(([t, v]) => (
                <div className="fg-tipo-linha" key={t}>
                  <span className={`fg-tipo-dot ${t}`} />
                  <span className="fg-tipo-nome">{TIPO_LABEL[t]}</span>
                  <span className="fg-tipo-valor">{fmt(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
