"use client";

import { useState } from "react";

export type FaseDB = {
  id: string;
  projeto_id: string;
  nome: string;
  ordem: number;
  inicio: string | null;
  fim: string | null;
};

export type ProjetoDB = {
  id: string;
  nome: string;
  cliente: string | null;
  tipo: "branding" | "visual" | "excepcional";
  fase_atual: number;
  observacao: string | null;
  fases: FaseDB[];
};

const TIPO_LABEL: Record<string, string> = {
  branding: "Branding completo",
  visual: "Comunicação visual",
  excepcional: "Excepcional",
};

const FASES_PADRAO: Record<string, string[]> = {
  branding: [
    "Reunião de pontapé inicial", "Formulário briefing", "Pesquisa e diagnóstico",
    "Estratégia de marca", "Naming", "Identidade visual", "Reunião final",
  ],
  visual: [
    "Reunião de pontapé inicial", "Formulário briefing", "Criação de identidade visual",
    "Apresentação da identidade", "Fechamento e envio de link",
  ],
  excepcional: ["Definição do escopo", "Em execução", "Revisão", "Entrega"],
};

function dCurto(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function KanbanProjetos({ projetos }: { projetos: ProjetoDB[] }) {
  const [filtro, setFiltro] = useState<string>("todos");

  const tipos: [string, string][] = [
    ["todos", "Todos"], ["branding", "Branding"],
    ["visual", "Comunicação visual"], ["excepcional", "Excepcionais"],
  ];

  const visiveis = projetos.filter((p) => filtro === "todos" || p.tipo === filtro);

  let colunas: string[];
  if (filtro === "todos") {
    const maxF = Math.max(7, ...visiveis.map((p) => p.fases.length || 0));
    colunas = Array.from({ length: maxF }, (_, i) => `Etapa ${i + 1}`);
  } else {
    colunas = FASES_PADRAO[filtro];
  }

  return (
    <div className="kb">
      <div className="kb-filtros">
        {tipos.map(([v, l]) => (
          <button
            key={v}
            className={`kb-chip ${filtro === v ? "on" : ""}`}
            onClick={() => setFiltro(v)}
          >
            {l}
          </button>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <p className="kb-vazio-geral">
          Nenhum projeto cadastrado ainda. O cadastro será ativado no próximo passo.
        </p>
      ) : (
        <div className="kb-board">
          {colunas.map((nomeCol, idx) => {
            const naColuna = visiveis.filter((p) => p.fase_atual === idx);
            return (
              <div className="kb-coluna" key={idx}>
                <div className="kb-coluna-head">
                  <span className="kb-coluna-nome">{nomeCol}</span>
                  <span className="kb-coluna-num">{naColuna.length}</span>
                </div>
                {naColuna.length ? (
                  naColuna.map((p) => <Cartao key={p.id} p={p} />)
                ) : (
                  <div className="kb-vazia">—</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Cartao({ p }: { p: ProjetoDB }) {
  const faseAtual = p.fases.find((f) => f.ordem === p.fase_atual);
  const periodo = faseAtual
    ? `${dCurto(faseAtual.inicio)} – ${dCurto(faseAtual.fim)}`
    : "—";
  return (
    <div className={`kb-card ${p.tipo}`}>
      <div className="kb-card-tipo">{TIPO_LABEL[p.tipo]}</div>
      <div className="kb-card-nome">{p.nome}</div>
      <div className="kb-card-meta">
        <span className="kb-card-cliente">{p.cliente || "—"}</span>
        <span className="kb-card-periodo">📅 {periodo}</span>
      </div>
      {p.observacao && <div className="kb-card-obs">{p.observacao}</div>}
    </div>
  );
}
