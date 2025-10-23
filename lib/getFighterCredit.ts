import credits from "@/lib/fighterCredits.json";
export function getFighterCredit(id: string): { source?: string; credit?: string } | null {
  if (!id) return null;
  const map = credits as Record<string, { source: string; credit: string }>;
  return map[id] || null;
}
