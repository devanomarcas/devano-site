import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import readingTime from "reading-time";

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

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
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

export function getSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getPostMeta(slug: string): PostMeta {
  const fullPath = path.join(POSTS_DIR, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  return {
    slug,
    titulo: data.titulo ?? "Sem título",
    resumo: data.resumo ?? "",
    data: formatarData(data.data),
    dataISO: data.data,
    pilar: (data.pilar ?? "Método") as Pilar,
    capa: data.capa ?? "/portfolio/placeholder.svg",
    autor: data.autor ?? "Lucas Mooneyhan",
    leitura: readingTime(content, { wordsPerMinute: 200 }).text
      .replace("min read", "min de leitura"),
  };
}

export async function getPost(slug: string): Promise<Post> {
  const fullPath = path.join(POSTS_DIR, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const processed = await remark().use(html).process(content);
  const meta = getPostMeta(slug);
  return { ...meta, conteudoHtml: processed.toString() };
}

export function getAllPostsMeta(): PostMeta[] {
  return getSlugs()
    .map(getPostMeta)
    .sort((a, b) => (a.dataISO < b.dataISO ? 1 : -1));
}
