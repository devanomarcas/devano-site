"use client";

import { useState } from "react";

export default function EditorNewsletter({
  totalInscritos,
  emailUsuario,
}: {
  totalInscritos: number;
  emailUsuario: string;
}) {
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [emailTeste, setEmailTeste] = useState(emailUsuario);
  const [status, setStatus] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<"teste" | "envio" | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  async function verPrevia() {
    const janela = window.open("", "_blank");
    if (!janela) return;
    janela.document.write("Carregando prévia…");
    const res = await fetch("/api/newsletter/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: titulo || "Sem título", texto }),
    });
    const html = await res.text();
    janela.document.open();
    janela.document.write(html);
    janela.document.close();
  }

  async function enviar(modo: "teste" | "envio") {
    if (!titulo.trim() || !texto.trim()) {
      setStatus("Preencha o título e o texto antes de enviar.");
      return;
    }
    setCarregando(modo);
    setStatus(null);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, texto, modo, emailTeste }),
      });
      const data = await res.json();
      if (res.ok) {
        if (modo === "teste") {
          setStatus(`Teste enviado para ${emailTeste}. Confira sua caixa de entrada.`);
        } else {
          setStatus(
            `Marketeiros enviada para ${data.enviados} ${
              data.enviados === 1 ? "inscrito" : "inscritos"
            }.${data.falhas ? ` (${data.falhas} falha(s))` : ""}`
          );
          setTitulo("");
          setTexto("");
        }
      } else {
        setStatus(`Erro: ${data.error ?? "não foi possível enviar."}`);
      }
    } catch {
      setStatus("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(null);
      setConfirmando(false);
    }
  }

  return (
    <div className="editor-nl">
      <div className="editor-campos">
        <label className="editor-label">
          Título da edição
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: A marca que você não planejou também comunica"
            className="editor-input"
          />
        </label>

        <label className="editor-label">
          Texto
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={
              "Escreva aqui.\n\nSepare os parágrafos com uma linha em branco.\n\n## Assim você cria um subtítulo\n\n> Assim você cria uma citação em destaque."
            }
            className="editor-textarea"
            rows={18}
          />
          <span className="editor-dica">
            Linha em branco separa parágrafos. Use <code>## </code> para
            subtítulo e <code>&gt; </code> para citação.
          </span>
        </label>
      </div>

      <div className="editor-acoes">
        <button type="button" onClick={verPrevia} className="btn btn-ghost">
          Ver prévia
        </button>

        <div className="editor-teste">
          <input
            type="email"
            value={emailTeste}
            onChange={(e) => setEmailTeste(e.target.value)}
            placeholder="e-mail para teste"
            className="editor-input-inline"
          />
          <button
            type="button"
            onClick={() => enviar("teste")}
            className="btn btn-ghost"
            disabled={carregando !== null}
          >
            {carregando === "teste" ? "Enviando…" : "Enviar teste"}
          </button>
        </div>

        {!confirmando ? (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="btn btn-primary"
            disabled={carregando !== null || totalInscritos === 0}
          >
            Enviar para {totalInscritos}{" "}
            {totalInscritos === 1 ? "inscrito" : "inscritos"}
          </button>
        ) : (
          <div className="editor-confirma">
            <span>
              Confirmar envio para {totalInscritos}{" "}
              {totalInscritos === 1 ? "pessoa" : "pessoas"}?
            </span>
            <button
              type="button"
              onClick={() => enviar("envio")}
              className="btn btn-primary"
              disabled={carregando !== null}
            >
              {carregando === "envio" ? "Enviando…" : "Sim, enviar agora"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="btn btn-ghost"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {status && <p className="editor-status">{status}</p>}
    </div>
  );
}
