import Link from "next/link";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { getAllPostsMeta } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Reflexões sobre marca, estratégia e construção de negócios, por Lucas Mooneyhan.",
};

export default function BlogIndex() {
  const posts = getAllPostsMeta();

  return (
    <>
      <Nav />
      <Reveal />
      <main className="blog-index">
        <div className="wrap">
          <p className="label reveal">Repertório</p>
          <h2 className="reveal">O pensamento por trás do método.</h2>
          <p className="lead reveal">
            Toda semana, uma reflexão sobre marca, estratégia e a construção de
            negócios. Assinado por Lucas Mooneyhan.
          </p>

          {posts.length > 0 ? (
            <div className="blog-list reveal">
              {posts.map((post) => (
                <Link className="post" key={post.slug} href={`/blog/${post.slug}`}>
                  <div className="thumb">
                    <span>{post.pilar}</span>
                  </div>
                  <div className="body">
                    <p className="date">{post.data} · {post.leitura}</p>
                    <h3>{post.titulo}</h3>
                    <p className="read">Ler o texto →</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="lead reveal">Os primeiros textos chegam em breve.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
