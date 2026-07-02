import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getSlugs, getPost, getPostMeta } from "@/lib/posts";

export function generateStaticParams() {
  return getSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const meta = getPostMeta(params.slug);
    return {
      title: meta.titulo,
      description: meta.resumo,
      openGraph: {
        title: meta.titulo,
        description: meta.resumo,
        type: "article",
        images: meta.capa ? [meta.capa] : undefined,
      },
    };
  } catch {
    return { title: "Texto não encontrado" };
  }
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  if (!getSlugs().includes(params.slug)) notFound();
  const post = await getPost(params.slug);
  const hasCapa = post.capa && !post.capa.includes("placeholder");

  return (
    <>
      <Nav />
      <article>
        <div className="article-head">
          <div className="wrap" style={{ maxWidth: 820 }}>
            <p className="pilar">{post.pilar}</p>
            <h1>{post.titulo}</h1>
            {post.resumo && <p className="resumo">{post.resumo}</p>}
            <div className="byline">
              <span>
                Por <strong>{post.autor}</strong>
              </span>
              <span>·</span>
              <span>{post.data}</span>
              <span>·</span>
              <span>{post.leitura}</span>
            </div>
          </div>
        </div>

        {hasCapa && (
          <Image
            className="article-capa"
            src={post.capa}
            alt={post.titulo}
            width={1400}
            height={700}
            priority
          />
        )}

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: post.conteudoHtml }}
        />

        <div className="article-footer">
          <p className="assina">
            Escrito por <strong>{post.autor}</strong>, diretor de estratégia e
            criação da Devano.
          </p>
          <p style={{ marginTop: 28 }}>
            <Link href="/blog" style={{ color: "var(--musgo-claro)" }}>
              ← Voltar para o blog
            </Link>
          </p>
        </div>
      </article>
      <Footer />
    </>
  );
}
