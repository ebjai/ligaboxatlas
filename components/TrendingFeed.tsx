"use client";
import useSWR from "swr";
import Image from "next/image";
const fetcher = (u: string) => fetch(u).then(r => r.json());
export default function TrendingFeed() {
  const { data } = useSWR("/api/v1/news", fetcher, { refreshInterval: 26060 * 1000 });
  const items = (data?.items || []).filter((a: any) => !!a.image).slice(0, 12);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {items.map((a: any) => (
        <div key={a._id} className="bg-zinc-900/50 border border-zinc-700 rounded-xl overflow-hidden">
          <Image src={a.image} alt={a.title} width={640} height={360} className="w-full h-40 object-cover" />
          <div className="p-4">
            <h3 className="text-sm font-semibold leading-tight">{a.title}</h3>
            <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{a.description}</p>
            <div className="mt-2 text-[11px] text-amber-300">{a.source}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
