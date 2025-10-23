import Parser from "rss-parser";
import slugify from "@sindresorhus/slugify";
import { BOXING_FEEDS } from "./feeds";
import { isBoxingRelated } from "./filters";
import { resolveOgImage } from "../images/og";
import { EXPAND_SYSTEM_PROMPT, buildExpandUserPrompt } from "./expand";
import { NormalizedArticle } from "./types";
import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data", "news");
await fs.mkdir(DATA_DIR, { recursive: true }).catch(() => {});

const parser = new Parser();

function shortHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

// TODO: Wire this to your VS Code agent (Copilot/Claude).
// It must return HTML with 5–7 <p>...</p> paragraphs.
async function expandToHtml(opts: {
  title: string; source: string; publishedAt: string; summary: string; entities: string[];
}) {
  const user = buildExpandUserPrompt(opts.title, opts.source, opts.publishedAt, opts.summary, opts.entities);
  // Replace this with your agent call:
  // example: await callAgent(EXPAND_SYSTEM_PROMPT, user)
  throw new Error("Connect LLM here with EXPAND_SYSTEM_PROMPT + user prompt. Must return 5–7 <p> blocks.");
}

export async function ingestBoxingNews(limitPerFeed = 30) {
  for (const feedUrl of BOXING_FEEDS) {
    const feed = await parser.parseURL(feedUrl);
    for (const item of (feed.items as any[]).slice(0, limitPerFeed)) {
      const title = item.title || "";
      const summary = item.contentSnippet || item.content || "";
      if (!isBoxingRelated(`${title} ${summary}`)) continue;

      const url = item.link || "";
      const source = new URL(feedUrl).hostname;
      const slug = `${slugify(title).slice(0, 80)}-${shortHash(url)}`;
      const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();

      const og = await resolveOgImage(url);

      const html = await expandToHtml({ title, source, publishedAt, summary, entities: [] });

      const paras = (html.match(/<p[\s>]/g) || []).length;
      if (paras < 5 || paras > 7) continue; // enforce

      const record: NormalizedArticle = {
        id: shortHash(url + publishedAt),
        slug,
        url,
        source,
        title,
        summary,
        publishedAt,
        image: { url: og?.url, credit: og?.credit },
        content: { html },
        tags: [],
      };

      await fs.writeFile(
        path.join(DATA_DIR, `${slug}.json`),
        JSON.stringify(record, null, 2),
        "utf8"
      );
    }
  }
}

if (process.argv[1]?.endsWith("ingest.ts")) {
  ingestBoxingNews().then(() => {
    console.log("Boxing news ingest complete.");
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
