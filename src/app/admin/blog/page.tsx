import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logout } from "../actions";
import GerenciadorBlog from "@/components/admin/GerenciadorBlog";
import type { PostEdicao } from "@/components/admin/EditorPost";

export const metadata = {
  title: "Blog — Painel Devano",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function BlogAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data } = await admin
    .from("posts")
    .select("*")
    .order("data", { ascending: false });

  const posts: PostEdicao[] = (data ?? []).map((p) => ({
    slug: p.slug,
    titulo: p.titulo,
    texto: p.texto ?? "",
    resumo: p.resumo ?? "",
    pilar: p.pilar ?? "Método",
    capa: p.capa ?? "",
    data: p.data,
  }));

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <Link href="/admin">
            <Image src="/brand/logo-musgo.png" alt="Devano" width={120} height={26} />
          </Link>
          <div className="admin-topbar-right">
            <span className="admin-user">{user?.email}</span>
            <form action={logout}>
              <button type="submit" className="admin-logout">Sair</button>
            </form>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <Link href="/admin" className="admin-voltar">← Voltar ao painel</Link>
        <p className="admin-eyebrow">Marketing · Blog</p>
        <h1 className="admin-title">Repertório</h1>
        <p className="admin-lead">
          {posts.length} {posts.length === 1 ? "texto publicado" : "textos publicados"}.
          Escreva aqui e o texto vai ao ar no site em instantes.
        </p>

        <GerenciadorBlog posts={posts} />
      </main>
    </div>
  );
}
