// The 390 px wide variants of the phone captures (audit 2, finding 11): every
// phone capture in public/app (600 x 1298 or 780 x 1688; not the desk-* files,
// not the tiles) is written as public/app/{name}-390.webp, 390 x 844, quality
// 80. PhoneFrame.astro adds `/app/{name}-390.webp 390w` to the srcset whenever
// the file exists, so a 212 px phone on a 1x screen loads 390 px instead of
// 600 or 780. Run by hand with `npm run small` after adding a capture; the
// outputs are committed; `astro build` never runs it. Nothing outside this
// repo is read or written.
import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pub = join(root, "public", "app");
const names = readdirSync(pub)
  .filter((f) => f.endsWith(".webp") && !f.startsWith("desk-") && !/-(390|2x)\.webp$/.test(f))
  .map((f) => f.slice(0, -5));

let total = 0, n = 0;
for (const name of names) {
  const src = join(pub, `${name}.webp`);
  const meta = await sharp(src).metadata();
  if (!meta.width || meta.width < 600 || meta.height / meta.width < 2) continue; /* phone captures only */
  const out = join(pub, `${name}-390.webp`);
  await sharp(src).resize(390, Math.round((390 * meta.height) / meta.width)).webp({ quality: 80 }).toFile(out);
  const kb = statSync(out).size / 1024;
  total += kb; n++;
  console.log(`${name}-390.webp ${kb.toFixed(1)} KB (from ${(statSync(src).size / 1024).toFixed(1)} KB)`);
}
console.log(`${n} variants, ${total.toFixed(0)} KB`);
