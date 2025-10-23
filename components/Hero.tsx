"use client";
import Image from "next/image";
import { useState } from "react";
import HealthBadge from "./HealthBadge";

export default function Hero() {
  const [q, setQ] = useState("");
  return (
    <section
      className="relative w-full flex items-center justify-center pt-16 pb-16 pt-14 pb-14"
      aria-label="Liga de Boxeo Hero"
    >
      <div className="max-w-[1200px] w-full px-4 flex flex-col items-center text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/brand/logo.png"
            alt="Liga de Boxeo"
            width={96}
            height={96}
            className="rounded-xl shadow-[0_0_40px_rgba(212,175,55,0.25)]"
            priority
          />
        </div>
        {/* Slogan */}
        <h1 className="text-[40px] leading-[48px] sm:text-[28px] sm:leading-[34px] font-semibold">
          The People&apos;s League
        </h1>
        {/* Subhead */}
        <p className="mt-3 text-[18px] leading-[28px] text-zinc-300">
          Experience the most advanced, AI-powered combat sports platform. Where fighters, fans, and creators unite.
        </p>
        {/* CTAs */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href="#join"
            className="inline-flex h-[44px] items-center justify-center rounded-md bg-amber-500 text-black font-semibold px-5 hover:bg-amber-400 transition"
          >
            Join the League
          </a>
          <a
            href="#highlights"
            className="inline-flex h-[44px] items-center justify-center rounded-md border border-amber-500/40 text-amber-300 px-5 hover:border-amber-400 hover:text-amber-200 transition"
          >
            Watch Highlights
          </a>
        </div>
        {/* AI Search Bar => navigates to /search with real results */}
        <form
          className="mt-8 relative flex items-center gap-2 rounded-xl border border-zinc-700 bg-black/55 px-4 h-[48px] shadow-[0_0_30px_rgba(0,0,0,0.35)]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!q.trim()) return;
            window.location.href = `/search?q=${encodeURIComponent(q)}`;
          }}
        >
          <input
            className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-zinc-500"
            placeholder="Ask LDB.AI anything… (e.g., Who's the hardest puncher?)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Ask LDB.AI"
            required
          />
          <button
            type="submit"
            aria-label="Search"
            className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-md bg-amber-500 text-black font-semibold hover:bg-amber-400 transition"
          >
            🔍
          </button>
        </form>
        {/* subtle hint */}
        <div className="mt-2 text-[12px] text-zinc-500">
          ⚡ Powered by LDB.AI — Your intelligent boxing assistant
          {/* Live health/realness badge (click to see details) */}
          <HealthBadge />
        </div>
      </div>
    </section>
  );
}
