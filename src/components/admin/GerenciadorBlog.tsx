"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EditorPost, { type PostEdicao } from "./EditorPost";

export default function GerenciadorBlog({ posts }: { posts: PostEdicao[] }) {
  const router = useRouter();
  const [modo, setModo] = useState<"lista" | "novo" | "editar">("lista");
  const [postEditando, setPostEditando] = useState<PostEdicao | undefined>();
  const [excluindo, setExcluindo] = useState<string | null>(null);

  function formatarData(iso: string) {
    return new Date(iso.length <= 10 ? iso + "T00:00:00" : iso).toLocaleDateString(
      "pt-BR",
      { day: "2-digit", month: "short", year: "numeric" }
    );
  }

  async function excluir(slug: string) {
    const res = await fetch(`/api/posts?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setExcluindo(null);
      router.refresh();
    }
  }

  if (modo === "novo") {
    return (
      <>
        <h2 className="admin-subtitulo" style={{ marginTop: 40 }}>
          Novo texto
        </h2>
        <EditorPost onFechar={() => setModo("lista")} />
      </>
    );
  }

  if (modo === "editar" && postEditando) {
    return (
      <>
        <h2 className="admin-subtitulo" style={{ marginTop: 40 }}>
          Editando: {postEditando.titulo}
        </h2>
        <EditorPost
          postInicial={postEditando}
          onFechar={() => {
            setPostEditando(undefined);
            setModo("lista");
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="blog-acoes-topo">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setModo("novo")}
        >
          Escrever novo texto
        </button>
      </div>

      {posts.length > 0 ? (
        <div className="admin-tabela" style={{ marginTop: 32 }}>
          <div className="admin-tabela-head blog">
            <span>Título</span>
            <span>Pilar</span>
            <span>Data</span>
            <span></span>
          </div>
          {posts.map((p) => (
            <div className="admin-tabela-row blog" key={p.slug}>
              <span>{p.titulo}</span>
              <span className="admin-tabela-data">{p.pilar}</span>
              <span className="admin-tabela-data">{formatarData(p.data)}</span>
              <span className="blog-linha-acoes">
                <button
                  type="button"
                  className="blog-acao"
                  onClick={() => {
                    setPostEditando(p);
                    setModo("editar");
                  }}
                >
                  Editar
                </button>
                {excluindo === p.slug ? (
                  <>
                    <button
                      type="button"
                      className="blog-acao perigo"
                      onClick={() => excluir(p.slug)}
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      className="blog-acao"
                      onClick={() => setExcluindo(null)}
                    >
                      Não
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="blog-acao perigo"
                    onClick={() => setExcluindo(p.slug)}
                  >
                    Excluir
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-vazio" style={{ marginTop: 32 }}>
          Nenhum texto ainda. Clique em &ldquo;Escrever novo texto&rdquo; para
          publicar o primeiro.
        </div>
      )}
    </>
  );
}
