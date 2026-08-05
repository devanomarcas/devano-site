"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PILARES = ["Método", "Categoria", "Ponto de vista", "Caso"];

export interface PostEdicao {
  slug: string;
  titulo: string;
  texto: string;
  resumo: string;
  pilar: string;
  capa: string;
  data: string;
}

export default function EditorPost({
  postInicial,
  onFechar,
}: {
  postInicial?: PostEdicao;
  onFechar?: () => void;
}) {
  const router = useRouter();
  const editando = Boolean(postInicial?.slug);

  const [titulo, setTitulo] = useState(postInicial?.titulo ?? "");
  const [texto, setTexto] = useState(postInicial?.texto ?? "");
  const [resumo, setResumo] = useState(postInicial?.resumo ?? "");
  const [pilar, setPilar] = useState(postInicial?.pilar ?? "Método");
  const [capa, setCapa] = useState(postInicial?.capa ?? "");
  const [data, setData] = useState(
    postInicial?.data ?? new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!titulo.trim() || !texto.trim()) {
      setStatus("Preencha o título e o texto.");
      return;
    }
    setSalvando(true);
    setStatus(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          texto,
          resumo,
          pilar,
          capa,
          data,
          slugOriginal: postInicial?.slug ?? "",
        }),
      });
      const dados = await res.json();
      if (res.ok) {
        setStatus(
          editando
            ? "Texto atualizado e publicado."
            : "Texto publicado no blog."
        );
        if (!editando) {
          setTitulo("");
          setTexto("");
          setResumo("");
          setCapa("");
        }
        router.refresh();
        if (onFechar) setTimeout(onFechar, 900);
      } else {
        setStatus(`Erro: ${dados.error ?? "não foi possível salvar."}`);
      }
    } catch {
      setStatus("Erro de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="editor-nl">
      <div className="editor-campos">
        <label className="editor-label">
          Título
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: Por que o nome vem depois da estratégia"
            className="editor-input"
          />
        </label>

        <label className="editor-label">
          Resumo
          <input
            type="text"
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            placeholder="Uma ou duas frases que aparecem na listagem"
            className="editor-input"
          />
        </label>

        <div className="editor-linha">
          <label className="editor-label">
            Pilar
            <select
              value={pilar}
              onChange={(e) => setPilar(e.target.value)}
              className="editor-input"
            >
              {PILARES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="editor-label">
            Data
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="editor-input"
            />
          </label>
        </div>

        <label className="editor-label">
          Capa (opcional)
          <input
            type="text"
            value={capa}
            onChange={(e) => setCapa(e.target.value)}
            placeholder="/editorial/arcos.jpg"
            className="editor-input"
          />
          <span className="editor-dica">
            Caminho de uma imagem que já está no site. Deixe vazio para não ter capa.
          </span>
        </label>

        <label className="editor-label">
          Texto
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={
              "Escreva aqui.\n\nSepare os parágrafos com uma linha em branco.\n\n## Assim você cria um subtítulo\n\n> Assim você cria uma citação."
            }
            className="editor-textarea"
            rows={20}
          />
          <span className="editor-dica">
            Linha em branco separa parágrafos. Use <code>## </code> para
            subtítulo, <code>&gt; </code> para citação e <code>**negrito**</code>.
          </span>
        </label>
      </div>

      <div className="editor-acoes">
        <button
          type="button"
          onClick={salvar}
          className="btn btn-primary"
          disabled={salvando}
        >
          {salvando
            ? "Publicando…"
            : editando
            ? "Atualizar texto"
            : "Publicar no blog"}
        </button>
        {onFechar && (
          <button type="button" onClick={onFechar} className="btn btn-ghost">
            Cancelar
          </button>
        )}
      </div>

      {status && <p className="editor-status">{status}</p>}
    </div>
  );
}
