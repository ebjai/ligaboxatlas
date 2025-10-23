import 'node-fetch'; // Node18+ has global fetch; harmless import for older envs

export type ExpandInput = {
  title: string;
  source: string;
  url: string;
  summary?: string;   // RSS snippet if available
  rawHtml?: string;   // optional fetched article HTML
};

export type ExpandOutput = {
  ok: boolean;
  html: string;       // 5–7 paragraph HTML article
  thumbnail?: string; // best-guess image url if model returns one
  tokens?: number;    // optional token usage
  model?: string;     // provider+model used
  provider: 'openai' | 'anthropic' | 'none';
  note?: string;      // fallback reason or diagnostics
};

const LLM_PROVIDER = (process.env.LLM_PROVIDER || 'none').toLowerCase() as 'openai'|'anthropic'|'none';

// ---- Public API ----
export async function expandToHtml(input: ExpandInput): Promise<ExpandOutput> {
  if (LLM_PROVIDER === 'openai' && process.env.OPENAI_API_KEY) {
    try { return await callOpenAI(input); } catch (e:any) {
      return fallback(input, `openai error: ${e?.message || e}`);
    }
  }
  if (LLM_PROVIDER === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    try { return await callAnthropic(input); } catch (e:any) {
      return fallback(input, `anthropic error: ${e?.message || e}`);
    }
  }
  return fallback(input, 'no provider or missing API key');
}

// ---- Providers ----

async function callOpenAI(input: ExpandInput): Promise<ExpandOutput> {
  const api = process.env.OPENAI_BASE_URL?.replace(/\/+$/'','') || 'https://api.openai.com/v1';
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const system = [
    'You write publish-ready sports articles in clean HTML.',
    'Expand the seed into 5–7 concise paragraphs.',
    'Keep facts consistent with the seed.',
    'Preserve proper nouns; avoid hallucinations.',
    'Include at least one inline <a> link to the original source when relevant.',
    'Return ONLY the <article>…</article> HTML. No markdown.',
  ].join(' ');

  const user = [
    `Title: ${input.title}`,
    `Source: ${input.source}`,
    `URL: ${input.url}`,
    input.summary ? `Seed summary: ${input.summary}` : '',
    input.rawHtml ? 'Some article HTML may be included below to ground facts.' : '',
    '',
    'Write a 5–7 paragraph article in <article> HTML. Use <p> for paragraphs and minimal <strong>/<em>/<a>.',
  ].join('\n');

  // Use Responses API (works for both text and vision-capable models)
  const r = await fetch(`${api}/responses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: [
        { role: 'system', content: system },
        { role: 'user', content: [
            { type: 'text', text: user },
            ...(input.rawHtml ? [{ type: 'input_text', text: stripControl(input.rawHtml).slice(0, 20000) }] : [])
        ]}
      ],
      max_output_tokens: 1200,
      temperature: 0.5
    })
  });

  if (!r.ok) throw new Error(`OpenAI ${r.status}`);
  const data = await r.json();

  const html = extractResponseText(data).trim();
  return {
    ok: true,
    html: ensureArticle(html),
    provider: 'openai',
    model,
    tokens: data?.usage?.output_tokens
  };
}

async function callAnthropic(input: ExpandInput): Promise<ExpandOutput> {
  const api = process.env.ANTHROPIC_BASE_URL?.replace(/\/+$/'','') || 'https://api.anthropic.com/v1';
  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';
  const sys = [
    'You write publish-ready sports articles in clean HTML.',
    'Expand to 5–7 concise paragraphs based on provided seed.',
    'Keep facts consistent; cite original source with an <a> link.',
    'Output ONLY an <article>…</article> element.',
  ].join(' ');

  const user = [
    `Title: ${input.title}`,
    `Source: ${input.source}`,
    `URL: ${input.url}`,
    input.summary ? `Seed summary: ${input.summary}` : '',
    input.rawHtml ? 'Partial article HTML is included to ground facts.' : '',
    '',
    'Write 5–7 paragraphs in <article> HTML.',
  ].join('\n');

  const r = await fetch(`${api}/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY as string,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      system: sys,
      max_tokens: 1200,
      temperature: 0.5,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: user },
            ...(input.rawHtml ? [{ type: 'text', text: stripControl(input.rawHtml).slice(0, 20000) }] : [])
          ]
        }
      ]
    })
  });

  if (!r.ok) throw new Error(`Anthropic ${r.status}`);
  const data = await r.json();
  const html = (data?.content?.[0]?.text || '').trim();

  return {
    ok: true,
    html: ensureArticle(html),
    provider: 'anthropic',
    model
  };
}

// ---- Fallback (no external LLM) ----

function fallback(input: ExpandInput, note: string): ExpandOutput {
  const intro = input.summary?.trim() || `Latest coverage from ${input.source}.`;
  const p = (s:string)=>`<p>${escapeHtml(s)}</p>`;
  const html =
    `<article>
      ${p(`${input.title}`)}
      ${p(intro)}
      ${p(`Read the original report at <a href="${escapeAttr(input.url)}" target="_blank" rel="noopener">the source</a>.`)}
      ${p(`This article was auto-expanded without an external LLM in the current environment.`)}
    </article>`;
  return { ok: true, html, provider: 'none', note };
}

// ---- helpers ----

function ensureArticle(s: string): string {
  const trimmed = s.trim();
  if (/^<article[\s>]/i.test(trimmed)) return trimmed;
  return `<article>${trimmed}</article>`;
}
function extractResponseText(resp: any): string {
  // Responses API returns .output_text and/or a content array
  if (resp?.output_text) return resp.output_text;
  const blocks = resp?.output?.[0]?.content || resp?.content || [];
  const text = Array.isArray(blocks)
    ? blocks.map((b:any)=>b.text || b.output_text || '').join('\n')
    : '';
  return text;
}
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[m] as string));
}
function escapeAttr(s: string) {
  return s.replace(/"/g, '&quot;');
}
function stripControl(s: string) {
  return s.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '');
}
