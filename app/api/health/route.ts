import fs from "fs";
import path from "path";
import http from "http";
import { NextResponse } from "next/server";

type Check = { id: string; ok: boolean; message: string };

async function getNewsCount(base: string): Promise<number> {
  const url = new URL("/api/v1/news", base).toString();
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        try {
          const j = JSON.parse(data);
          const n = (j.items || []).filter((i: any) => i.image).length;
          resolve(n);
        } catch {
          resolve(0);
        }
      });
    });
    req.on("error", () => resolve(0));
    req.setTimeout(2500, () => {
      try { req.destroy(); } catch {}
      resolve(0);
    });
  });
}

export async function GET() {
  const base = process.env.SITE_URL || "http://localhost:3000";
  const root = process.cwd();
  const checks: Check[] = [];

  // Brand assets
  const logo = path.join(root, "public/brand/logo.png");
  const wallpaper = path.join(root, "public/wallpaper.jpg");
  checks.push({
    id: "logo",
    ok: fs.existsSync(logo),
    message: "Logo present at public/brand/logo.png"
  });
  checks.push({
    id: "wallpaper",
    ok: fs.existsSync(wallpaper),
    message: "Wallpaper present at public/wallpaper.jpg"
  });

  // Fighters JSON + images
  const fightersPath = path.join(root, "lib/fighters.json");
  let fighterCount = 0;
  try {
    const fighters = JSON.parse(fs.readFileSync(fightersPath, "utf8"));
    fighterCount = Array.isArray(fighters) ? fighters.length : 0;
  } catch {}
  checks.push({
    id: "fighters.json",
    ok: fighterCount >= 50,
    message: `fighters.json has >= 50 entries (got ${fighterCount})`
  });

  const imgDir = path.join(root, "public/fighters");
  const imgCount = fs.existsSync(imgDir)
    ? fs.readdirSync(imgDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f)).length
    : 0;
  checks.push({
    id: "fighter-images",
    ok: imgCount >= 30,
    message: `public/fighters contains >= 30 images (got ${imgCount})`
  });

  // News endpoint (real thumbnails only)
  const newsCount = await getNewsCount(base);
  checks.push({
    id: "news",
    ok: newsCount >= 6,
    message: `news endpoint returns >= 6 items with images (got ${newsCount})`
  });

  const ok = checks.every((c) => c.ok);
  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 });
}
