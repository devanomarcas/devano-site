"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Financeiro from "@/components/admin/Financeiro";

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
  finalizado: boolean;
  observacao: string | null;
  fases: FaseDB[];
  participantes: string[];
  participantesIds: string[];
  observacoes: ObsDB[];
};

export type ObsDB = {
  id: string;
  texto: string;
  autor: string | null;
  criado_em: string;
};

export type Pessoa = { id: string; nome: string };

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

function dataHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }) +
    ", " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function KanbanProjetos({ projetos, pessoas, papel, autor }: { projetos: ProjetoDB[]; pessoas: Pessoa[]; papel: "gestor" | "equipe" | null; autor: string }) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<string>("todos");
  const [filtroPessoa, setFiltroPessoa] = useState<string>("");
  const [modalCad, setModalCad] = useState(false);
  const [detalhe, setDetalhe] = useState<ProjetoDB | null>(null);

  const tipos: [string, string][] = [
    ["todos", "Todos"], ["branding", "Branding"],
    ["visual", "Comunicação visual"], ["excepcional", "Excepcionais"],
  ];

  const visiveis = projetos.filter((p) => {
    if (filtroPessoa) return p.participantes.includes(filtroPessoa);
    return filtro === "todos" || p.tipo === filtro;
  });

  // Em andamento (nas colunas de fase) e finalizados (na coluna final) separados
  const emAndamento = visiveis.filter((p) => !p.finalizado);
  const finalizados = visiveis.filter((p) => p.finalizado);

  let colunas: string[];
  if (filtroPessoa || filtro === "todos") {
    const maxF = Math.max(7, ...emAndamento.map((p) => p.fases.length || 0));
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

  async function finalizar(p: ProjetoDB, finalizado: boolean) {
    await fetch("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "finalizar", id: p.id, finalizado }),
    });
    router.refresh();
  }

  return (
    <div className="kb">
      <div className="kb-topo">
        <div className="kb-filtros">
          {tipos.map(([v, l]) => (
            <button key={v} className={`kb-chip ${filtro === v && !filtroPessoa ? "on" : ""}`}
              onClick={() => { setFiltro(v); setFiltroPessoa(""); }}>
              {l}
            </button>
          ))}
        </div>
        <button className="kb-novo" onClick={() => setModalCad(true)}>+ Novo projeto</button>
      </div>

      <div className="kb-filtros kb-filtros-pessoas">
        <span className="kb-filtros-label">Por pessoa:</span>
        {pessoas.map((pe) => (
          <button key={pe.id} className={`kb-chip pessoa ${filtroPessoa === pe.nome ? "on" : ""}`}
            onClick={() => {
              if (filtroPessoa === pe.nome) { setFiltroPessoa(""); }
              else { setFiltroPessoa(pe.nome); setFiltro("todos"); }
            }}>
            {pe.nome}
          </button>
        ))}
        {filtroPessoa && (
          <button className="kb-chip limpar" onClick={() => setFiltroPessoa("")}>× limpar</button>
        )}
      </div>

      {visiveis.length === 0 ? (
        <p className="kb-vazio-geral">Nenhum projeto ainda. Clique em “+ Novo projeto” para começar.</p>
      ) : (
        <div className="kb-board">
          {colunas.map((nomeCol, idx) => {
            const naColuna = emAndamento.filter((p) => p.fase_atual === idx);
            return (
              <div className="kb-coluna" key={idx}>
                <div className="kb-coluna-head">
                  <span className="kb-coluna-nome">{nomeCol}</span>
                  <span className="kb-coluna-num">{naColuna.length}</span>
                </div>
                {naColuna.length ? (
                  naColuna.map((p) => (
                    <Cartao key={p.id} p={p} onAbrir={() => setDetalhe(p)} onMover={mover} onFinalizar={finalizar} />
                  ))
                ) : (
                  <div className="kb-vazia">—</div>
                )}
              </div>
            );
          })}

          {/* Coluna fixa: Projetos finalizados */}
          <div className="kb-coluna kb-coluna-final">
            <div className="kb-coluna-head">
              <span className="kb-coluna-nome">✓ Finalizados</span>
              <span className="kb-coluna-num">{finalizados.length}</span>
            </div>
            {finalizados.length ? (
              finalizados.map((p) => (
                <Cartao key={p.id} p={p} onAbrir={() => setDetalhe(p)} onMover={mover} onFinalizar={finalizar} />
              ))
            ) : (
              <div className="kb-vazia">—</div>
            )}
          </div>
        </div>
      )}

      {modalCad && <ModalCadastro pessoas={pessoas} onFechar={() => setModalCad(false)} onSalvo={() => { setModalCad(false); router.refresh(); }} />}
      {detalhe && <ModalDetalhe p={detalhe} papel={papel} pessoas={pessoas} autor={autor} onFechar={() => setDetalhe(null)} onSalvo={() => { setDetalhe(null); router.refresh(); }} />}
    </div>
  );
}

function Cartao({ p, onAbrir, onMover, onFinalizar }: { p: ProjetoDB; onAbrir: () => void; onMover: (p: ProjetoDB, dir: number) => void; onFinalizar: (p: ProjetoDB, finalizado: boolean) => void }) {
  const faseAtual = p.fases.find((f) => f.ordem === p.fase_atual);
  const periodo = faseAtual ? `${dCurto(faseAtual.inicio)} – ${dCurto(faseAtual.fim)}` : "—";
  const podeVoltar = p.fase_atual > 0;
  const naUltimaFase = p.fase_atual >= p.fases.length - 1;
  const nUpdates = p.observacoes.length;
  const ultima = nUpdates > 0 ? p.observacoes[0] : null; // já vem ordenado desc
  return (
    <div className={`kb-card ${p.tipo} ${p.finalizado ? "finalizado" : ""}`} onClick={onAbrir}>
      <div className="kb-card-tipo">{TIPO_LABEL[p.tipo]}</div>
      <div className="kb-card-nome">{p.nome}</div>
      {!p.finalizado && faseAtual && <div className="kb-card-fase">{faseAtual.nome}</div>}
      <div className="kb-card-meta">
        <span className="kb-card-cliente">{p.cliente || "—"}</span>
        {!p.finalizado && <span className="kb-card-periodo">📅 {periodo}</span>}
      </div>
      {ultima && (
        <div className="kb-card-obs">
          <span className="kb-card-obs-cont">{nUpdates} {nUpdates === 1 ? "atualização" : "atualizações"} · última:</span>
          {ultima.texto}
        </div>
      )}
      {p.participantes.length > 0 && (
        <div className="kb-card-parts">
          {p.participantes.map((n, i) => (
            <span className="kb-part-tag" key={i}>{n}</span>
          ))}
        </div>
      )}
      <div className="kb-card-mover" onClick={(e) => e.stopPropagation()}>
        {p.finalizado ? (
          <button className="kb-reabrir" onClick={() => onFinalizar(p, false)}>↩ Reabrir</button>
        ) : naUltimaFase ? (
          <>
            <button onClick={() => onMover(p, -1)} disabled={!podeVoltar}>←</button>
            <button className="kb-finalizar" onClick={() => onFinalizar(p, true)}>✓ Finalizar</button>
          </>
        ) : (
          <>
            <button onClick={() => onMover(p, -1)} disabled={!podeVoltar}>←</button>
            <button onClick={() => onMover(p, 1)}>Avançar →</button>
          </>
        )}
      </div>
    </div>
  );
}

function ModalCadastro({ pessoas, onFechar, onSalvo }: { pessoas: Pessoa[]; onFechar: () => void; onSalvo: () => void }) {
  const [nome, setNome] = useState("");
  const [cliente, setCliente] = useState("");
  const [tipo, setTipo] = useState<"branding" | "visual" | "excepcional">("branding");
  const [participantes, setParticipantes] = useState<string[]>([]);
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
        body: JSON.stringify({ acao: "criar", nome, cliente, tipo, fases: fasesSel, participantes }),
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
          <div className="kb-label">Participantes do projeto</div>
          <div className="kb-parts-sel">
            {pessoas.length === 0 && <span className="kb-dica">Nenhuma pessoa cadastrada.</span>}
            {pessoas.map((pe) => {
              const on = participantes.includes(pe.id);
              return (
                <button
                  type="button"
                  key={pe.id}
                  className={`kb-part-chip ${on ? "on" : ""}`}
                  onClick={() => {
                    setParticipantes((prev) =>
                      prev.includes(pe.id) ? prev.filter((x) => x !== pe.id) : [...prev, pe.id]
                    );
                  }}
                >
                  {on ? "✓ " : ""}{pe.nome}
                </button>
              );
            })}
          </div>

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

function ModalDetalhe({ p, papel, pessoas, autor, onFechar, onSalvo }: { p: ProjetoDB; papel: "gestor" | "equipe" | null; pessoas: Pessoa[]; autor: string; onFechar: () => void; onSalvo: () => void }) {
  const [aba, setAba] = useState<"gestao" | "financeiro">("gestao");
  const [novaObs, setNovaObs] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState(false);
  const faseAtualNome = p.fases.find((f) => f.ordem === p.fase_atual)?.nome || "—";
  const ehGestor = papel === "gestor";

  // estados de edição
  const [edNome, setEdNome] = useState(p.nome);
  const [edCliente, setEdCliente] = useState(p.cliente || "");
  const [edFases, setEdFases] = useState(p.fases.map((f) => ({ id: f.id, nome: f.nome, inicio: f.inicio || "", fim: f.fim || "" })));
  const [edParts, setEdParts] = useState<string[]>(p.participantesIds);

  async function adicionarObs() {
    if (!novaObs.trim()) return;
    setSalvando(true);
    await fetch("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "obs_add", projeto_id: p.id, texto: novaObs, autor }),
    });
    setSalvando(false);
    setNovaObs("");
    onSalvo();
  }

  async function apagarObs(obsId: string) {
    if (!confirm("Apagar esta atualização?")) return;
    await fetch("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "obs_del", id: obsId }),
    });
    onSalvo();
  }

  async function salvarEdicao() {
    if (!edNome.trim()) return;
    setSalvando(true);
    await fetch("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "editar", id: p.id, nome: edNome, cliente: edCliente, fases: edFases, participantes: edParts }),
    });
    setSalvando(false);
    onSalvo();
  }

  async function apagar() {
    if (!confirm("Apagar este projeto? Esta ação não pode ser desfeita.")) return;
    setSalvando(true);
    await fetch("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "apagar", id: p.id }),
    });
    setSalvando(false);
    onSalvo();
  }

  return (
    <div className="kb-overlay" onClick={onFechar}>
      <div className="kb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="kb-modal-head">
          <h2>{editando ? "Editar projeto" : p.nome}</h2>
          <button className="kb-modal-x" onClick={onFechar}>×</button>
        </div>
        <div className="kb-modal-body">
          {!editando && (
            <div className="kb-abas">
              <button className={`kb-aba ${aba === "gestao" ? "on" : ""}`} onClick={() => setAba("gestao")}>Gestão</button>
              {ehGestor && (
                <button className={`kb-aba ${aba === "financeiro" ? "on" : ""}`} onClick={() => setAba("financeiro")}>Financeiro</button>
              )}
            </div>
          )}

          {editando ? (
            <>
              <label className="kb-label">Nome do projeto
                <input className="kb-input" value={edNome} onChange={(e) => setEdNome(e.target.value)} />
              </label>
              <label className="kb-label">Cliente
                <input className="kb-input" value={edCliente} onChange={(e) => setEdCliente(e.target.value)} />
              </label>
              <div className="kb-label">Participantes</div>
              <div className="kb-parts-sel">
                {pessoas.map((pe) => {
                  const on = edParts.includes(pe.id);
                  return (
                    <button type="button" key={pe.id} className={`kb-part-chip ${on ? "on" : ""}`}
                      onClick={() => setEdParts((prev) => prev.includes(pe.id) ? prev.filter((x) => x !== pe.id) : [...prev, pe.id])}>
                      {on ? "✓ " : ""}{pe.nome}
                    </button>
                  );
                })}
              </div>
              <div className="kb-label">Datas das fases</div>
              <div className="kb-fases-cad">
                <div className="kb-datas-labels"><span>Início</span><span>Fim/apres.</span></div>
                {edFases.map((f, i) => (
                  <div className="kb-fase-cad ativa" key={f.id}>
                    <span></span>
                    <span className="kb-fase-cad-nome">{f.nome}</span>
                    <input type="date" value={f.inicio} onChange={(e) => { const n = [...edFases]; n[i] = { ...n[i], inicio: e.target.value }; setEdFases(n); }} />
                    <input type="date" value={f.fim} onChange={(e) => { const n = [...edFases]; n[i] = { ...n[i], fim: e.target.value }; setEdFases(n); }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "space-between" }}>
                <button className="kb-btn-ghost" onClick={() => setEditando(false)}>Voltar</button>
                <button className="kb-btn-primary" onClick={salvarEdicao} disabled={salvando}>
                  {salvando ? "Salvando…" : "Salvar alterações"}
                </button>
              </div>
            </>
          ) : aba === "gestao" ? (
            <>
              <div className="kb-det-info">
                <strong>{TIPO_LABEL[p.tipo]}</strong> · Cliente: {p.cliente || "—"}
              </div>
              {p.participantes.length > 0 && (
                <div className="kb-det-parts">
                  {p.participantes.map((n, i) => <span className="kb-part-tag" key={i}>{n}</span>)}
                </div>
              )}
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
                <div className="kb-det-fases-titulo">Atualizações do projeto</div>
                <div className="kb-obs-atual">Fase atual: <strong>{faseAtualNome}</strong></div>

                <div className="kb-obs-nova">
                  <textarea className="kb-textarea" value={novaObs} onChange={(e) => setNovaObs(e.target.value)}
                    placeholder="Escreva uma atualização... ex.: identidade apresentada, aguardando aprovação do cliente." />
                  <button className="kb-btn-primary" onClick={adicionarObs} disabled={salvando} style={{ marginTop: 10 }}>
                    {salvando ? "Adicionando..." : "Adicionar atualização"}
                  </button>
                </div>

                <div className="kb-obs-historico">
                  {p.observacoes.length === 0 && <p className="kb-dica">Nenhuma atualização ainda.</p>}
                  {p.observacoes.map((o) => (
                    <div className="kb-obs-item" key={o.id}>
                      <div className="kb-obs-item-topo">
                        <span className="kb-obs-data">{dataHora(o.criado_em)}</span>
                        <button className="kb-obs-apagar" onClick={() => apagarObs(o.id)}>apagar</button>
                      </div>
                      <div className="kb-obs-texto">{o.texto}</div>
                      {o.autor && o.autor !== "migrado" && <div className="kb-obs-autor">{o.autor}</div>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="kb-det-acoes">
                <button className="kb-link-edit" onClick={() => setEditando(true)}>Editar projeto</button>
                {ehGestor && <button className="kb-link-apagar" onClick={apagar}>Apagar projeto</button>}
              </div>
            </>
          ) : (
            <Financeiro projetoId={p.id} onSalvo={onSalvo} />
          )}
        </div>
      </div>
    </div>
  );
}
