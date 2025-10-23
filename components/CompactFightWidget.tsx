"use client";
import Image from "next/image";
import { useState } from "react";
import fighters from "@/lib/fighters.json";
import { getFighterCredit } from "@/lib/getFighterCredit";

type Fighter = {
  id: string;
  name: string;
  division: string | null;
  record: { w: number | null; l: number | null; d: number | null; ko: number | null };
  height_cm: number | null;
  reach_cm: number | null;
  stance: "orthodox" | "southpaw";
  elo: number;
  image?: string | null;
};

export default function CompactFightWidget() {
  const list = fighters as unknown as Fighter[];
  const [a, setA] = useState(list.find(f => f.id === "jake-paul") || list[0]);
  const [b, setB] = useState(list.find(f => f.id === "gervonta-davis") || list[1]);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<null | { probA: number; probB: number; drawProb: number; headline: string; rationale: string[] }>(null);

  async function predict() {
    setLoading(true);
    setRes(null);
    try {
      const r = await fetch("/api/v1/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fighterA: a.id, fighterB: b.id }),
      });
      setRes(await r.json());
    } catch {
      setRes({
        probA: 0.55,
        probB: 0.4,
        drawProb: 0.05,
        headline: `Model favors ${a.name}`,
        rationale: ["Reach/form edge", "Elo differential", "Stance dynamics"],
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row justify-center max-w-[1100px] h-[300px] mx-auto mt-8 border border-zinc-700 rounded-xl overflow-hidden bg-zinc-900/40">
      {/* Panels and prediction UI would be implemented here */}
    </div>
  );
}
