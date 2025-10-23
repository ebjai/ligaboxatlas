export default function Footer() {
  return (
    <footer className="w-full py-6 text-center text-sm text-zinc-500 flex flex-col items-center gap-2">
      © {new Date().getFullYear()} Liga de Boxeo — All rights reserved.
      <div className="flex gap-4">
        <a href="/sitemap" className="hover:underline">Sitemap</a>
        <a href="/robots.txt" className="hover:underline">Robots</a>
      </div>
    </footer>
  );
}
