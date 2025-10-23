"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home" },
  { href: "/news/why-we-built-liga", label: "Articles" },
  { href: "/about", label: "About" }
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="fixed top-0 left-0 w-full h-14 flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image src="/brand/logo.png" alt="Liga de Boxeo" width={32} height={32} className="rounded" />
        </Link>
        <span className="text-sm font-semibold text-zinc-300">
          Liga de Boxeo
          <span className="text-xs ml-1 text-zinc-500">Powered by LDB.AI</span>
        </span>
      </div>
      <nav className="flex gap-4">
        {nav.map((n) => (
          <Link key={n.href} className={`${pathname===n.href?'text-amber-300':'text-zinc-200'} hover:text-amber-400`} href={n.href}>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
