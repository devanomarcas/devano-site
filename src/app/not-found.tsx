import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="blog-index" style={{ minHeight: "60vh" }}>
        <div className="wrap">
          <p className="label">Erro 404</p>
          <h2>Esta página não existe.</h2>
          <p className="lead">
            O endereço que você procurou não foi encontrado.{" "}
            <Link href="/" style={{ color: "var(--musgo-claro)" }}>
              Voltar ao início
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
