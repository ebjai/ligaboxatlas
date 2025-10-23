#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import { expandToHtml } from '../../lib/rss/ingest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '../../');
const OUT_DIR = path.join(ROOT, 'content', 'articles');
const SOURCES = [
  'https://www.espn.com/boxing/rss.xml',
  'https://www.dazn.com/en-US/news/rss',
  'https://www.foxsports.com/boxing/rss.xml',
  'https://www.ringtv.com/feed/',
  'https://www.forbes.com/sportsmoney/feed/',
  'https://www.businessinsider.com/sports/rss',
  'https://www.tmz.com/category/sports/rss/'
];
const MAX_ITEMS = Number(process.env.INGEST_MAX || 12);

fs.mkdirSync(OUT_DIR, { recursive: true });
const parser = new Parser();

function slug(s) {
  return s.toLowerCase().replace(/[’'“”"()]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

async function fetchHtml(url) {
  try {
    const r = await fetch(url, { timeout: 8000 });
    if (!r.ok) return '';
    return await r.text();
  } catch { return ''; }
}

function bestThumbFromHtml(html) {
  if (!html) return null;
  const $ = cheerio.load(html);
  return $('meta[property="og:image"]').attr('content')
      || $('meta[name="twitter:image"]').attr('content')
      || $('img').first().attr('src')
      || null;
}

async function main() {
  const items = [];
  for (const src of SOURCES) {
    try {
      const feed = await parser.parseURL(src);
      for (const it of feed.items) {
        if (!it.title || !it.link) continue;
        items.push({
          title: it.title,
          link: it.link,
          summary: it.contentSnippet || '',
          source: new URL(src).hostname.replace('www.','')
        });
      }
    } catch {}
  }

  const pick = items.slice(0, MAX_ITEMS);
  for (const it of pick) {
    const html = await fetchHtml(it.link);
    const thumb = bestThumbFromHtml(html);
    const exp = await expandToHtml({
      title: it.title,
      source: it.source,
      url: it.link,
      summary: it.summary,
      rawHtml: html ? html.slice(0, 20000) : undefined
    });

    const s = slug(it.title);
    const file = path.join(OUT_DIR, `${s}.mdx`);
    const front = [
      `title: "${it.title.replace(/"/g,'\\"')}"`,
      `author: "${process.env.ARTICLE_AUTHOR || 'Liga de Boxeo'}"`,
      `date: "${new Date().toISOString().slice(0,10)}"`,
      `image: "${thumb || ''}"`,
      `source: "${it.source}"`,
      `origin: "${it.link}"`
    ].join('\n');

    const content = `---\n${front}\n---\n\n${exp.html}\n`;
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Wrote ${path.relative(ROOT, file)} (${exp.provider}${exp.model?':'+exp.model:''})`);
  }
  console.log('Ingest complete.');
}

main().catch(e => { console.error(e); process.exit(1); });
