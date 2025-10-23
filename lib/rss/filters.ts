export const BOXING_KEYWORDS = [
  "boxing","boxer","fight","bout","ko","tko","undercard","weigh-in","sparring",
  "wbc","wba","ibf","wbo","ring magazine","pound-for-pound","ppv","pay-per-view",
  "featherweight","lightweight","super lightweight","welterweight","super welterweight",
  "middleweight","super middleweight","light heavyweight","cruiserweight","heavyweight"
];

export function isBoxingRelated(text: string): boolean {
  const t = (text || "").toLowerCase();
  return BOXING_KEYWORDS.some(k => t.includes(k));
}
