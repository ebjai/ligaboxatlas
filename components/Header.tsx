"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteLogoPure from "@/components/SiteLogoPure";

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
          <SiteLogoPure />
        </Link>
      </div>
      <nav className="flex gap-4">
        {nav.map((n) => (
          <Link
            key={n.href}
            className={`${pathname === n.href ? 'text-amber-300' : 'text-zinc-200'} hover:text-amber-400`}
            href={n.href}
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
