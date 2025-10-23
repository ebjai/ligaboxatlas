"use client";
import { useEffect, useState } from "react";

type Result = { ok: boolean; checks: { id: string; ok: boolean; message: string }[] };

export default function HealthBadge() {
  const [data, setData] = useState<Result | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/health")
      .then((r) => r.json())
      .then((j) => {
        if (alive) setData(j);
      })
      .catch(() => {
        if (alive) setData({ ok: false, checks: [] } as Result);
      });
    return () => {
      alive = false;
    };
  }, []);

  const ok = data?.ok;
  const color = ok
    ? "text-emerald-300 border-emerald-700 bg-emerald-900/20"
    : "text-amber-300 border-amber-700 bg-amber-900/20";
  const icon = ok ? "✅" : "⚠️";

  return (
    <>
      <button
        className={`text-xs rounded-full px-3 py-1 border ${color} hover:opacity-90 transition`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {icon} Site health: {ok ? "OK" : "Action required"} {open ? "▴" : "▾"}
      </button>
      {open && (
        <div className="mt-3 w-full max-w-[680px] text-left rounded-lg border border-zinc-700 bg-black/60 p-3">
          <ul className="space-y-1 text-xs">
            {(data?.checks || []).map((c) => (
              <li key={c.id} className={c.ok ? "text-emerald-300" : "text-amber-300"}>
                {c.ok ? "✔︎" : "✖︎"} {c.message}
              </li>
            ))}
            {!data?.checks?.length && (
              <li className="text-amber-300">
                Could not reach /api/health. Ensure dev server is running.
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}
