"use client";

import { useEffect, useState } from "react";

// Mesmo username do Buttondown usado no Newsletter.tsx
const BUTTONDOWN_USER = "SEU_USUARIO";
const STORAGE_KEY = "devano_marketeiros_popup";

export default function NewsletterPopup() {
  const [visivel, setVisivel] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "erro">("idle");

  useEffect(() => {
    // Não mostrar se a pessoa já fechou ou já se inscreveu antes
    let jaInteragiu = false;
    try {
      jaInteragiu = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      jaInteragiu = false;
    }
    if (jaInteragiu) return;

    // Aparece após 15 segundos de navegação
    const timer = setTimeout(() => setVisivel(true), 15000);

    // Ou quando o mouse sai pela parte de cima (intenção de sair) — desktop
    function onLeave(e: MouseEvent) {
      if (e.clientY <= 0) setVisivel(true);
    }
    document.addEventListener("mouseleave", onLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  function fechar() {
    setVisivel(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignora */
    }
  }

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
        try {
          localStorage.setItem(STORAGE_KEY, "1");
        } catch {
          /* ignora */
        }
      } else {
        setStatus("erro");
      }
    } catch {
      setStatus("erro");
    }
  }

  if (!visivel) return null;

  return (
    <div className="popup-overlay" onClick={fechar}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={fechar} aria-label="Fechar">
          ×
        </button>
        {status === "ok" ? (
          <>
            <p className="popup-label">Marketeiros</p>
            <h3>Inscrição confirmada.</h3>
            <p className="popup-texto">
              Você receberá a Marketeiros no próximo domingo, às 9h.
            </p>
            <button className="btn btn-primary" onClick={fechar}>
              Fechar
            </button>
          </>
        ) : (
          <>
            <p className="popup-label">Marketeiros</p>
            <h3>Reflexões sobre marca e negócio, todo domingo.</h3>
            <p className="popup-texto">
              A newsletter de Lucas Mooneyhan: análises livres sobre negócios,
              marcas, marketing e comportamento. Domingos, às 9h.
            </p>
            <form className="popup-form" onSubmit={handleSubmit}>
              <input
                type="email"
                required
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Seu e-mail"
              />
              <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
                {status === "loading" ? "Enviando…" : "Quero receber"}
              </button>
            </form>
            {status === "erro" && (
              <p className="popup-erro">Não foi possível concluir. Tente novamente.</p>
            )}
            <button className="popup-dispensar" onClick={fechar}>
              Agora não
            </button>
          </>
        )}
      </div>
    </div>
  );
}
