{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // lib/rss/ingest.ts\
export type ExpandInput = \{\
  title: string;\
  source: string;\
  url: string;\
  summary?: string;\
  rawHtml?: string;\
\};\
\
export type ExpandOutput = \{\
  ok: boolean;\
  html: string;\
  provider: 'none';\
  note?: string;\
\};\
\
// Fallback-only version: no external API calls\
export async function expandToHtml(input: ExpandInput): Promise<ExpandOutput> \{\
  const intro = (input.summary || ("Latest coverage from " + input.source + ".")).trim();\
\
  function esc(s: string) \{\
    return s.replace(/[&<>\\"']/g, (m) => (\
      \{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'\}[m] || m\
    ));\
  \}\
  function p(s: string) \{ return "<p>" + esc(s) + "</p>"; \}\
\
  const html = [\
    "<article>",\
    p(input.title || "Update"),\
    p(intro),\
    p('Read the original report at <a href="' +\
      (input.url || "#").replace(/\\"/g,"&quot;") +\
      '" target="_blank" rel="noopener">the source</a>.'),\
    p("This article was auto-expanded without an external LLM."),\
    "</article>"\
  ].join("\\n");\
\
  return \{ ok: true, html, provider: "none", note: "fallback-only" \};\
\}\
}