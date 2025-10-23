export type NormalizedArticle = {
  id: string;
  slug: string;
  url: string;
  source: string;
  title: string;
  summary: string;
  publishedAt: string;
  author?: string;
  image: { url?: string; width?: number; height?: number; credit?: string };
  content: { html: string; plain?: string; paragraphs?: string[] };
  tags: string[];
};
