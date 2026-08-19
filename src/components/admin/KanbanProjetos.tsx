"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [filtro, setFiltro] = useState<string>("todos");
  const [modalCad, setModalCad] = useState(false);
  const [detalhe, setDetalhe] = useState<ProjetoDB | null>(null);

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

  async function mover(p: ProjetoDB, dir: number) {
    const nova = Math.max(0, Math.min(p.fases.length - 1, p.fase_atual + dir));
    if (nova === p.fase_atual) return;
    await fetch("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "mover", id: p.id, novaFase: nova }),
    });
    router.refresh();
  }

  return (
    <div className="kb">
      <div className="kb-topo">
        <div className="kb-filtros">
          {tipos.map(([v, l]) => (
            <button key={v} className={`kb-chip ${filtro === v ? "on" : ""}`} onClick={() => setFiltro(v)}>
              {l}
            </button>
          ))}
        </div>
        <button className="kb-novo" onClick={() => setModalCad(true)}>+ Novo projeto</button>
      </div>

      {visiveis.length === 0 ? (
        <p className="kb-vazio-geral">Nenhum projeto ainda. Clique em “+ Novo projeto” para começar.</p>
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
                  naColuna.map((p) => (
                    <Cartao key={p.id} p={p} onAbrir={() => setDetalhe(p)} onMover={mover} />
                  ))
                ) : (
                  <div className="kb-vazia">—</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalCad && <ModalCadastro onFechar={() => setModalCad(false)} onSalvo={() => { setModalCad(false); router.refresh(); }} />}
      {detalhe && <ModalDetalhe p={detalhe} onFechar={() => setDetalhe(null)} onSalvo={() => { setDetalhe(null); router.refresh(); }} />}
    </div>
  );
}

function Cartao({ p, onAbrir, onMover }: { p: ProjetoDB; onAbrir: () => void; onMover: (p: ProjetoDB, dir: number) => void }) {
  const faseAtual = p.fases.find((f) => f.ordem === p.fase_atual);
  const periodo = faseAtual ? `${dCurto(faseAtual.inicio)} – ${dCurto(faseAtual.fim)}` : "—";
  const podeVoltar = p.fase_atual > 0;
  const podeAvancar = p.fase_atual < p.fases.length - 1;
  return (
    <div className={`kb-card ${p.tipo}`} onClick={onAbrir}>
      <div className="kb-card-tipo">{TIPO_LABEL[p.tipo]}</div>
      <div className="kb-card-nome">{p.nome}</div>
      <div className="kb-card-meta">
        <span className="kb-card-cliente">{p.cliente || "—"}</span>
        <span className="kb-card-periodo">📅 {periodo}</span>
      </div>
      {p.observacao && <div className="kb-card-obs">{p.observacao}</div>}
      <div className="kb-card-mover" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onMover(p, -1)} disabled={!podeVoltar}>←</button>
        <button onClick={() => onMover(p, 1)} disabled={!podeAvancar}>Avançar →</button>
      </div>
    </div>
  );
}

function ModalCadastro({ onFechar, onSalvo }: { onFechar: () => void; onSalvo: () => void }) {
  const [nome, setNome] = useState("");
  const [cliente, setCliente] = useState("");
  const [tipo, setTipo] = useState<"branding" | "visual" | "excepcional">("branding");
  const [marcadas, setMarcadas] = useState<boolean[]>(FASES_PADRAO["branding"].map(() => true));
  const [datas, setDatas] = useState<{ inicio: string; fim: string }[]>(
    FASES_PADRAO["branding"].map(() => ({ inicio: "", fim: "" }))
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const fases = FASES_PADRAO[tipo];

  function trocarTipo(novo: "branding" | "visual" | "excepcional") {
    setTipo(novo);
    setMarcadas(FASES_PADRAO[novo].map(() => true));
    setDatas(FASES_PADRAO[novo].map(() => ({ inicio: "", fim: "" })));
  }

  async function salvar() {
    if (!nome.trim()) { setErro("Dê um nome ao projeto."); return; }
    const fasesSel = fases
      .map((f, i) => ({ nome: f, ...datas[i], marcada: marcadas[i] }))
      .filter((f) => f.marcada)
      .map((f) => ({ nome: f.nome, inicio: f.inicio, fim: f.fim }));
    if (fasesSel.length === 0) { setErro("Marque pelo menos uma fase."); return; }
    setErro(null);
    setSalvando(true);
    try {
      const res = await fetch("/api/projetos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "criar", nome, cliente, tipo, fases: fasesSel }),
      });
      const d = await res.json();
      if (res.ok) onSalvo();
      else setErro(d.error || "Erro ao salvar.");
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="kb-overlay" onClick={onFechar}>
      <div className="kb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="kb-modal-head">
          <h2>Novo projeto</h2>
          <button className="kb-modal-x" onClick={onFechar}>×</button>
        </div>
        <div className="kb-modal-body">
          <label className="kb-label">Nome do projeto
            <input className="kb-input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Rebranding Encaixe Móveis" />
          </label>
          <label className="kb-label">Cliente
            <input className="kb-input" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Ex.: Encaixe Móveis" />
          </label>
          <label className="kb-label">Tipo de projeto
            <select className="kb-input" value={tipo} onChange={(e) => trocarTipo(e.target.value as any)}>
              <option value="branding">Branding completo</option>
              <option value="visual">Comunicação visual</option>
              <option value="excepcional">Excepcional</option>
            </select>
          </label>
          <div className="kb-label">Fases e cronograma</div>
          <div className="kb-fases-cad">
            <div className="kb-datas-labels"><span>Início</span><span>Fim/apres.</span></div>
            {fases.map((f, i) => (
              <div className={`kb-fase-cad ${marcadas[i] ? "ativa" : "inativa"}`} key={i}>
                <input type="checkbox" checked={marcadas[i]} onChange={() => {
                  const m = [...marcadas]; m[i] = !m[i]; setMarcadas(m);
                }} />
                <span className="kb-fase-cad-nome">{f}</span>
                <input type="date" disabled={!marcadas[i]} value={datas[i].inicio}
                  onChange={(e) => { const d = [...datas]; d[i] = { ...d[i], inicio: e.target.value }; setDatas(d); }} />
                <input type="date" disabled={!marcadas[i]} value={datas[i].fim}
                  onChange={(e) => { const d = [...datas]; d[i] = { ...d[i], fim: e.target.value }; setDatas(d); }} />
              </div>
            ))}
          </div>
          <p className="kb-dica">Marque as fases que este projeto terá e defina início e fim de cada uma. A data de fim costuma ser o dia da apresentação ao cliente. Tudo pode ser ajustado depois.</p>
          {erro && <p className="kb-erro">{erro}</p>}
        </div>
        <div className="kb-modal-foot">
          <button className="kb-btn-ghost" onClick={onFechar}>Cancelar</button>
          <button className="kb-btn-primary" onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando…" : "Cadastrar projeto"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalDetalhe({ p, onFechar, onSalvo }: { p: ProjetoDB; onFechar: () => void; onSalvo: () => void }) {
  const [obs, setObs] = useState(p.observacao || "");
  const [salvando, setSalvando] = useState(false);
  const faseAtualNome = p.fases.find((f) => f.ordem === p.fase_atual)?.nome || "—";

  async function salvarObs() {
    setSalvando(true);
    await fetch("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "observacao", id: p.id, observacao: obs }),
    });
    setSalvando(false);
    onSalvo();
  }

  return (
    <div className="kb-overlay" onClick={onFechar}>
      <div className="kb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="kb-modal-head">
          <h2>{p.nome}</h2>
          <button className="kb-modal-x" onClick={onFechar}>×</button>
        </div>
        <div className="kb-modal-body">
          <div className="kb-det-info">
            <strong>{TIPO_LABEL[p.tipo]}</strong> · Cliente: {p.cliente || "—"}
          </div>
          <div className="kb-det-fases-titulo">Fases e cronograma</div>
          {p.fases.map((f) => {
            const st = f.ordem < p.fase_atual ? "done" : f.ordem === p.fase_atual ? "atual" : "";
            return (
              <div className="kb-fase-item" key={f.id}>
                <span className={`kb-fase-check ${st}`}>{f.ordem < p.fase_atual ? "✓" : f.ordem + 1}</span>
                <span className={`kb-fase-texto ${f.ordem < p.fase_atual ? "done" : ""}`}>{f.nome}</span>
                <span className="kb-fase-datas">{dCurto(f.inicio)} → <span className="fim">{dCurto(f.fim)}</span></span>
              </div>
            );
          })}
          <div className="kb-obs-bloco">
            <div className="kb-det-fases-titulo">Observação da fase atual</div>
            <div className="kb-obs-atual">Fase atual: <strong>{faseAtualNome}</strong></div>
            <textarea className="kb-textarea" value={obs} onChange={(e) => setObs(e.target.value)}
              placeholder="Ex.: identidade apresentada, aguardando aprovação do cliente..." />
            <button className="kb-btn-primary" onClick={salvarObs} disabled={salvando} style={{ marginTop: 10 }}>
              {salvando ? "Salvando…" : "Salvar observação"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
