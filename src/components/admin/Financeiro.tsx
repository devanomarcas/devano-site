"use client";

import { useEffect, useState } from "react";

type Custo = { funcao: string; valor: number };
type Parcela = { valor: number; vencimento: string; recebida: boolean };

const fmt = (v: number) => "R$ " + Math.round(v).toLocaleString("pt-BR");

export default function Financeiro({ projetoId, onSalvo }: { projetoId: string; onSalvo: () => void }) {
  const [carregando, setCarregando] = useState(true);
  const [total, setTotal] = useState<number>(0);
  const [custos, setCustos] = useState<Custo[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/financeiro?projeto_id=${projetoId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setTotal(d.total || 0);
          setCustos((d.custos || []).map((c: any) => ({ funcao: c.funcao || "", valor: Number(c.valor) || 0 })));
          setParcelas((d.parcelas || []).map((p: any) => ({
            valor: Number(p.valor) || 0,
            vencimento: p.vencimento || "",
            recebida: !!p.recebida,
          })));
        }
      })
      .finally(() => setCarregando(false));
  }, [projetoId]);

  const custosSoma = custos.reduce((s, c) => s + (c.valor || 0), 0);
  const admin = total * 0.15;
  const liquido = total - custosSoma - admin;
  const faturado = parcelas.reduce((s, p) => s + (p.valor || 0), 0);
  const recebido = parcelas.filter((p) => p.recebida).reduce((s, p) => s + (p.valor || 0), 0);
  const aReceber = faturado - recebido;

  async function salvar() {
    setSalvando(true);
    setMsg(null);
    const res = await fetch("/api/financeiro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projeto_id: projetoId, total, custos, parcelas }),
    });
    setSalvando(false);
    if (res.ok) {
      setMsg("Financeiro salvo.");
      onSalvo();
    } else {
      const d = await res.json();
      setMsg(d.error || "Erro ao salvar.");
    }
  }

  if (carregando) return <p className="kb-dica" style={{ padding: "20px 0" }}>Carregando financeiro…</p>;

  return (
    <div>
      <div className="kb-fin-restrito">🔒 Visível apenas para você (gestor).</div>

      <label className="kb-label">Valor total do projeto
        <input className="kb-input" type="number" value={total || ""} placeholder="0"
          onChange={(e) => setTotal(parseFloat(e.target.value) || 0)} />
      </label>

      <div className="kb-fin-sec-head">
        <span>Custos por função</span>
        <button className="kb-link-add" onClick={() => setCustos([...custos, { funcao: "", valor: 0 }])}>+ adicionar</button>
      </div>
      {custos.length === 0 && <p className="kb-dica">Nenhum custo lançado.</p>}
      {custos.map((c, i) => (
        <div className="kb-fin-linha" key={i}>
          <input className="kb-input" style={{ flex: 2, margin: 0 }} value={c.funcao} placeholder="Função"
            onChange={(e) => { const n = [...custos]; n[i] = { ...n[i], funcao: e.target.value }; setCustos(n); }} />
          <input className="kb-input" style={{ flex: 1, margin: 0 }} type="number" value={c.valor || ""} placeholder="Valor"
            onChange={(e) => { const n = [...custos]; n[i] = { ...n[i], valor: parseFloat(e.target.value) || 0 }; setCustos(n); }} />
          <button className="kb-lixo" onClick={() => setCustos(custos.filter((_, j) => j !== i))}>🗑</button>
        </div>
      ))}

      <div className="kb-fin-sec-head">
        <span>Recebimento</span>
        <button className="kb-link-add" onClick={() => setParcelas([...parcelas, { valor: 0, vencimento: "", recebida: false }])}>+ parcela</button>
      </div>
      {parcelas.length === 0 && <p className="kb-dica">Nenhuma parcela.</p>}
      {parcelas.map((pa, i) => (
        <div className="kb-fin-linha" key={i}>
          <span className={`kb-parc-num ${pa.recebida ? "on" : ""}`}>{i + 1}</span>
          <input className="kb-input" style={{ flex: 1, margin: 0 }} type="number" value={pa.valor || ""} placeholder="Valor"
            onChange={(e) => { const n = [...parcelas]; n[i] = { ...n[i], valor: parseFloat(e.target.value) || 0 }; setParcelas(n); }} />
          <input className="kb-input" style={{ flex: 1, margin: 0 }} type="date" value={pa.vencimento}
            onChange={(e) => { const n = [...parcelas]; n[i] = { ...n[i], vencimento: e.target.value }; setParcelas(n); }} />
          <button className={`kb-receb ${pa.recebida ? "on" : ""}`}
            onClick={() => { const n = [...parcelas]; n[i] = { ...n[i], recebida: !n[i].recebida }; setParcelas(n); }}>
            {pa.recebida ? "✓ Recebida" : "Receber"}
          </button>
          <button className="kb-lixo" onClick={() => setParcelas(parcelas.filter((_, j) => j !== i))}>🗑</button>
        </div>
      ))}

      <div className="kb-receb-resumo">
        <div className="kb-receb-box faturado"><span>Faturado</span><strong>{fmt(faturado)}</strong></div>
        <div className="kb-receb-box recebido"><span>Recebido</span><strong>{fmt(recebido)}</strong></div>
        <div className="kb-receb-box areceber"><span>A receber</span><strong>{fmt(aReceber)}</strong></div>
      </div>

      <div className="kb-fin-resumo">
        <div className="kb-fin-resumo-linha"><span>Valor total</span><span>{fmt(total)}</span></div>
        <div className="kb-fin-resumo-linha"><span>− Custos de pessoal</span><span>{fmt(custosSoma)}</span></div>
        <div className="kb-fin-resumo-linha"><span>− Administrativo (15%)</span><span>{fmt(admin)}</span></div>
        <div className="kb-fin-resumo-linha total"><span>Valor líquido</span><span>{fmt(liquido)}</span></div>
      </div>

      {msg && <p className="kb-dica" style={{ marginTop: 12 }}>{msg}</p>}
      <button className="kb-btn-primary" onClick={salvar} disabled={salvando} style={{ marginTop: 14 }}>
        {salvando ? "Salvando…" : "Salvar financeiro"}
      </button>
    </div>
  );
}
