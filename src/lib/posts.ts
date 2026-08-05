import { createAdminClient } from "@/lib/supabase/admin";
import { remark } from "remark";
import html from "remark-html";
import readingTime from "reading-time";

export type Pilar = "Método" | "Categoria" | "Ponto de vista" | "Caso";

export interface PostMeta {
  slug: string;
  titulo: string;
  resumo: string;
  data: string;
  dataISO: string;
  pilar: Pilar;
  capa: string;
  autor: string;
  leitura: string;
}

export interface Post extends PostMeta {
  conteudoHtml: string;
}

const meses = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function formatarData(iso: string): string {
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

interface LinhaPost {
  slug: string;
  titulo: string;
  resumo: string | null;
  data: string;
  pilar: string | null;
  capa: string | null;
  autor: string | null;
  texto: string;
}

function paraMeta(linha: LinhaPost): PostMeta {
  return {
    slug: linha.slug,
    titulo: linha.titulo,
    resumo: linha.resumo ?? "",
    data: formatarData(linha.data),
    dataISO: linha.data,
    pilar: (linha.pilar ?? "Método") as Pilar,
    capa: linha.capa ?? "/portfolio/placeholder.svg",
    autor: linha.autor ?? "Lucas Mooneyhan",
    leitura: readingTime(linha.texto ?? "", { wordsPerMinute: 200 }).text.replace(
      "min read",
      "min de leitura"
    ),
  };
}

export async function getAllPostsMeta(): Promise<PostMeta[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("data", { ascending: false });
    if (error || !data) return [];
    return (data as LinhaPost[]).map(paraMeta);
  } catch {
    return [];
  }
}

export async function getSlugs(): Promise<string[]> {
  const posts = await getAllPostsMeta();
  return posts.map((p) => p.slug);
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error || !data) return null;
    const linha = data as LinhaPost;
    const processado = await remark().use(html).process(linha.texto ?? "");
    return { ...paraMeta(linha), conteudoHtml: processado.toString() };
  } catch {
    return null;
  }
}
