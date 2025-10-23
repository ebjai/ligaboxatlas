export const EXPAND_SYSTEM_PROMPT = `
You expand short boxing news briefs into fully fleshed 5–7 paragraph articles (600–900 words).
Maintain factuality and neutrality. Do not invent results or quotes. Keep it boxing-related.
Return HTML only: <p>...</p> per paragraph. End with "<p>Source: {source}</p>".
`;

export function buildExpandUserPrompt(
  title: string,
  source: string,
  publishedAt: string,
  summary: string,
  entities: string[]
) {
  return `Title: ${title}
Source: ${source}
PublishedAt: ${publishedAt}
Original Summary: ${summary}
Known Entities/Tags: ${entities.join(", ")}

REQUIRED OUTPUT:
- 5 to 7 paragraphs (each 3–5 sentences), total ~600–900 words.
- HTML only (<p>...</p> for each paragraph). No markdown.
- End with: "<p>Source: ${source}</p>".`;
}
