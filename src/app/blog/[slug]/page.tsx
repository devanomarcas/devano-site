import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getAllPostsMeta, getPost } from "@/lib/posts";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getAllPostsMeta();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Texto não encontrado" };
  return {
    title: post.titulo,
    description: post.resumo,
    openGraph: {
      title: post.titulo,
      description: post.resumo,
      type: "article",
      images: post.capa ? [post.capa] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) notFound();

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
