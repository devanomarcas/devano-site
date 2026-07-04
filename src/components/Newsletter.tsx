"use client";

import { useState } from "react";

// Substitua "SEU_USUARIO" pelo seu username do Buttondown
// (aparece na URL da sua conta: buttondown.com/SEU_USUARIO).
const BUTTONDOWN_USER = "SEU_USUARIO";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "erro">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch(
        `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USER}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ email }),
        }
      );
      if (res.ok) {
        setStatus("ok");
        setEmail("");
      } else {
        setStatus("erro");
      }
    } catch {
      setStatus("erro");
    }
  }

  return (
    <section id="newsletter" className="alt">
      <div className="wrap">
        <div className="nl-grid">
          <div>
            <p className="label">Marketeiros</p>
            <h2>A newsletter de Lucas Mooneyhan.</h2>
            <p className="lead">
              Reflexões e análises sobre negócios, marcas, marketing e
              comportamento — de forma livre, todo domingo às 9h. Assinada por
              Lucas Mooneyhan.
            </p>
          </div>
          <div className="nl-form-wrap">
            {status === "ok" ? (
              <p className="nl-ok">
                Inscrição confirmada. Você receberá a Marketeiros no próximo
                domingo, às 9h.
              </p>
            ) : (
              <form className="nl-form" onSubmit={handleSubmit}>
                <input
                  type="email"
                  required
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Seu e-mail"
                />
                <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
                  {status === "loading" ? "Enviando…" : "Inscrever-se"}
                </button>
              </form>
            )}
            {status === "erro" && (
              <p className="nl-erro">
                Não foi possível concluir. Tente novamente em instantes.
              </p>
            )}
            <p className="nl-nota">Sem spam. Cancele quando quiser.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
