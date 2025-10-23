"use client";
import useSWR from "swr";
const fetcher = (u:string)=>fetch(u).then(r=>r.json());
export default function AITickerBar() {
  const { data } = useSWR("/api/v1/news", fetcher, { refreshInterval: 30_000 });
  const items = (data?.items || []).slice(0, 20);
  return (
    <div className="w-full h-8 flex items-center gap-2 overflow-hidden whitespace-nowrap text-[12px] bg-zinc-900/50 border-t border-b border-zinc-700">
      <span className="px-3 text-amber-500 font-semibold">BREAKING:</span>
      {items.map((i:any, idx:number)=>(
        <span key={i._id || idx} className="mr-6 text-zinc-300">{i.title}|</span>
      ))}
    </div>
  );
}
