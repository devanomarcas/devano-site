import type { MetadataRoute } from "next";
import { getAllPostsMeta } from "@/lib/posts";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.devanobranding.com";
  const posts = (await getAllPostsMeta()).map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.dataISO,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...posts,
  ];
}
