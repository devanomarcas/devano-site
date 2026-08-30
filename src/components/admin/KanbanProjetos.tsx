"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  observacao: string | null;
  fases: FaseDB[];
  participantes: string[];
  participantesIds: string[];
  observacoes: ObsDB[];
  abertura: ItemAbertura[];
  aberturaLiberada: boolean;
  aberturaJustificativa: string | null;
};

export type ItemAbertura = {
  chave: string;
  feito: boolean;
  valor: string | null;
  confirmado: boolean;
  autor: string | null;
  feito_em: string | null;
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

// largura de uma coluna + o espaço entre elas, usado pelas setas de rolagem
const PASSO_COLUNA = 264;

// ————————————————————————————————————————————————————————————
// Checklist de abertura de projeto (executivo de contas)
//
// Os dois primeiros itens não são clicáveis: eles já foram cumpridos
// pelo próprio ato de cadastrar o projeto. O de cronograma marca sozinho
// quando todas as fases tiverem início e fim preenchidos.
// ————————————————————————————————————————————————————————————
type DefAbertura = {
  chave: string;
  titulo: string;
  ajuda?: string;
  auto?: "card" | "cronograma";
  campo?: "texto" | "data" | "datahora";
  rotulo?: string;
  confirmacao?: string;
};

const ABERTURA: DefAbertura[] = [
  {
    chave: "card",
    titulo: "Card do projeto aberto no sistema",
    auto: "card",
    ajuda: "Cumprido no momento em que você cadastrou o projeto.",
  },
  {
    chave: "cronograma",
    titulo: "Cronograma do projeto criado",
    auto: "cronograma",
    ajuda: "Marca sozinho quando todas as fases tiverem início e fim preenchidos.",
  },
  {
    chave: "grupo",
    titulo: "Grupo criado com o time do projeto",
    campo: "texto",
    rotulo: "Link ou nome do grupo",
  },
  {
    chave: "aviso",
    titulo: "Cliente avisada de que será inserida no grupo",
    campo: "data",
    rotulo: "Data do contato",
  },
  {
    chave: "boasvindas",
    titulo: "Boas-vindas dadas no grupo e equipe apresentada",
    campo: "data",
    rotulo: "Data",
  },
  {
    chave: "reuniao",
    titulo: "Reunião de pontapé inicial marcada com a cliente",
    campo: "datahora",
    rotulo: "Data e hora da reunião",
  },
  {
    chave: "briefing",
    titulo: "Formulário de briefing criado e adequado ao projeto",
    campo: "texto",
    rotulo: "Link do formulário",
    confirmacao: "Revisei o formulário inteiro e não há menção a outros clientes.",
  },
];

const NOTA_MODALIDADE: Record<string, string> = {
  branding: "Branding completo. Confira se este projeto tem naming antes de montar as datas.",
  visual: "Comunicação visual. Cinco fases, sem etapa de naming.",
  excepcional: "Excepcional. As fases são livres, defina-as conforme o escopo contratado.",
};

function autoFeito(def: DefAbertura, p: ProjetoDB): boolean {
  if (def.auto === "card") return true;
  if (def.auto === "cronograma") {
    return p.fases.length > 0 && p.fases.every((f) => !!f.inicio && !!f.fim);
  }
  return false;
}

function itemCumprido(def: DefAbertura, it: ItemAbertura | undefined, p: ProjetoDB): boolean {
  if (def.auto) return autoFeito(def, p);
  if (!it?.feito) return false;
  if (def.confirmacao && !it.confirmado) return false;
  return true;
}

export function statusAbertura(p: ProjetoDB) {
  const mapa = new Map(p.abertura.map((i) => [i.chave, i]));
  const pendentes: string[] = [];
  let feitos = 0;
  ABERTURA.forEach((def) => {
    if (itemCumprido(def, mapa.get(def.chave), p)) feitos++;
    else pendentes.push(def.titulo);
  });
  return { feitos, total: ABERTURA.length, completa: pendentes.length === 0, pendentes };
}

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
  const [travado, setTravado] = useState<ProjetoDB | null>(null);

  // rolagem lateral do quadro
  const boardRef = useRef<HTMLDivElement | null>(null);
  const trilhoRef = useRef<HTMLDivElement | null>(null);
  const [barra, setBarra] = useState({ larg: 1, pos: 0 });
  const [podeEsq, setPodeEsq] = useState(false);
  const [podeDir, setPodeDir] = useState(false);

  const tipos: [string, string][] = [
    ["todos", "Todos"], ["branding", "Branding"],
    ["visual", "Comunicação visual"], ["excepcional", "Excepcionais"],
  ];

  // os dois filtros valem ao mesmo tempo: tipo E pessoa
  const visiveis = projetos.filter((p) => {
    const okTipo = filtro === "todos" || p.tipo === filtro;
    const okPessoa = !filtroPessoa || p.participantes.includes(filtroPessoa);
    return okTipo && okPessoa;
  });

  const temFiltro = filtro !== "todos" || filtroPessoa !== "";

  // com um tipo escolhido, as colunas ganham o nome real das fases —
  // mesmo que haja também um filtro de pessoa aplicado.
  let colunas: string[];
  if (filtro === "todos") {
    const maxF = Math.max(1, ...visiveis.map((p) => p.fases.length || 0));
    colunas = Array.from({ length: maxF }, (_, i) => `Etapa ${i + 1}`);
  } else {
    colunas = FASES_PADRAO[filtro];
  }

  // Em que coluna cada cartão entra.
  //
  // Um projeto pode ter pulado fases no cadastro (uma marca sem naming, por
  // exemplo). Nesse caso a posição da fase dentro do projeto — o fase_atual —
  // não corresponde à posição dela na lista completa do tipo: a 6ª fase de um
  // projeto sem naming é a 7ª da lista padrão. Por isso, quando as colunas têm
  // nome de fase, o encaixe é feito pelo NOME da fase atual, não pelo número.
  // Só no modo "Todos", em que as colunas são "Etapa 1, 2, 3…", o número vale.
  const colunaDoProjeto = new Map<string, number>();
  visiveis.forEach((p) => {
    const atual = p.fases.find((f) => f.ordem === p.fase_atual);
    let idx = -1;
    if (filtro !== "todos" && atual) idx = colunas.indexOf(atual.nome);
    if (idx < 0) idx = Math.min(Math.max(p.fase_atual, 0), colunas.length - 1);
    colunaDoProjeto.set(p.id, idx);
  });

  const medir = useCallback(() => {
    const el = boardRef.current;
    if (!el) { setPodeEsq(false); setPodeDir(false); return; }
    const total = el.scrollWidth || 1;
    setBarra({ larg: Math.min(1, el.clientWidth / total), pos: el.scrollLeft / total });
    setPodeEsq(el.scrollLeft > 4);
    setPodeDir(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    medir();
    const el = boardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => medir());
    ro.observe(el);
    window.addEventListener("resize", medir);
    return () => { ro.disconnect(); window.removeEventListener("resize", medir); };
  }, [medir, colunas.length, visiveis.length]);

  // arrastar a barra de cima move o quadro junto
  function arrastarBarra(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const trilho = trilhoRef.current;
    const board = boardRef.current;
    if (!trilho || !board) return;
    const alvo = e.currentTarget;
    const xInicial = e.clientX;
    const scrollInicial = board.scrollLeft;
    const razao = board.scrollWidth / (trilho.clientWidth || 1);
    const aoMover = (ev: PointerEvent) => {
      board.scrollLeft = scrollInicial + (ev.clientX - xInicial) * razao;
    };
    const aoSoltar = (ev: PointerEvent) => {
      alvo.removeEventListener("pointermove", aoMover);
      alvo.removeEventListener("pointerup", aoSoltar);
      alvo.removeEventListener("pointercancel", aoSoltar);
      try { alvo.releasePointerCapture(ev.pointerId); } catch { /* ignora */ }
    };
    alvo.setPointerCapture(e.pointerId);
    alvo.addEventListener("pointermove", aoMover);
    alvo.addEventListener("pointerup", aoSoltar);
    alvo.addEventListener("pointercancel", aoSoltar);
  }

  // clicar em um ponto da barra salta o quadro para lá
  function saltarNoTrilho(e: React.PointerEvent<HTMLDivElement>) {
    const trilho = trilhoRef.current;
    const board = boardRef.current;
    if (!trilho || !board) return;
    const r = trilho.getBoundingClientRect();
    const fracao = (e.clientX - r.left) / (r.width || 1);
    board.scrollTo({ left: fracao * board.scrollWidth - board.clientWidth / 2, behavior: "smooth" });
  }

  function rolarColuna(dir: number) {
    boardRef.current?.scrollBy({ left: dir * PASSO_COLUNA, behavior: "smooth" });
  }

  async function mover(p: ProjetoDB, dir: number) {
    // Avançar exige a abertura concluída. Voltar é sempre livre.
    if (dir > 0 && !p.aberturaLiberada && !statusAbertura(p).completa) {
      setTravado(p);
      return;
    }
    const nova = Math.max(0, Math.min(p.fases.length - 1, p.fase_atual + dir));
    if (nova === p.fase_atual) return;
    await fetch("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "mover", id: p.id, novaFase: nova }),
    });
    router.refresh();
  }

  const rolavel = podeEsq || podeDir;

  return (
    <div className="kb">
      <div className="kb-topo">
        <div className="kb-filtros">
          {tipos.map(([v, l]) => (
            <button key={v} className={`kb-chip ${filtro === v ? "on" : ""}`}
              onClick={() => setFiltro(v)}>
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
            onClick={() => setFiltroPessoa(filtroPessoa === pe.nome ? "" : pe.nome)}>
            {pe.nome}
          </button>
        ))}
      </div>

      <div className="kb-resumo-filtros">
        <span className="kb-resumo-txt">
          {temFiltro ? (
            <>
              Mostrando <strong>{visiveis.length}</strong> de {projetos.length} projetos ·{" "}
              {filtro === "todos" ? "todos os tipos" : TIPO_LABEL[filtro]}
              {filtroPessoa ? ` · ${filtroPessoa}` : ""}
            </>
          ) : (
            <>Mostrando todos os <strong>{projetos.length}</strong> projetos.</>
          )}
        </span>
        {temFiltro && (
          <button className="kb-chip limpar" onClick={() => { setFiltro("todos"); setFiltroPessoa(""); }}>
            × limpar filtros
          </button>
        )}
      </div>

      {visiveis.length === 0 ? (
        <p className="kb-vazio-geral">
          {temFiltro
            ? "Nenhum projeto com essa combinação de filtros. Troque o tipo ou a pessoa, ou clique em “limpar filtros”."
            : "Nenhum projeto ainda. Clique em “+ Novo projeto” para começar."}
        </p>
      ) : (
        <div className="kb-board-wrap">
          {rolavel && (
            <>
              <div className="kb-rolagem">
                <span className="kb-rolagem-dica">↔ Role para o lado para ver todas as etapas</span>
                <div className="kb-rolagem-setas">
                  <button type="button" onClick={() => rolarColuna(-1)} disabled={!podeEsq} aria-label="Etapas anteriores">←</button>
                  <button type="button" onClick={() => rolarColuna(1)} disabled={!podeDir} aria-label="Próximas etapas">→</button>
                </div>
              </div>
              <div className="kb-trilho" ref={trilhoRef} onPointerDown={saltarNoTrilho}
                role="scrollbar" aria-label="Rolagem lateral do quadro" aria-orientation="horizontal">
                <div className="kb-trilho-barra" onPointerDown={arrastarBarra}
                  style={{ width: `${Math.max(barra.larg * 100, 8)}%`, left: `${barra.pos * 100}%` }} />
              </div>
            </>
          )}

          <div className={`kb-board-area${podeEsq ? " corte-esq" : ""}${podeDir ? " corte-dir" : ""}`}>
            <div className="kb-board" ref={boardRef}
              onScroll={medir}>
              {colunas.map((nomeCol, idx) => {
                const naColuna = visiveis.filter((p) => colunaDoProjeto.get(p.id) === idx);
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
          </div>
        </div>
      )}

      {modalCad && <ModalCadastro pessoas={pessoas} onFechar={() => setModalCad(false)} onSalvo={() => { setModalCad(false); router.refresh(); }} />}
      {detalhe && <ModalDetalhe p={detalhe} papel={papel} pessoas={pessoas} autor={autor} onFechar={() => { setDetalhe(null); router.refresh(); }} onSalvo={() => { setDetalhe(null); router.refresh(); }} />}
      {travado && (
        <ModalTrava
          p={travado}
          autor={autor}
          onFechar={() => setTravado(null)}
          onAbrirProjeto={() => { const alvo = travado; setTravado(null); setDetalhe(alvo); }}
          onLiberado={() => { setTravado(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

function Cartao({ p, onAbrir, onMover }: { p: ProjetoDB; onAbrir: () => void; onMover: (p: ProjetoDB, dir: number) => void }) {
  const ab = statusAbertura(p);
  const aberturaPendente = !p.aberturaLiberada && !ab.completa;
  const faseAtual = p.fases.find((f) => f.ordem === p.fase_atual);
  const periodo = faseAtual ? `${dCurto(faseAtual.inicio)} – ${dCurto(faseAtual.fim)}` : "—";
  const podeVoltar = p.fase_atual > 0;
  const podeAvancar = p.fase_atual < p.fases.length - 1;
  const nUpdates = p.observacoes.length;
  const ultima = nUpdates > 0 ? p.observacoes[0] : null; // já vem ordenado desc
  return (
    <div className={`kb-card ${p.tipo}`} onClick={onAbrir}>
      <div className="kb-card-tipo">{TIPO_LABEL[p.tipo]}</div>
      <div className="kb-card-nome">{p.nome}</div>
      {aberturaPendente && (
        <div className="kb-selo-abertura">Abertura {ab.feitos}/{ab.total}</div>
      )}
      {faseAtual && <div className="kb-card-fase">{faseAtual.nome}</div>}
      <div className="kb-card-meta">
        <span className="kb-card-cliente">{p.cliente || "—"}</span>
        <span className="kb-card-periodo">📅 {periodo}</span>
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
        <button onClick={() => onMover(p, -1)} disabled={!podeVoltar}>←</button>
        <button
          className={aberturaPendente ? "travado" : ""}
          title={aberturaPendente ? "Conclua o checklist de abertura para avançar" : undefined}
          onClick={() => onMover(p, 1)}
          disabled={!podeAvancar}
        >
          {aberturaPendente ? "Avançar" : "Avançar →"}
        </button>
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
  const abInicial = statusAbertura(p);
  const aberturaPendente = !p.aberturaLiberada && !abInicial.completa;
  const [aba, setAba] = useState<"gestao" | "abertura" | "financeiro">(
    aberturaPendente ? "abertura" : "gestao"
  );
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
              <button className={`kb-aba ${aba === "abertura" ? "on" : ""}`} onClick={() => setAba("abertura")}>
                Abertura
                {aberturaPendente && <span className="kb-aba-selo">{abInicial.feitos}/{abInicial.total}</span>}
              </button>
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
          ) : aba === "abertura" ? (
            <AbaAbertura p={p} autor={autor} />
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

// ————————————————————————————————————————————————————————————
// Aba de abertura: o checklist do executivo de contas
// ————————————————————————————————————————————————————————————
function AbaAbertura({ p, autor }: { p: ProjetoDB; autor: string }) {
  const [itens, setItens] = useState<Record<string, ItemAbertura>>(() => {
    const r: Record<string, ItemAbertura> = {};
    p.abertura.forEach((i) => { r[i.chave] = i; });
    return r;
  });
  const [salvando, setSalvando] = useState<string | null>(null);

  function vazio(chave: string): ItemAbertura {
    return { chave, feito: false, valor: null, confirmado: false, autor: null, feito_em: null };
  }

  async function salvar(chave: string, mudanca: Partial<ItemAbertura>) {
    const novo = { ...(itens[chave] || vazio(chave)), ...mudanca };
    setItens((prev) => ({ ...prev, [chave]: novo }));
    setSalvando(chave);
    await fetch("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        acao: "abertura_set",
        projeto_id: p.id,
        chave,
        feito: novo.feito,
        valor: novo.valor,
        confirmado: novo.confirmado,
        autor,
      }),
    });
    setSalvando(null);
  }

  const simulado: ProjetoDB = { ...p, abertura: Object.values(itens) };
  const st = statusAbertura(simulado);

  return (
    <div className="ab">
      <div className={`ab-barra ${st.completa ? "ok" : ""}`}>
        <div className="ab-barra-txt">
          {st.completa
            ? "Abertura concluída. O projeto já pode avançar de fase."
            : `Abertura ${st.feitos} de ${st.total}. Enquanto não estiver completa, o projeto não avança de fase.`}
        </div>
        <div className="ab-barra-trilho">
          <div className="ab-barra-cheio" style={{ width: `${(st.feitos / st.total) * 100}%` }} />
        </div>
      </div>

      {p.aberturaLiberada && p.aberturaJustificativa && (
        <div className="ab-liberado">
          <strong>Avanço liberado sem a abertura completa.</strong> {p.aberturaJustificativa}
        </div>
      )}

      <div className="ab-lista">
        {ABERTURA.map((def) => {
          const it = itens[def.chave] || vazio(def.chave);
          const auto = !!def.auto;
          const feito = itemCumprido(def, it, p);
          return (
            <div className={`ab-item ${feito ? "feito" : ""} ${auto ? "auto" : ""}`} key={def.chave}>
              <button
                type="button"
                className={`ab-check ${feito ? "on" : ""}`}
                disabled={auto}
                aria-label={def.titulo}
                onClick={() => salvar(def.chave, { feito: !it.feito })}
              >
                {feito ? "✓" : ""}
              </button>

              <div className="ab-corpo">
                <div className="ab-titulo">{def.titulo}</div>

                {def.auto === "cronograma" && (
                  <div className="ab-nota">{NOTA_MODALIDADE[p.tipo]}</div>
                )}
                {def.ajuda && <div className="ab-ajuda">{def.ajuda}</div>}

                {def.campo && (
                  <label className="ab-campo">
                    <span>{def.rotulo}</span>
                    <input
                      type={def.campo === "data" ? "date" : def.campo === "datahora" ? "datetime-local" : "text"}
                      value={it.valor || ""}
                      placeholder={def.campo === "texto" ? "Cole aqui" : undefined}
                      onChange={(e) => salvar(def.chave, { valor: e.target.value })}
                    />
                  </label>
                )}

                {def.confirmacao && (
                  <label className="ab-confirma">
                    <input
                      type="checkbox"
                      checked={!!it.confirmado}
                      onChange={() => salvar(def.chave, { confirmado: !it.confirmado })}
                    />
                    <span>{def.confirmacao}</span>
                  </label>
                )}

                {!auto && it.feito && it.autor && (
                  <div className="ab-assinatura">
                    marcado por {it.autor}{it.feito_em ? ` em ${dataHora(it.feito_em)}` : ""}
                  </div>
                )}
                {salvando === def.chave && <div className="ab-assinatura">salvando…</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————
// Aviso de trava: aparece ao tentar avançar com a abertura incompleta
// ————————————————————————————————————————————————————————————
function ModalTrava({ p, autor, onFechar, onAbrirProjeto, onLiberado }: {
  p: ProjetoDB; autor: string; onFechar: () => void;
  onAbrirProjeto: () => void; onLiberado: () => void;
}) {
  const st = statusAbertura(p);
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function liberar() {
    if (motivo.trim().length < 10) {
      setErro("Escreva o motivo com pelo menos uma frase.");
      return;
    }
    setErro(null);
    setSalvando(true);
    const res = await fetch("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "abertura_liberar", id: p.id, justificativa: motivo, autor }),
    });
    setSalvando(false);
    if (res.ok) onLiberado();
    else setErro("Não foi possível liberar. Tente de novo.");
  }

  return (
    <div className="kb-overlay" onClick={onFechar}>
      <div className="kb-modal estreito" onClick={(e) => e.stopPropagation()}>
        <div className="kb-modal-head">
          <h2>Abertura incompleta</h2>
          <button className="kb-modal-x" onClick={onFechar}>×</button>
        </div>
        <div className="kb-modal-body">
          <p className="ab-trava-lead">
            <strong>{p.nome}</strong> ainda tem {st.pendentes.length}{" "}
            {st.pendentes.length === 1 ? "item pendente" : "itens pendentes"} no checklist de
            abertura. O caminho normal é concluir a abertura antes de avançar de fase.
          </p>
          <ul className="ab-pendentes">
            {st.pendentes.map((t, i) => <li key={i}>{t}</li>)}
          </ul>

          <button className="kb-btn-primary" style={{ width: "100%" }} onClick={onAbrirProjeto}>
            Concluir a abertura agora
          </button>

          <div className="ab-excecao">
            <div className="kb-det-fases-titulo" style={{ marginTop: 0 }}>Se for mesmo uma exceção</div>
            <p className="kb-dica" style={{ marginTop: 0 }}>
              Escreva o motivo. Ele fica registrado no projeto e entra no histórico, visível para o gestor.
            </p>
            <textarea
              className="kb-textarea"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: cliente antecipou a reunião para hoje, o formulário será enviado ainda esta tarde."
            />
            {erro && <p className="kb-erro">{erro}</p>}
            <button className="kb-btn-ghost" style={{ marginTop: 10 }} onClick={liberar} disabled={salvando}>
              {salvando ? "Liberando…" : "Avançar mesmo assim"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
