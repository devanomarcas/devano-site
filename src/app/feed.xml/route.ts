import { getAllPostsMeta, getPost } from "@/lib/posts";

export const dynamic = "force-static";

const SITE = "https://www.devanobranding.com";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = getAllPostsMeta();

  const items = await Promise.all(
    posts.map(async (meta) => {
      const post = await getPost(meta.slug);
      const url = `${SITE}/blog/${post.slug}`;
      const pubDate = new Date(post.dataISO + "T09:00:00-03:00").toUTCString();
      return `
    <item>
      <title>${escapeXml(post.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(post.autor)}</dc:creator>
      <category>${escapeXml(post.pilar)}</category>
      <description>${escapeXml(post.resumo)}</description>
      <content:encoded><![CDATA[${post.conteudoHtml}]]></content:encoded>
    </item>`;
    })
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Marketeiros — por Lucas Mooneyhan</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Reflexões e análises sobre negócios, marcas, marketing e comportamento. Por Lucas Mooneyhan, todo domingo às 9h.</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items.join("")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
