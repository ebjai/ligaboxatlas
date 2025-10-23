import Parser from "rss-parser";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { BOXING_FEEDS } from "@/lib/rss/feeds";
import { isBoxingRelated } from "@/lib/rss/filters";
import { loadLocalArticles } from "@/lib/loadLocalArticles";

type Item = {
  _id: string;
  title: string;
  link: string;
  description: string;
  image?: string | null;
  source: string;
  publishedAt?: string;
};

const parser = new Parser();
export const revalidate = 1800; // ISR ~30 min

async function extractImageSmart(item: any, html?: string): Promise<string | null> {
  if (item.enclosure?.url) return item.enclosure.url;
  const fromContent = item["content:encoded"] || item.content || "";
  const m = fromContent?.match(/<img[^>]+src="([^">]+)"/i);
  if (m) return m[1];
  if (html) {
    const $ = cheerio.load(html);
    const og =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content");
    if (og) return og;
  }
  return null;
}

export async function GET() {
  const all: Item[] = [];
  for (const src of BOXING_FEEDS) {
    try {
      const feed = await parser.parseURL(src);
      for (const it of feed.items) {
        const link = it.link || it.guid || "";
        const title = it.title || "";
        const summary = it.contentSnippet || it.content || "";
        if (!isBoxingRelated(`${title} ${summary}`)) continue;
        let html: string | undefined = undefined;
        try {
          html = await fetch(link).then((r) =>
            r.ok ? r.text() : Promise.resolve("")
          );
        } catch {}
        const img = await extractImageSmart(it, html);
        if (!img) continue; // skip imageless
        all.push({
          _id: `${src}::${link}`,
          title: title || "Untitled",
          link,
          description: summary.slice(0, 200),
          image: img,
          source: new URL(src).hostname.replace("www.", ""),
          publishedAt: it.isoDate || it.pubDate || undefined,
        });
      }
    } catch {}
  }

  const local = await loadLocalArticles();
  const merged = [...local, ...all].slice(0, 60);
  return NextResponse.json({ items: merged, cached: true });
}
