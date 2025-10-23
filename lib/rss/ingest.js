export async function expandToHtml({ title, source, url, summary }) {
  const intro = (summary || '').trim() || `Latest coverage from ${source}.`;
  const p = (s) => `<p>${s}</p>`;
  const html = `<article>
  ${p(title)}
  ${p(intro)}
  ${p(`Read the original report at <a href="${url}" target="_blank" rel="noopener">the source</a>.`)}
  ${p('This article was auto-expanded without an external LLM in the current environment.')}
</article>`;
  return { ok: true, html, provider: 'none' };
}
