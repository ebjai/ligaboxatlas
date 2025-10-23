import Image from "next/image";
import Link from "next/link";

async function fetchNews() {
  const res = await fetch(`${process.env.SITE_URL || "http://localhost:3000"}/api/v1/news`, { next: { revalidate: 60 }});
  if (!res.ok) return { items: [] };
  return res.json();
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").trim().toLowerCase();
  const data = await fetchNews();
  const items = (data.items || []).filter((i: any) => i.image);
  const results = q
    ? items.filter((i: any) =>
        [i.title, i.description, i.source].join(" ").toLowerCase().includes(q)
      )
    : items.slice(0, 24);

  return (
    <main className="min-h-screen text-white">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Results {q ? `for “${q}”` : ""}</h1>
        <p className="mt-1 text-sm text-zinc-400">{results.length} articles</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a: any) => (
            <a key={a._id} href={a.link} target="_blank" rel="noopener noreferrer"
               className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 hover:border-amber-500 transition">
              <Image src={a.image} alt={a.title} width={640} height={360}
                     className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-sm font-semibold leading-tight">{a.title}</h3>
                <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{a.description}</p>
                <div className="mt-2 text-[11px] text-amber-300">{a.source}</div>
              </div>
            </a>
          ))}
        </div>
        {!results.length && (
          <div className="mt-10 rounded-lg border border-zinc-700 bg-black/50 p-6 text-zinc-300">
            No live articles matched that query. Try broader terms (e.g., “Canelo”, “heavyweight”, “title”).
          </div>
        )}
        <div className="mt-8">
          <Link href="/" className="text-amber-300 hover:text-amber-200">← Back to Home</Link>
        </div>
      </section>
    </main>
  );
}
