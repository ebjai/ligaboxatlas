#!/usr/bin/env node
/**
 * Preflight: asserts the site has REAL assets/data.
 * Fails (exit 1) if:
 *  - logo or wallpaper missing
 *  - fighters.json has < 50 entries
 *  - /public/fighters has < 30 images
 *  - /api/v1/news returns < 6 items with images
 */
import fs from 'fs';
import path from 'path';
import http from 'http';

const root = process.cwd();
function assert(cond, msg){ if(!cond){ console.error('❌', msg); process.exit(1); } else { console.log('✅', msg); } }

// 1) Brand assets
assert(fs.existsSync(path.join(root, 'public/brand/logo.png')), 'Logo present at public/brand/logo.png');
assert(fs.existsSync(path.join(root, 'public/wallpaper.jpg')), 'Wallpaper present at public/wallpaper.jpg');

// 2) Fighters JSON
const fightersPath = path.join(root, 'lib/fighters.json');
assert(fs.existsSync(fightersPath), 'lib/fighters.json exists');
const fighters = JSON.parse(fs.readFileSync(fightersPath,'utf8'));
assert(Array.isArray(fighters) && fighters.length >= 50, `fighters.json has >=50 entries (got ${fighters.length})`);

// 3) Fighter images
const imgDir = path.join(root, 'public/fighters');
const images = fs.existsSync(imgDir) ? fs.readdirSync(imgDir).filter(f=>/\.(jpg|jpeg|png|webp)$/i.test(f)) : [];
assert(images.length >= 30, `public/fighters contains >=30 images (got ${images.length})`);

// 4) News endpoint (requires dev server running or SITE_URL set)
const base = process.env.SITE_URL || 'http://localhost:3000';
console.log('ℹ️  Checking news endpoint at', base);
const url = new URL('/api/v1/news', base).toString();

http.get(url, (res) => {
  let data=''; res.on('data', d=>data+=d);
  res.on('end', ()=> {
    try {
      const j = JSON.parse(data);
      const items = (j.items||[]).filter(i=>i.image);
      assert(items.length >= 6, `news endpoint returns >=6 items with images (got ${items.length})`);
      console.log('🎉 Preflight passed. No placeholders.');
      process.exit(0);
    } catch (e) {
      console.error('❌ Failed to parse news JSON', e);
      process.exit(1);
    }
  });
}).on('error', (e)=>{ console.error('❌ Cannot reach dev server for news check:', e.message); process.exit(1); });
