import * as cheerio from "cheerio";

export async function resolveOgImage(url: string): Promise<{url?: string, credit?: string}> {
  try {
    const html = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } }).then(r => r.text());
    const $ = cheerio.load(html);
    const meta =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('meta[property="og:image:url"]').attr("content");
    if (meta) return { url: meta, credit: new URL(url).hostname };
  } catch {}
  return {};
}
