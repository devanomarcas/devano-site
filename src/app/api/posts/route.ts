import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function gerarSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function exigirLogin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Criar ou atualizar um post
export async function POST(request: Request) {
  const user = await exigirLogin();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const titulo = String(body?.titulo ?? "").trim();
  const texto = String(body?.texto ?? "").trim();
  const resumo = String(body?.resumo ?? "").trim();
  const pilar = String(body?.pilar ?? "Método").trim();
  const capa = String(body?.capa ?? "").trim();
  const data = String(body?.data ?? "").trim();
  const slugOriginal = String(body?.slugOriginal ?? "").trim();

  if (!titulo || !texto) {
    return NextResponse.json(
      { error: "Preencha o título e o texto." },
      { status: 400 }
    );
  }

  const slug = slugOriginal || gerarSlug(titulo);
  const admin = createAdminClient();

  const registro = {
    slug,
    titulo,
    texto,
    resumo,
    pilar,
    capa: capa || null,
    autor: "Lucas Mooneyhan",
    data: data || new Date().toISOString().slice(0, 10),
  };

  const { error } = await admin.from("posts").upsert(registro, {
    onConflict: "slug",
  });

  if (error) {
    return NextResponse.json({ error: `Banco: ${error.message}` }, { status: 500 });
  }

  // Atualiza as páginas públicas
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/feed.xml");

  return NextResponse.json({ ok: true, slug });
}

// Excluir um post
export async function DELETE(request: Request) {
  const user = await exigirLogin();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Slug ausente." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("posts").delete().eq("slug", slug);

  if (error) {
    return NextResponse.json({ error: `Banco: ${error.message}` }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/feed.xml");

  return NextResponse.json({ ok: true });
}
